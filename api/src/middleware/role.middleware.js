export function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ msg: 'Access denied: insufficient role' });
    }
    next();
  };
};
