import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';
import * as showController from '../controllers/show.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  listMoviesQuerySchema,
  movieSectionsQuerySchema,
  suggestMoviesQuerySchema,
} from '../validators/movie.validator.js';
import { listPublicShowsQuerySchema } from '../validators/show.validator.js';
import { idParamSchema } from '../validators/common.validator.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = Router();

// Public catalogue routes (Spec B4, Phase 4)
router.get('/sections', validate(movieSectionsQuerySchema), cacheMiddleware(60), movieController.getSections);
router.get('/suggest', validate(suggestMoviesQuerySchema), cacheMiddleware(30), movieController.suggestMovies);
router.get('/featured', cacheMiddleware(60), movieController.getFeatured);
router.get('/', validate(listMoviesQuerySchema), cacheMiddleware(30), movieController.listMovies);
router.get('/:id/shows', validate(listPublicShowsQuerySchema), showController.getMovieShows);
router.get('/:id', validate(idParamSchema), movieController.getMovieById);

export default router;
