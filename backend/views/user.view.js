/**
 * User Serializer View (Spec B1, B3)
 * Guarantees passwordHash, internal fields (__v), and secrets are never returned.
 */
export const serializeUser = (user) => {
  if (!user) return null;

  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    isActive: user.isActive !== undefined ? user.isActive : true,
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
  };
};

export default {
  serializeUser,
};
