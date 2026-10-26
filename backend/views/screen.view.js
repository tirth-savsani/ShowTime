/**
 * Screen Serializer View (Spec B1, B3, B4)
 */
export const serializeScreen = (screen) => {
  if (!screen) return null;
  const doc = screen.toObject ? screen.toObject() : screen;

  return {
    id: doc._id ? doc._id.toString() : doc.id,
    theatre: doc.theatre ? (doc.theatre._id ? doc.theatre._id.toString() : doc.theatre.toString()) : null,
    theatreDetails: doc.theatre && doc.theatre.name ? {
      id: doc.theatre._id.toString(),
      name: doc.theatre.name,
      city: doc.theatre.city,
    } : undefined,
    name: doc.name,
    layout: doc.layout || { rows: [] },
    totalSeats: doc.totalSeats || 0,
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
};

export default {
  serializeScreen,
};
