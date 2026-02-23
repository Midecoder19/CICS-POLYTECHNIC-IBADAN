const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Authenticate member token
const authenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Verify user exists and is a member
      const user = await User.findOne({
        _id: decoded.userId,
        role: 'member',
        isActive: true,
        activated: true
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid member token.'
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  } catch (error) {
    console.error('Member authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

module.exports = { authenticateMember };
