import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import { USER_ROLES } from '../config/constants.js';
import { validate } from '../middlewares/validate.js';
import { movieUpload } from '../middlewares/upload.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createMovieSchema,
  updateMovieSchema,
} from '../validators/movie.validator.js';
import {
  createTheatreSchema,
  updateTheatreSchema,
  updateTheatreStatusSchema,
} from '../validators/theatre.validator.js';
import {
  createScreenSchema,
  updateScreenSchema,
} from '../validators/screen.validator.js';
import * as movieController from '../controllers/movie.controller.js';
import * as theatreController from '../controllers/theatre.controller.js';
import * as screenController from '../controllers/screen.controller.js';
import { sendSuccess } from '../views/response.js';

const router = Router();

// Protect all admin routes with authentication and admin role (Spec B8)
router.use(authenticate, authorizeRoles(USER_ROLES.ADMIN));

router.get('/test', (req, res) => {
  return sendSuccess(res, 200, 'Admin authorized access');
});

// Admin Movies (Spec B4)
router.get('/movies', movieController.listAdminMovies);
router.get('/movies/:id', validate(idParamSchema), movieController.getAdminMovieById);
router.post(
  '/movies',
  movieUpload,
  validate(createMovieSchema),
  movieController.createMovie
);
router.put(
  '/movies/:id',
  validate(idParamSchema),
  movieUpload,
  validate(updateMovieSchema),
  movieController.updateMovie
);
router.delete(
  '/movies/:id',
  validate(idParamSchema),
  movieController.deleteMovie
);

// Admin Theatres (Spec B4)
router.get('/theatres', theatreController.listAdminTheatres);
router.post(
  '/theatres',
  validate(createTheatreSchema),
  theatreController.createTheatre
);
router.put(
  '/theatres/:id',
  validate(idParamSchema),
  validate(updateTheatreSchema),
  theatreController.updateTheatre
);
router.patch(
  '/theatres/:id/status',
  validate(idParamSchema),
  validate(updateTheatreStatusSchema),
  theatreController.updateStatus
);

// Admin Screens (Spec B4)
router.get('/screens', screenController.listScreens);
router.post(
  '/screens',
  validate(createScreenSchema),
  screenController.createScreen
);
router.put(
  '/screens/:id',
  validate(idParamSchema),
  validate(updateScreenSchema),
  screenController.updateScreen
);

export default router;
