import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
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
// 1. UNIQUE(show, seatId) is the final arbiter against double booking
bookedSeatSchema.index({ show: 1, seatId: 1 }, { unique: true });
// 2. Query all booked seats for a booking
bookedSeatSchema.index({ booking: 1 });

export const BookedSeat = mongoose.model('BookedSeat', bookedSeatSchema);
export default BookedSeat;
