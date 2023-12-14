import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Dependencies, Request, Response } from '@/types';
import fetch from 'node-fetch';
import randomstring from 'randomstring';

import jwt from 'jsonwebtoken';
import upload from 'express-fileupload';

import bodyParser from 'body-parser';

import crypto from 'crypto';

export default async (deps: Dependencies) => {
  const { db, app, httpServer, userManager } = deps;

  // Middleware
  app.use(morgan('tiny'));
  app.use(cors());

  // 10mb limit
  app.use(
    upload({
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  );

  // Index
  app.get('/', async (req: Request, res: Response) => {
    return res.send('Hello world.');
  });

  return app;
};
