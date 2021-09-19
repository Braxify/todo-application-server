const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const SECRET = require('config').get('JWT_ACCESS_SECRET');

// Models
const Todo = require('../models/Todo');

class TodosController {
  // Получение всех todo определенного пользолвателя +
  async all(req, res) {
    try {
      const { id: author } = req.params;
      const todos = await Todo.find({ author });
      res.status(200).json(todos);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Получение todo +
  async getTodo(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findById(id);

      if (todo === null) {
        res.status(404).json({ message: 'Not found' });
        return;
      }

      const { author } = todo;

      // Проверка на доступ
      const token = req.headers.authorization.split(' ')[1];
      const tokenId = jwt.verify(token, SECRET).id;
      if (String(author) !== tokenId) {
        res.status(401).json({ message: 'Access denied' });
        return;
      }

      res.status(200).json(todo);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Создание Todo +
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
        return;
      }

      const { title, deadline, author, color } = req.body;

      const todo = await new Todo({
        title,
        color,
        deadline,
        author,
      });

      todo.save();

      res.status(201).json({ message: 'Todo created', todo });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Переключение состояния check +
  async check(req, res) {
    try {
      const { id } = req.params;

      const todo = await Todo.findById(id);

      if (todo === null) {
        res.status(404).json({ message: 'Not found' });
      }

      if (!todo.isCheck) {
        await todo.check();
        res.status(200).json({ message: 'Todo checked as completed' });
      } else {
        await todo.uncheck();
        res.status(200).json({ message: 'Todo checked as not completed' });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Редактирование +
  async edit(req, res) {
    try {
      const { id } = req.params;

      if (!Object.keys(req.body).length) {
        res.status(400).json({ message: 'Request body is empty' });
        return;
      }

      const result = await Todo.findByIdAndUpdate(id, req.body);

      if (!result) {
        res.status(200).json({ message: 'Todo not found' });
        return;
      }

      res.status(200).json({
        message: 'Todo changed',
        todo: {
          // eslint-disable-next-line node/no-unsupported-features/es-syntax
          ...result._doc,
          title: req.body.title,
          color: req.body.color,
          deadline: req.body.deadline,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  // Удаление +
  async remove(req, res) {
    try {
      const { id } = req.params;

      const result = await Todo.findByIdAndDelete(id);

      if (!result) {
        res.status(200).json({ message: 'Todo not found' });
        return;
      }

      res.status(200).json({ message: 'Todo successfully removed' });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
}

module.exports = new TodosController();
