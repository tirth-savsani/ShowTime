import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes with strict rate limiting (Spec B8)
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);

export default router;
