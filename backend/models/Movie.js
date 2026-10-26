import mongoose from 'mongoose';
import { MOVIE_STATUSES } from '../config/constants.js';

export const ALLOWED_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Thriller',
  'War',
];

export const ALLOWED_LANGUAGES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Punjabi',
  'Gujarati',
];

export const ALLOWED_FORMATS = ['2D', '3D', 'IMAX', '4DX'];
export const ALLOWED_CERTIFICATES = ['U', 'UA', 'A', 'S'];

const castMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cast member name is required'],
      trim: true,
      minlength: 1,
      maxlength: 60,
    },
    role: {
      type: String,
      trim: true,
      maxlength: 60,
      default: 'Actor',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 4,
        message: 'A movie must have between 1 and 4 genres',
      },
    },
    languages: {
      type: [String],
      required: [true, 'At least one language is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 4,
        message: 'A movie must have between 1 and 4 languages',
      },
    },
    formats: {
      type: [String],
      default: ['2D'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: 'A movie must support at least one format',
      },
    },
    durationMin: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [30, 'Duration must be at least 30 minutes'],
      max: [400, 'Duration cannot exceed 400 minutes'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    certificate: {
      type: String,
      required: [true, 'Certificate is required'],
      enum: {
        values: ALLOWED_CERTIFICATES,
        message: '{VALUE} is not a valid certificate',
      },
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    posterPublicId: {
      type: String,
      required: [true, 'Poster Cloudinary public ID is required'],
      trim: true,
    },
    backdropUrl: {
      type: String,
      trim: true,
      default: null,
    },
    backdropPublicId: {
      type: String,
      trim: true,
      default: null,
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: null,
    },
    cast: {
      type: [castMemberSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 12,
        message: 'Cast cannot exceed 12 members',
      },
    },
    status: {
      type: String,
      enum: Object.values(MOVIE_STATUSES),
      default: MOVIE_STATUSES.COMING_SOON,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
movieSchema.index({ title: 'text' });
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ languages: 1 });
movieSchema.index({ isDeleted: 1 });

export const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
