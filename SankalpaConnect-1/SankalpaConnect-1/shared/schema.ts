import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("user"), // 'user', 'companion', 'admin'
  isVerified: boolean("is_verified").default(false),
  disabilityType: varchar("disability_type"),
  accessibilityNeeds: text("accessibility_needs"),
  medicalInfo: text("medical_info"),
  preferredLanguage: varchar("preferred_language").default("en"),
  emergencyContacts: jsonb("emergency_contacts"),
  location: jsonb("location"), // { lat, lng, address }
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialties: text("specialties").array(),
  certifications: jsonb("certifications"),
  backgroundCheckStatus: varchar("background_check_status").default("pending"),
  rating: real("rating").default(0),
  totalTasks: integer("total_tasks").default(0),
  isAvailable: boolean("is_available").default(false),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  servicesOffered: text("services_offered").array(),
  workRadius: integer("work_radius").default(5), // miles
  verificationDocuments: jsonb("verification_documents"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companionId: integer("companion_id").references(() => companions.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  taskType: varchar("task_type").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'emergency'
  scheduledTime: timestamp("scheduled_time"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  location: jsonb("location"),
  attachments: jsonb("attachments"),
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  cost: decimal("cost", { precision: 10, scale: 2 }),
  specialRequirements: text("special_requirements"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const taskFeedback = pgTable("task_feedback", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  companionId: integer("companion_id").notNull().references(() => companions.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  voiceMemo: varchar("voice_memo_url"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'task_update', 'companion_status', 'emergency', 'general'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").default("normal"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'sos', 'fall_detection', 'medical'
  location: jsonb("location").notNull(),
  status: varchar("status").notNull().default("active"), // 'active', 'resolved', 'false_alarm'
  responderId: varchar("responder_id").references(() => users.id),
  responseTime: timestamp("response_time"),
  notes: text("notes"),
  contactsNotified: jsonb("contacts_notified"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  location: jsonb("location").notNull(),
  accuracy: real("accuracy"),
  isSharing: boolean("is_sharing").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  companionProfile: one(companions, {
    fields: [users.id],
    references: [companions.userId],
  }),
  tasks: many(tasks),
  notifications: many(notifications),
  emergencyAlerts: many(emergencyAlerts),
  locationTracking: many(locationTracking),
  feedback: many(taskFeedback),
}));

export const companionsRelations = relations(companions, ({ one, many }) => ({
  user: one(users, {
    fields: [companions.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  feedback: many(taskFeedback),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  companion: one(companions, {
    fields: [tasks.companionId],
    references: [companions.id],
  }),
  feedback: many(taskFeedback),
}));

export const taskFeedbackRelations = relations(taskFeedback, ({ one }) => ({
  task: one(tasks, {
    fields: [taskFeedback.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskFeedback.userId],
    references: [users.id],
  }),
  companion: one(companions, {
    fields: [taskFeedback.companionId],
    references: [companions.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const emergencyAlertsRelations = relations(emergencyAlerts, ({ one }) => ({
  user: one(users, {
    fields: [emergencyAlerts.userId],
    references: [users.id],
  }),
  responder: one(users, {
    fields: [emergencyAlerts.responderId],
    references: [users.id],
  }),
}));

export const locationTrackingRelations = relations(locationTracking, ({ one }) => ({
  user: one(users, {
    fields: [locationTracking.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [locationTracking.taskId],
    references: [tasks.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCompanionSchema = createInsertSchema(companions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskFeedbackSchema = createInsertSchema(taskFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertLocationTrackingSchema = createInsertSchema(locationTracking).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Companion = typeof companions.$inferSelect;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskFeedback = typeof taskFeedback.$inferSelect;
export type InsertTaskFeedback = z.infer<typeof insertTaskFeedbackSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;

export type LocationTracking = typeof locationTracking.$inferSelect;
export type InsertLocationTracking = z.infer<typeof insertLocationTrackingSchema>;
