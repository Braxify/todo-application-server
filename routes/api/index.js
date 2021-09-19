const router = require('express').Router();

router.use('/', require('./users.routes.js'));
router.use('/todo', require('./todos.routes'));

module.exports = router;
