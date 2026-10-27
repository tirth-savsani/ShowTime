import { Theatre, toTitleCase } from '../models/Theatre.js';
import { AppError } from '../utils/AppError.js';

export const listTheatres = async ({
  city,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const query = {
    isActive: true,
  };

  if (city && city.trim() !== '') {
    query.city = toTitleCase(city);
  }

  if (search && search.trim() !== '') {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const [items, total] = await Promise.all([
    Theatre.find(query).sort({ city: 1, name: 1 }).skip(skip).limit(parsedLimit),
    Theatre.countDocuments(query),
  ]);

  const pages = Math.ceil(total / parsedLimit) || 1;

  return {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages,
    },
  };
};

export const getDistinctCities = async () => {
  const cities = await Theatre.distinct('city', { isActive: true });
  return cities.sort((a, b) => a.localeCompare(b));
};

export const getTheatreById = async (id) => {
  const theatre = await Theatre.findOne({ _id: id, isActive: true });
  if (!theatre) {
    throw new AppError('Theatre not found', 404, 'NOT_FOUND');
  }
  return theatre;
};

export default {
  listTheatres,
  getDistinctCities,
  getTheatreById,
};
