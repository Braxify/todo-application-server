const jwt = require('jsonwebtoken');
const config = require('config');

// Константы
const SECRET = config.get('JWT_ACCESS_SECRET');

// Models
const Todo = require('../models/Todo');

module.exports = async (req, res, next) => {
  if (req.headers.method === 'OPTIONS') {
    next();
    return;
  }

  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ message: 'Not found authorization header' });
    return;
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  let userId;
  try {
    const verified = jwt.verify(token, SECRET);
    userId = verified.userDto.id;
  } catch (e) {
    res.status(401).json({ message: 'Access token expired' });
    return;
  }

  next();
};
