const Yup = require('yup');

const messageImageValidatorSchema = Yup.object().shape({
  mimetype: Yup.mixed().oneOf(
    ['image/png', 'image/jpg', 'image/jpeg'],
    'Invalid file type'
  ),
  size: Yup.number().max(100000 * 10 * 10, 'Your image is too large'), //10mb
});

const userImageValidatorSchema = Yup.object().shape({
  mimetype: Yup.string().oneOf(
    ['image/png', 'image/jpg', 'image/jpeg'],
    'Invalid image type'
  ),
  size: Yup.number().max(100000 * 10 * 3, 'Too large image'), //3mb
});

module.exports = { messageImageValidatorSchema, userImageValidatorSchema };
