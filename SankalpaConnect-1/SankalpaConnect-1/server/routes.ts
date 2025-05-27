import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertTaskFeedbackSchema, insertEmergencyAlertSchema, insertLocationTrackingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        ...updates,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Companion routes
  app.get('/api/companions/nearby', isAuthenticated, async (req: any, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Location coordinates required" });
      }
      
      const companions = await storage.getNearbyCompanions(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseInt(radius as string)
      );
      
      res.json(companions);
    } catch (error) {
      console.error("Error fetching nearby companions:", error);
      res.status(500).json({ message: "Failed to fetch companions" });
    }
  });

  app.post('/api/companions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companionData = {
        ...req.body,
        userId,
      };
      
      const companion = await storage.createCompanion(companionData);
      res.json(companion);
    } catch (error) {
      console.error("Error creating companion profile:", error);
      res.status(500).json({ message: "Failed to create companion profile" });
    }
  });

  app.get('/api/companions/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companion = await storage.getCompanionByUserId(userId);
      res.json(companion);
    } catch (error) {
      console.error("Error fetching companion profile:", error);
      res.status(500).json({ message: "Failed to fetch companion profile" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId,
      });
      
      const task = await storage.createTask(taskData);
      
      // Notify nearby companions via WebSocket
      broadcastToCompanions('new_task', { task });
      
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getActiveTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching active tasks:", error);
      res.status(500).json({ message: "Failed to fetch active tasks" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      
      // Notify user and companion via WebSocket
      broadcastTaskUpdate(task);
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Feedback routes
  app.post('/api/tasks/:id/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskId = parseInt(req.params.id);
      
      const feedbackData = insertTaskFeedbackSchema.parse({
        ...req.body,
        userId,
        taskId,
      });
      
      const feedback = await storage.createTaskFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Emergency routes
  app.post('/api/emergency', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = insertEmergencyAlertSchema.parse({
        ...req.body,
        userId,
      });
      
      const alert = await storage.createEmergencyAlert(alertData);
      
      // Broadcast emergency alert
      broadcastEmergencyAlert(alert);
      
      res.json(alert);
    } catch (error) {
      console.error("Error creating emergency alert:", error);
      res.status(500).json({ message: "Failed to create emergency alert" });
    }
  });

  // Location tracking routes
  app.post('/api/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locationData = insertLocationTrackingSchema.parse({
        ...req.body,
        userId,
      });
      
      const location = await storage.updateLocation(locationData);
      
      // Broadcast location update
      broadcastLocationUpdate(userId, location);
      
      res.json(location);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          userId = message.userId;
          clients.set(userId, ws);
          console.log(`User ${userId} connected to WebSocket`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  // Helper functions for broadcasting
  function broadcastToCompanions(type: string, data: any) {
    const message = JSON.stringify({ type, data });
    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function broadcastTaskUpdate(task: any) {
    const message = JSON.stringify({ type: 'task_update', data: { task } });
    
    // Send to task creator
    const userClient = clients.get(task.userId);
    if (userClient && userClient.readyState === WebSocket.OPEN) {
      userClient.send(message);
    }
    
    // Send to assigned companion
    if (task.companionId) {
      // Would need to get companion's userId - simplified for now
      broadcastToCompanions('task_update', { task });
    }
  }

  function broadcastEmergencyAlert(alert: any) {
    const message = JSON.stringify({ type: 'emergency_alert', data: { alert } });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function broadcastLocationUpdate(userId: string, location: any) {
    const message = JSON.stringify({ type: 'location_update', data: { userId, location } });
    clients.forEach((client, clientUserId) => {
      if (client.readyState === WebSocket.OPEN && clientUserId !== userId) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
