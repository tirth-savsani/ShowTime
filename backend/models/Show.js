import mongoose from 'mongoose';
import { SHOW_STATUSES } from '../config/constants.js';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen reference is required'],
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    format: {
      type: String,
      required: [true, 'Format is required'],
      trim: true,
    },
    pricing: {
      type: Map,
      of: Number,
      required: [true, 'Pricing map is required'],
    },
    status: {
      type: String,
      enum: Object.values(SHOW_STATUSES),
      default: SHOW_STATUSES.SCHEDULED,
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes (Spec B3)
showSchema.index({ movie: 1, city: 1, startTime: 1 });
showSchema.index({ screen: 1, startTime: 1, endTime: 1 });
showSchema.index({ theatre: 1, startTime: 1 });

export const Show = mongoose.model('Show', showSchema);
export default Show;
