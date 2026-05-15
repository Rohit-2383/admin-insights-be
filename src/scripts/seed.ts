/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from "../db/mongoose";
import { AuthUserModel } from "../modules/auth/auth.model";
import { DashboardUserModel } from "../modules/users/users.model";
import { OrderModel, type OrderStatus } from "../modules/orders/orders.model";
import { ProductModel } from "../modules/products/products.model";
import { SaleModel } from "../modules/sales/sales.model";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number): Date => new Date(Date.now() - days * DAY_MS);

const products = [
  {
    name: "Wireless Earbuds",
    category: "Electronics",
    price: 59.99,
    stock: 143,
    sales: 1200,
    imageUrl:
      "https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Leather Wallet",
    category: "Accessories",
    price: 39.99,
    stock: 89,
    sales: 800,
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    price: 199.99,
    stock: 56,
    sales: 650,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Yoga Mat",
    category: "Fitness",
    price: 29.99,
    stock: 210,
    sales: 950,
    imageUrl:
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Coffee Maker",
    category: "Home",
    price: 79.99,
    stock: 78,
    sales: 720,
    imageUrl:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Running Shoes",
    category: "Fitness",
    price: 89.99,
    stock: 32,
    sales: 540,
    imageUrl: "",
  },
  {
    name: "Backpack",
    category: "Accessories",
    price: 49.99,
    stock: 18,
    sales: 410,
    imageUrl: "",
  },
];

const dashboardUsers = [
  { name: "John Doe", email: "john@example.com", role: "Customer", status: "Active" as const },
  { name: "Jane Smith", email: "jane@example.com", role: "Admin", status: "Active" as const },
  { name: "Bob Johnson", email: "bob@example.com", role: "Customer", status: "Inactive" as const },
  { name: "Alice Brown", email: "alice@example.com", role: "Customer", status: "Active" as const },
  { name: "Charlie Wilson", email: "charlie@example.com", role: "Moderator", status: "Active" as const },
];

const orderSeeds: Array<{
  customer: string;
  total: number;
  status: OrderStatus;
  daysAgo: number;
}> = [
  { customer: "John Doe", total: 235.4, status: "Delivered", daysAgo: 7 },
  { customer: "Jane Smith", total: 412, status: "Processing", daysAgo: 6 },
  { customer: "Bob Johnson", total: 162.5, status: "Shipped", daysAgo: 5 },
  { customer: "Alice Brown", total: 750.2, status: "Pending", daysAgo: 4 },
  { customer: "Charlie Wilson", total: 95.8, status: "Delivered", daysAgo: 3 },
  { customer: "Eva Martinez", total: 310.75, status: "Processing", daysAgo: 2 },
  { customer: "David Lee", total: 528.9, status: "Shipped", daysAgo: 1 },
  { customer: "Grace Taylor", total: 189.6, status: "Delivered", daysAgo: 0 },
];

const generateSales = (productCatalog: typeof products) => {
  const sales: Array<{
    productName: string;
    category: string;
    amount: number;
    quantity: number;
    occurredAt: Date;
  }> = [];

  // ~3 sales per day for last 60 days = decent time-series for charts
  for (let day = 0; day < 60; day += 1) {
    for (let i = 0; i < 3; i += 1) {
      const product = productCatalog[(day * 3 + i) % productCatalog.length];
      if (!product) continue;
      const quantity = 1 + ((day + i) % 4);
      sales.push({
        productName: product.name,
        category: product.category,
        amount: product.price * quantity,
        quantity,
        occurredAt: daysAgo(day),
      });
    }
  }

  return sales;
};

const seed = async (): Promise<void> => {
  await connectDatabase();

  console.log("[seed] clearing collections...");
  await Promise.all([
    AuthUserModel.deleteMany({}),
    ProductModel.deleteMany({}),
    DashboardUserModel.deleteMany({}),
    OrderModel.deleteMany({}),
    SaleModel.deleteMany({}),
  ]);

  console.log("[seed] inserting admin auth user...");
  const passwordHash = await AuthUserModel.hashPassword("password123");
  await AuthUserModel.create({
    firstName: "Admin",
    lastName: "User",
    age: 30,
    email: "admin@example.com",
    location: "Remote",
    businessType: "TECHNOLOGY",
    role: "admin",
    passwordHash,
  });

  console.log("[seed] inserting products...");
  await ProductModel.insertMany(products);

  console.log("[seed] inserting dashboard users...");
  await DashboardUserModel.insertMany(dashboardUsers);

  console.log("[seed] inserting orders...");
  await OrderModel.insertMany(
    orderSeeds.map((o) => ({
      customer: o.customer,
      total: o.total,
      status: o.status,
      occurredAt: daysAgo(o.daysAgo),
    })),
  );

  console.log("[seed] inserting sales line items...");
  await SaleModel.insertMany(generateSales(products));

  console.log("[seed] done");
  console.log("        login: admin@example.com / password123");
};

seed()
  .catch((error) => {
    console.error("[seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
