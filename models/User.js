const { model, Schema } = require('mongoose');

const User = new Schema({
  username: { type: 'String', unique: true, required: true },
  password: { type: 'String', required: true },
  firstName: { type: 'String', required: true },
  lastName: { type: 'String', required: true },
});

module.exports = model('User', User);
