import { Router } from 'express';
import * as theatreController from '../controllers/theatre.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = Router();

// Public theatre routes (Spec B4, Phase 4)
router.get('/cities', cacheMiddleware(120), theatreController.getCities);
router.get('/', cacheMiddleware(60), theatreController.listTheatres);
router.get('/:id', validate(idParamSchema), theatreController.getTheatreById);

export default router;
