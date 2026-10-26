import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { USER_ROLES } from '../config/constants.js';
import { sendSuccess } from '../views/response.js';

const router = Router();

// Protect all admin routes with authentication and admin role (Spec B8)
router.use(authenticate, authorizeRoles(USER_ROLES.ADMIN));

router.get('/test', (req, res) => {
  return sendSuccess(res, 200, 'Admin authorized access');
});

export default router;
