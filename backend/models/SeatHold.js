import mongoose from 'mongoose';

const seatHoldSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
    },
    seatId: {
      type: String,
      required: [true, 'Seat ID is required'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
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
// 1. Unique index on (show, seatId) ensures no two holds can exist on the same seat
seatHoldSchema.index({ show: 1, seatId: 1 }, { unique: true });
// 2. TTL index on expiresAt
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// 3. User holds lookup
seatHoldSchema.index({ user: 1, show: 1 });

export const SeatHold = mongoose.model('SeatHold', seatHoldSchema);
export default SeatHold;
