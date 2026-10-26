import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { sanitize } from './middlewares/sanitize.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// 1. Trust proxy (Spec B8 - required on Render / reverse proxies for secure cookies)
app.set('trust proxy', 1);

// 2. Security headers with Helmet
app.use(helmet());

// 3. CORS configuration with allow-list
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// 4. Logging with Morgan
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 5. Razorpay Webhook Raw Route Placeholder (BEFORE json parser as required by Spec B8)
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Placeholder handler - to be completed in Payment task
    res.status(200).json({ received: true });
  }
);

// 6. Parsers and Sanitization
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(sanitize);

// 7. Global Rate Limiter
app.use(globalLimiter);

// 8. Health Check Route (Spec B4)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

// 9. Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to ShowTime API',
    docs: '/api/docs',
    health: '/health',
  });
});

// 10. API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 11. 404 Handler for undefined routes
app.use(notFound);

// 12. Centralized Error Handler
app.use(errorHandler);

export default app;
