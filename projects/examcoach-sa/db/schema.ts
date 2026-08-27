import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  institution: text("institution").notNull().default("Walter Sisulu University"),
  assessmentLabel: text("assessment_label").notNull(),
  priceCents: integer("price_cents").notNull().default(4900),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  summary: text("summary").notNull(),
  minutes: integer("minutes").notNull().default(12),
  position: integer("position").notNull(),
  isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
  contentJson: text("content_json").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("lessons_module_slug_idx").on(table.moduleId, table.slug)]);

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  topic: text("topic").notNull(),
  prompt: text("prompt").notNull(),
  code: text("code"),
  optionsJson: text("options_json").notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  assessmentType: text("assessment_type").notNull().default("practice"),
  marks: integer("marks").notNull().default(2),
  status: text("status").notNull().default("published"),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  assessmentType: text("assessment_type").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  readiness: integer("readiness").notNull(),
  answersJson: text("answers_json").notNull(),
  completedAt: text("completed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("attempts_user_idx").on(table.userEmail)]);

export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  mastery: integer("mastery").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("progress_user_lesson_idx").on(table.userEmail, table.lessonId)]);

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  userEmail: text("user_email").notNull(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("ZAR"),
  provider: text("provider").notNull().default("paystack"),
  status: text("status").notNull().default("pending"),
  providerFeeCents: integer("provider_fee_cents"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  paidAt: text("paid_at"),
}, (table) => [index("purchases_user_idx").on(table.userEmail)]);

export const paymentEvents = sqliteTable("payment_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerEventKey: text("provider_event_key").notNull().unique(),
  eventType: text("event_type").notNull(),
  reference: text("reference"),
  receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const entitlements = sqliteTable("entitlements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  status: text("status").notNull().default("active"),
  source: text("source").notNull().default("purchase"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("entitlements_user_module_idx").on(table.userEmail, table.moduleId)]);

export const studyTasks = sqliteTable("study_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").notNull(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  minutes: integer("minutes").notNull(),
  status: text("status").notNull().default("todo"),
  dueDate: text("due_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("study_tasks_user_idx").on(table.userEmail)]);

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email"),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
