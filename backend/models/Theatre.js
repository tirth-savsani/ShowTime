import mongoose from 'mongoose';

export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.toUpperCase() === 'NCR') return 'NCR';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      minlength: [2, 'Theatre name must be at least 2 characters'],
      maxlength: [80, 'Theatre name cannot exceed 80 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      set: toTitleCase,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 8,
        message: 'Amenities cannot exceed 8 items',
      },
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

// Pre-validate hook to ensure city is in Title Case before validation / unique index check
theatreSchema.pre('validate', function () {
  if (this.city) {
    this.city = toTitleCase(this.city);
  }
});

// Compound unique index on city and name (Spec B3)
theatreSchema.index({ city: 1, name: 1 }, { unique: true });

export const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;
