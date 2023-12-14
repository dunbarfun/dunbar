import express from 'express';
import http from 'http';

import dbFactory from '@/lib/db';
import streamFactory from '@/lib/stream'
import userManagerFactory from '@/manager/userManager';
import channelManagerFactory from '@/manager/channelManager';
import messageManagerFactory from '@/manager/messageManager';
import bookmarkManagerFactory from '@/manager/bookmarkManager';

export default async () => {
  // Low level managers
  const app = express();
  const httpServer = http.createServer(app);
  const db = dbFactory();
  const stream = streamFactory()

  // Managers
  const channelManager = channelManagerFactory(db);
  const userManager = userManagerFactory(
    db,
    stream
  );
  const messageManager = messageManagerFactory(
    db,
  );
  const bookmarkManager = bookmarkManagerFactory(db);

  return {
    app,
    httpServer,
    db,
    stream,
    userManager,
    channelManager,
    messageManager,
    bookmarkManager,
  };
};
