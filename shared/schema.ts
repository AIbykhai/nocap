import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  user_id: text("user_id").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  item_name: text("item_name").notNull(),
  amount: integer("amount").notNull(),
  expense_date: text("expense_date").notNull(),
  category_id: integer("category_id").references(() => categories.id),
  recurrence: text("recurrence"),
  user_id: text("user_id").notNull(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  daily_budget: integer("daily_budget"),
  monthly_budget: integer("monthly_budget"),
  user_id: text("user_id").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  emoji: true,
  user_id: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  item_name: true,
  amount: true,
  expense_date: true,
  category_id: true,
  recurrence: true,
  user_id: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  daily_budget: true,
  monthly_budget: true,
  user_id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
