import {
  PrismaClient,
  User as PrismaUser,
  Character as PrismaCharacter,
  Message as PrismaMessage,
  Participant as PrismaParticipant,
} from '@prisma/client';
import stream from '@/lib/stream'
import {
  Application,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction,
  Router as ExpressRouter,
} from 'express';
import { Server } from 'http';

import type userManager from '@/manager/userManager';
import type channelManager from '@/manager/channelManager';
import type messageManager from '@/manager/messageManager';
import type bookmarkManager from '@/manager/bookmarkManager';

// Re-export express types
export interface Request extends ExpressRequest {
  userId?: string | null;
  user?: User | null;
}

export interface Response extends ExpressResponse {}
export interface NextFunction extends ExpressNextFunction {}
export interface Router extends ExpressRouter {}

/*
 Database
*/
export interface DatabaseClient extends PrismaClient {}
export interface User extends PrismaUser {}
export interface Character extends PrismaCharacter {}
export interface Message extends PrismaMessage {}
export interface Participant extends PrismaParticipant {}

export interface ModelData {
  description: string;
  greeting: string;
  howToBehave: string;
  conversations: string;
}

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/*
 Managers
*/
export type UserManager = ReturnType<typeof userManager>;
export type ChannelManager = ReturnType<typeof channelManager>;
export type MessageManager = ReturnType<typeof messageManager>;
export type BookmarkManager = ReturnType<typeof bookmarkManager>;
export type StreamClient = ReturnType<typeof stream>

/*
 Dependencies
*/
export interface Dependencies {
  app: Application;
  httpServer: Server;
  db: DatabaseClient;
  stream: StreamClient;
  userManager: UserManager;
  channelManager: ChannelManager;
  messageManager: MessageManager;
  bookmarkManager: BookmarkManager;
}
