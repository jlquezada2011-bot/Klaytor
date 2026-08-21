import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './src/server/routes/auth.js';
import patientRoutes from './src/server/routes/patients.js';
import appointmentRoutes from './src/server/routes/appointments.js';
import measurementRoutes from './src/server/routes/measurements.js';
import providerRoutes from './src/server/routes/providers.js';
import clinicRoutes from './src/server/routes/clinics.js';
import recordsRoutes from './src/server/routes/records.js';
import notificationRoutes from './src/server/routes/notifications.js';
import messageRoutes from './src/server/routes/messages.js';
import articleRoutes from './src/server/routes/articles.js';
import consentRoutes from './src/server/routes/consent.js';
import adminRoutes from './src/server/routes/admin.js';
import aiRoutes from './src/server/routes/ai.js';
import searchRoutes from './src/server/routes/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();
  const PORT = 3000;

  // Security and parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request logging and basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Klaytor Health Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/measurements', measurementRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/clinics', clinicRoutes);
  app.use('/api/records', recordsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/health-articles', articleRoutes);
  app.use('/api/consent', consentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/search', searchRoutes);

  // Global API error handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found.` });
  });

  // Vite development middleware vs production static files
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

  return { app, PORT };
}

// Start server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  createServer().then(({ app, PORT }) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🏥 Klaytor Digital Health Platform running at http://0.0.0.0:${PORT}`);
    });
  });
}
