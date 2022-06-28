const router = require('express').Router();

const mainController = require('../controllers/main');
const auth = require('../middlewares/auth');
const validators = require('../middlewares/validators');

router.post('/login', mainController.handleLogin);

router.post('/chatroom', auth.userAuthenticated);

router.post(
  '/register',
  validators.userImageValidator,
  validators.userValidator,
  mainController.register
);

router.post(
  '/upload-message-image',
  validators.messageImageValidator,
  mainController.uploadMessageImage
);
module.exports = { router };
