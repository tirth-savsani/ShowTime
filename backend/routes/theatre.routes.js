import { Router } from 'express';
import * as theatreController from '../controllers/theatre.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

// Public theatre routes (Spec B4)
router.get('/', theatreController.listTheatres);
router.get('/:id', validate(idParamSchema), theatreController.getTheatreById);

export default router;
