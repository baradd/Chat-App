const router = require('express').Router();

const mainController = require('../controllers/main');
const auth = require('../middlewares/auth');
const validators = require('../middlewares/validators');

router.post('/login', mainController.handleLogin);

router.get('/chatroom', mainController.getChatroom);

router.post('/chatroom', auth.userAuthenticated);

router.get('/register', mainController.getRegister);

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
router.get('', mainController.getLogin);
module.exports = { router };
