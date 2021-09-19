const mongoose = require('mongoose');

const { isValid } = mongoose.Types.ObjectId;

module.exports = (req, res, next) => {
  const { id } = req.params;

  if (isValid(id)) {
    next();
  } else {
    res.status(400).json({ message: 'Non-valid MongoDB ID' });
  }
};
