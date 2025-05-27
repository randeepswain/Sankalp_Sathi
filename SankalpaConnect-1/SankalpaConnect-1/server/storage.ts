import {
  users,
  companions,
  tasks,
  taskFeedback,
  notifications,
  emergencyAlerts,
  locationTracking,
  type User,
  type UpsertUser,
  type Companion,
  type InsertCompanion,
  type Task,
  type InsertTask,
  type TaskFeedback,
  type InsertTaskFeedback,
  type Notification,
  type InsertNotification,
  type EmergencyAlert,
  type InsertEmergencyAlert,
  type LocationTracking,
  type InsertLocationTracking,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, or, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Companion operations
  getCompanion(id: number): Promise<Companion | undefined>;
  getCompanionByUserId(userId: string): Promise<Companion | undefined>;
  createCompanion(companion: InsertCompanion): Promise<Companion>;
  updateCompanion(id: number, updates: Partial<InsertCompanion>): Promise<Companion>;
  getNearbyCompanions(lat: number, lng: number, radius: number): Promise<(Companion & { user: User })[]>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTasksByCompanionId(companionId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  getActiveTasks(userId: string): Promise<Task[]>;
  
  // Feedback operations
  createTaskFeedback(feedback: InsertTaskFeedback): Promise<TaskFeedback>;
  getTaskFeedback(taskId: number): Promise<TaskFeedback[]>;
  getCompanionFeedback(companionId: number): Promise<TaskFeedback[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  
  // Emergency operations
  createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlert>;
  getActiveEmergencyAlerts(): Promise<EmergencyAlert[]>;
  updateEmergencyAlert(id: number, updates: Partial<InsertEmergencyAlert>): Promise<EmergencyAlert>;
  
  // Location operations
  updateLocation(tracking: InsertLocationTracking): Promise<LocationTracking>;
  getLatestLocation(userId: string): Promise<LocationTracking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Companion operations
  async getCompanion(id: number): Promise<Companion | undefined> {
    const [companion] = await db.select().from(companions).where(eq(companions.id, id));
    return companion;
  }

  async getCompanionByUserId(userId: string): Promise<Companion | undefined> {
    const [companion] = await db.select().from(companions).where(eq(companions.userId, userId));
    return companion;
  }

  async createCompanion(companion: InsertCompanion): Promise<Companion> {
    const [newCompanion] = await db.insert(companions).values(companion).returning();
    return newCompanion;
  }

  async updateCompanion(id: number, updates: Partial<InsertCompanion>): Promise<Companion> {
    const [companion] = await db
      .update(companions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companions.id, id))
      .returning();
    return companion;
  }

  async getNearbyCompanions(lat: number, lng: number, radius: number): Promise<(Companion & { user: User })[]> {
    // Simplified query - in production would use PostGIS for accurate distance calculation
    const results = await db
      .select()
      .from(companions)
      .innerJoin(users, eq(companions.userId, users.id))
      .where(and(
        eq(companions.isAvailable, true),
        eq(companions.backgroundCheckStatus, "approved")
      ))
      .orderBy(desc(companions.rating))
      .limit(10);

    return results.map(result => ({
      ...result.companions,
      user: result.users,
    }));
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByCompanionId(companionId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.companionId, companionId)).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async getActiveTasks(userId: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        inArray(tasks.status, ["pending", "assigned", "in_progress"])
      ))
      .orderBy(desc(tasks.createdAt));
  }

  // Feedback operations
  async createTaskFeedback(feedback: InsertTaskFeedback): Promise<TaskFeedback> {
    const [newFeedback] = await db.insert(taskFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getTaskFeedback(taskId: number): Promise<TaskFeedback[]> {
    return db.select().from(taskFeedback).where(eq(taskFeedback.taskId, taskId));
  }

  async getCompanionFeedback(companionId: number): Promise<TaskFeedback[]> {
    return db
      .select()
      .from(taskFeedback)
      .where(eq(taskFeedback.companionId, companionId))
      .orderBy(desc(taskFeedback.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Emergency operations
  async createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlert> {
    const [newAlert] = await db.insert(emergencyAlerts).values(alert).returning();
    return newAlert;
  }

  async getActiveEmergencyAlerts(): Promise<EmergencyAlert[]> {
    return db
      .select()
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.status, "active"))
      .orderBy(desc(emergencyAlerts.createdAt));
  }

  async updateEmergencyAlert(id: number, updates: Partial<InsertEmergencyAlert>): Promise<EmergencyAlert> {
    const [alert] = await db
      .update(emergencyAlerts)
      .set(updates)
      .where(eq(emergencyAlerts.id, id))
      .returning();
    return alert;
  }

  // Location operations
  async updateLocation(tracking: InsertLocationTracking): Promise<LocationTracking> {
    const [location] = await db.insert(locationTracking).values(tracking).returning();
    return location;
  }

  async getLatestLocation(userId: string): Promise<LocationTracking | undefined> {
    const [location] = await db
      .select()
      .from(locationTracking)
      .where(eq(locationTracking.userId, userId))
      .orderBy(desc(locationTracking.createdAt))
      .limit(1);
    return location;
  }
}

export const storage = new DatabaseStorage();
