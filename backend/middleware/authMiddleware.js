const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and check user roles
const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Check if JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
      }

      // Get token from header
      const authHeader = req.header('Authorization');
      console.log('Authorization Header:', authHeader ? 'Present' : 'Missing');
      
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully for user ID:', decoded.id);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User found:', user.email, 'Role:', user.role);

      // Normalize user role (trim whitespace and ensure proper case)
      const normalizedUserRole = user.role ? user.role.trim() : '';
      const normalizedAllowedRoles = allowedRoles.map(role => role.trim());

      // Check if user role is allowed
      if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(normalizedUserRole)) {
        console.error(`Access denied. User role '${normalizedUserRole}' not in allowed roles:`, normalizedAllowedRoles);
        console.error('User object:', JSON.stringify(user, null, 2));
        console.error('Request URL:', req.originalUrl);
        console.error('Request Method:', req.method);
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          userRole: normalizedUserRole,
          allowedRoles: normalizedAllowedRoles,
          endpoint: `${req.method} ${req.originalUrl}`
        });
      }

      // Attach user to request
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err.name, err.message);
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token is not valid', error: err.message });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired', error: err.message });
      }
      
      res.status(401).json({ message: 'Token is not valid', error: err.message });
    }
  };
};

module.exports = authMiddleware;

