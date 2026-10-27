import { z } from 'zod';
import {
  ALLOWED_GENRES,
  ALLOWED_LANGUAGES,
  ALLOWED_FORMATS,
  ALLOWED_CERTIFICATES,
} from '../models/Movie.js';
import { MOVIE_STATUSES } from '../config/constants.js';

const parseJsonIfNeeded = (val) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

// Strips HTML tags from string
const stripHtml = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/<[^>]*>?/gm, '').trim();
};

const castSchema = z.object({
  name: z
    .string({ required_error: 'Cast name is required' })
    .trim()
    .min(1, 'Cast name must be at least 1 character')
    .max(60, 'Cast name cannot exceed 60 characters'),
  role: z.string().trim().max(60).optional().default('Actor'),
  imageUrl: z.string().trim().url('Invalid cast image URL').optional().or(z.literal('')),
});

export const createMovieSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .transform(stripHtml)
      .pipe(z.string().min(1, 'Title must be at least 1 character').max(120, 'Title cannot exceed 120 characters')),
    description: z
      .string({ required_error: 'Description is required' })
      .transform(stripHtml)
      .pipe(z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters')),
    genres: z
      .preprocess(parseJsonIfNeeded, z.array(z.enum(ALLOWED_GENRES, { errorMap: () => ({ message: 'Invalid genre' }) })))
      .refine((v) => v.length >= 1 && v.length <= 4, {
        message: 'A movie must have between 1 and 4 genres',
      }),
    languages: z
      .preprocess(parseJsonIfNeeded, z.array(z.enum(ALLOWED_LANGUAGES, { errorMap: () => ({ message: 'Invalid language' }) })))
      .refine((v) => v.length >= 1 && v.length <= 4, {
        message: 'A movie must have between 1 and 4 languages',
      }),
    formats: z
      .preprocess(
        parseJsonIfNeeded,
        z.array(z.enum(ALLOWED_FORMATS, { errorMap: () => ({ message: 'Invalid format' }) })).optional().default(['2D'])
      )
      .refine((v) => v.length >= 1, {
        message: 'A movie must support at least one format',
      }),
    durationMin: z
      .string()
      .or(z.number())
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(30, 'Duration must be at least 30 minutes').max(400, 'Duration cannot exceed 400 minutes')),
    releaseDate: z
      .string({ required_error: 'Release date is required' })
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid release date format' }),
    certificate: z.enum(ALLOWED_CERTIFICATES, {
      errorMap: () => ({ message: 'Certificate must be one of U, UA, A, S' }),
    }),
    trailerUrl: z
      .string()
      .trim()
      .url('Trailer URL must be a valid http(s) URL')
      .optional()
      .or(z.literal('')),
    cast: z
      .preprocess(parseJsonIfNeeded, z.array(castSchema).optional().default([]))
      .refine((v) => v.length <= 12, {
        message: 'Cast cannot exceed 12 members',
      }),
    status: z
      .enum(Object.values(MOVIE_STATUSES))
      .optional()
      .default(MOVIE_STATUSES.COMING_SOON),
  }),
});

export const updateMovieSchema = z.object({
  body: z.object({
    title: z
      .string()
      .transform(stripHtml)
      .pipe(z.string().min(1).max(120))
      .optional(),
    description: z
      .string()
      .transform(stripHtml)
      .pipe(z.string().min(10).max(2000))
      .optional(),
    genres: z
      .preprocess(parseJsonIfNeeded, z.array(z.enum(ALLOWED_GENRES)).optional())
      .refine((v) => !v || (v.length >= 1 && v.length <= 4), {
        message: 'A movie must have between 1 and 4 genres',
      }),
    languages: z
      .preprocess(parseJsonIfNeeded, z.array(z.enum(ALLOWED_LANGUAGES)).optional())
      .refine((v) => !v || (v.length >= 1 && v.length <= 4), {
        message: 'A movie must have between 1 and 4 languages',
      }),
    formats: z
      .preprocess(parseJsonIfNeeded, z.array(z.enum(ALLOWED_FORMATS)).optional())
      .refine((v) => !v || v.length >= 1, {
        message: 'A movie must support at least one format',
      }),
    durationMin: z
      .string()
      .or(z.number())
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(30).max(400))
      .optional(),
    releaseDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid release date format' })
      .optional(),
    certificate: z.enum(ALLOWED_CERTIFICATES).optional(),
    trailerUrl: z.string().trim().url().optional().or(z.literal('')),
    cast: z
      .preprocess(parseJsonIfNeeded, z.array(castSchema).optional())
      .refine((v) => !v || v.length <= 12, {
        message: 'Cast cannot exceed 12 members',
      }),
    status: z.enum(Object.values(MOVIE_STATUSES)).optional(),
  }),
});

export const listMoviesQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    genre: z.string().trim().optional(),
    language: z.string().trim().optional(),
    format: z.string().trim().optional(),
    status: z.string().trim().optional().default(MOVIE_STATUSES.NOW_SHOWING),
    city: z.string().trim().optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 12))
      .pipe(z.number().int().min(1).max(50)),
    sort: z.enum(['releaseDate', 'title']).optional().default('releaseDate'),
  }),
});

export const movieSectionsQuerySchema = z.object({
  query: z.object({
    city: z.string().trim().optional(),
  }),
});

export const suggestMoviesQuerySchema = z.object({
  query: z.object({
    q: z.string().trim().min(1, 'Search query is required').max(100),
  }),
});
