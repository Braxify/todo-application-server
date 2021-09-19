const { model, Schema } = require('mongoose');

const Todo = new Schema({
  title: {
    type: 'String',
    required: true,
  },
  color: {
    type: 'String',
    required: true,
  },
  isCheck: {
    type: 'Boolean',
    default: false,
  },
  deadline: {
    type: 'Date',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

Todo.methods.check = function () {
  this.isCheck = true;
  return this.save();
};

Todo.methods.uncheck = function () {
  this.isCheck = false;
  return this.save();
};

module.exports = model('Todo', Todo);
