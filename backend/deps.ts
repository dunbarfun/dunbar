import express from 'express';
import http from 'http';

import dbFactory from '@/lib/db';
import streamFactory from '@/lib/stream'
import userManagerFactory from '@/manager/userManager';

export default async () => {
  // Low level managers
  const app = express();
  const httpServer = http.createServer(app);
  const db = dbFactory();
  const stream = streamFactory()

  // Managers
  const userManager = userManagerFactory(
    db,
    stream
  );

  return {
    app,
    httpServer,
    db,
    stream,
    userManager,
  };
};
