import express from 'express';
import { getShowById } from '../controllers/show.controller.js';
import * as seatController from '../controllers/seat.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';
import { idParamSchema } from '../validators/common.validator.js';
import { holdSeatsSchema } from '../validators/seat.validator.js';

const router = express.Router();

// GET /api/shows/:id (Public)
router.get('/:id', validate(idParamSchema), getShowById);

// GET /api/shows/:id/seats (Public / Optional Auth for MINE status)
router.get('/:id/seats', optionalAuth, validate(idParamSchema), seatController.getSeatMap);

// POST /api/shows/:id/hold (User Auth: atomic seat hold)
router.post('/:id/hold', authenticate, validate(holdSeatsSchema), seatController.holdSeats);

// GET /api/shows/:id/hold (User Auth: get active user hold)
router.get('/:id/hold', authenticate, validate(idParamSchema), seatController.getUserHold);

// DELETE /api/shows/:id/hold (User Auth: release holds)
router.delete('/:id/hold', authenticate, validate(idParamSchema), seatController.releaseHold);

export default router;
