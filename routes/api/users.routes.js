const router = require('express').Router();
const { check } = require('express-validator');

const controller = require('../../controllers/users.controller');

// Middleware
const auth = require('../../middleware/auth.middleware');
// const isMongoId = require('../../middleware/validate/isMongoId');

router.post(
  '/register',
  [
    check('username', 'Username must not be less than 4 characters').isLength({
      min: 4,
    }),
    check('password', 'Password must not be less than 6 characters').isLength({
      min: 6,
    }),
    check('firstName', 'First name is empty!').not().isEmpty(),
    check('lastName', 'Last name is empty!').not().isEmpty(),
  ],
  controller.register
);

router.post(
  '/login',
  [
    check('username', 'Username is empty!').not().isEmpty(),
    check('password', 'Password is empty!').not().isEmpty(),
  ],
  controller.login
);

router.post('/logout', controller.logout);
router.get('/refresh', controller.refresh);

module.exports = router;
