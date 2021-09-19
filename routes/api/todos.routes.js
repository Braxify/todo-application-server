const router = require('express').Router();
const { Types } = require('mongoose');
const { check } = require('express-validator');

const controller = require('../../controllers/todos.controller');

// Middleware
const auth = require('../../middleware/auth.middleware');
const isMongoId = require('../../middleware/validate/isMongoId');

router.get('/all/:id', auth, isMongoId, controller.all);

router.get('/:id', auth, isMongoId, controller.getTodo);

router.post(
  '/',
  [
    check('title', 'Title is empty!').not().isEmpty(),
    check('deadline', 'Deadline field is empty!').not().isEmpty(),
    check('author', 'Non-valid author Id').custom((value) =>
      Types.ObjectId.isValid(value)
    ),
  ],
  controller.create
);

router.put('/check/:id', auth, controller.check);

router.put('/:id', auth, isMongoId, controller.edit);

router.delete('/:id', auth, isMongoId, controller.remove);

module.exports = router;
