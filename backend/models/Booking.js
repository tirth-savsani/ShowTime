import mongoose from 'mongoose';
import {
  BOOKING_STATUSES,
  REFUND_STATUSES,
  CANCEL_REASONS,
  CURRENCY,
} from '../config/constants.js';

const bookingSeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const bookingSnapshotSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, required: true },
    movieTitle: { type: String, required: true },
    posterUrl: { type: String, required: true },
    certificate: { type: String, required: true },
    language: { type: String, required: true },
    format: { type: String, required: true },
    theatreName: { type: String, required: true },
    theatreAddress: { type: String, required: true },
    city: { type: String, required: true },
    screenName: { type: String, required: true },
    startTime: { type: Date, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    seats: {
      type: [bookingSeatSchema],
      required: true,
      validate: [
        (v) => Array.isArray(v) && v.length >= 1 && v.length <= 6,
        'Booking must contain between 1 and 6 seats',
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: CURRENCY,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      default: BOOKING_STATUSES.PENDING,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    razorpay: {
      orderId: { type: String, default: null },
      paymentId: { type: String, default: null },
      signature: { type: String, default: null },
    },
    refund: {
      id: { type: String, default: null },
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: Object.values(REFUND_STATUSES),
        default: REFUND_STATUSES.NONE,
      },
      at: { type: Date, default: null },
    },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: {
      type: String,
      enum: [...Object.values(CANCEL_REASONS), null],
      default: null,
    },
    snapshot: {
      type: bookingSnapshotSchema,
      required: true,
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
// bookingRef unique index defined in field schema
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ show: 1, status: 1 });
bookingSchema.index({ 'razorpay.orderId': 1 }, { unique: true, sparse: true });
bookingSchema.index({ status: 1, expiresAt: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
