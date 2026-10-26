import mongoose from 'mongoose';

const rowSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Row label is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{1,2}$/, 'Row label must be 1 or 2 uppercase letters'],
    },
    seatCount: {
      type: Number,
      required: [true, 'Seat count is required'],
      min: [1, 'Row must have at least 1 seat'],
      max: [30, 'Row cannot have more than 30 seats'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Category must be at least 2 characters'],
      maxlength: [20, 'Category cannot exceed 20 characters'],
    },
    aisleAfter: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
      minlength: [1, 'Screen name must be at least 1 character'],
      maxlength: [40, 'Screen name cannot exceed 40 characters'],
    },
    layout: {
      rows: {
        type: [rowSchema],
        required: [true, 'Screen layout rows are required'],
        validate: [
          {
            validator: (rows) => Array.isArray(rows) && rows.length >= 1 && rows.length <= 26,
            message: 'Screen must have between 1 and 26 rows',
          },
          {
            validator: (rows) => {
              const labels = rows.map((r) => r.label);
              return new Set(labels).size === labels.length;
            },
            message: 'Row labels must be unique within the screen',
          },
          {
            validator: (rows) => {
              const total = rows.reduce((sum, r) => sum + r.seatCount, 0);
              return total <= 600;
            },
            message: 'Total seats cannot exceed 600 seats',
          },
        ],
      },
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Pre-save hook to compute totalSeats automatically
screenSchema.pre('save', function () {
  if (this.layout && Array.isArray(this.layout.rows)) {
    this.totalSeats = this.layout.rows.reduce((sum, row) => sum + row.seatCount, 0);
  }
});

// Unique index on theatre and screen name (Spec B3)
screenSchema.index({ theatre: 1, name: 1 }, { unique: true });

export const Screen = mongoose.model('Screen', screenSchema);
export default Screen;
