import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KIDDO.AI Server running on port ${PORT}`);
  });
}

startServer();
