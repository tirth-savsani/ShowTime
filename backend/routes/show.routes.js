import express from 'express';
import { getShowById } from '../controllers/show.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = express.Router();

// GET /api/shows/:id
router.get('/:id', validate(idParamSchema), getShowById);

export default router;
