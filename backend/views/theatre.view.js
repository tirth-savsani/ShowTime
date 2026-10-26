/**
 * Theatre Serializer View (Spec B1, B3, B4)
 */
export const serializeTheatre = (theatre, screensCount = undefined) => {
  if (!theatre) return null;
  const doc = theatre.toObject ? theatre.toObject() : theatre;

  const serialized = {
    id: doc._id ? doc._id.toString() : doc.id,
    name: doc.name,
    city: doc.city,
    address: doc.address,
    amenities: doc.amenities || [],
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };

  if (screensCount !== undefined) {
    serialized.screensCount = screensCount;
  }

  return serialized;
};

export default {
  serializeTheatre,
};
