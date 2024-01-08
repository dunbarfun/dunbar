import {
  PrismaClient,
  User as PrismaUser,
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
export interface Participant extends PrismaParticipant {}

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/*
 Managers
*/
export type UserManager = ReturnType<typeof userManager>;
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
}
