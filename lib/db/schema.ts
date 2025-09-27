import { pgTable, text, timestamp, uuid, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Users table for authentication and profiles
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer, merchant, admin
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").default(false),
  medicalCard: text("medical_card"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Cannabis products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // flower, edibles, concentrates, etc.
  strain: text("strain"),
  thcContent: decimal("thc_content", { precision: 5, scale: 2 }),
  cbdContent: decimal("cbd_content", { precision: 5, scale: 2 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inventory: integer("inventory").default(0),
  images: jsonb("images").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => users.id),
  merchantId: uuid("merchant_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: jsonb("delivery_address").$type<{
    street: string
    city: string
    state: string
    zipCode: string
  }>(),
  orderItems:
    jsonb("order_items").$type<
      {
        productId: string
        quantity: number
        price: number
      }[]
    >(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),
  customerId: uuid("customer_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(users, {
    fields: [products.merchantId],
    references: [users.id],
  }),
  reviews: many(reviews),
}))

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  merchant: one(users, {
    fields: [orders.merchantId],
    references: [users.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}))
