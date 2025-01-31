import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { RecipeWithRelations } from '../types/recipe.js';

interface RecipeEvent {
  type: 'RECIPE_CREATED' | 'RECIPE_UPDATED' | 'RECIPE_DELETED';
  recipe?: RecipeWithRelations;
  message: string;
}

class WebSocketService {
  private io: SocketServer;
  private userSockets: Map<string, string[]> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connecté:', socket.id);

      socket.on('register', (userId: string) => {
        this.registerUser(socket.id, userId);
      });

      socket.on('disconnect', () => {
        this.removeSocket(socket.id);
        console.log('Client déconnecté:', socket.id);
      });
    });
  }

  private registerUser(socketId: string, userId: string) {
    const userSockets = this.userSockets.get(userId) || [];
    userSockets.push(socketId);
    this.userSockets.set(userId, userSockets);
    console.log(`Utilisateur ${userId} enregistré avec le socket ${socketId}`);
  }

  private removeSocket(socketId: string) {
    this.userSockets.forEach((sockets, userId) => {
      const index = sockets.indexOf(socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        } else {
          this.userSockets.set(userId, sockets);
        }
      }
    });
  }

  notifyRecipeEvent(userId: string, event: RecipeEvent) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit('recipe_event', event);
      });
    }
  }

  broadcastRecipeEvent(event: RecipeEvent) {
    this.io.emit('recipe_event', event);
  }
}

let instance: WebSocketService | null = null;

export const initializeWebSocket = (server: HttpServer) => {
  instance = new WebSocketService(server);
  return instance;
};

export const getWebSocketService = () => {
  if (!instance) {
    throw new Error('WebSocketService non initialisé');
  }
  return instance;
}; 