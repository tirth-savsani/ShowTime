import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';
import { validate } from '../middlewares/validate.js';
import { listMoviesQuerySchema } from '../validators/movie.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

// Public catalogue routes (Spec B4)
router.get('/', validate(listMoviesQuerySchema), movieController.listMovies);
router.get('/featured', movieController.getFeatured);
router.get('/:id', validate(idParamSchema), movieController.getMovieById);

export default router;
