const fileValidations = require('../models/secure/filevalidations');
const validations = require('../models/secure/validations');

const messageImageValidator = async (req, res, next) => {
  try {
    let image = req?.files?.image;
    if (image) {
      await fileValidations.messageImageValidatorSchema.validate(image, {
        abortEarly: false,
      });
      return next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(406)
      .json({ message: 'Error in file validation', data: error.errors });
  }
};

const userImageValidator = async (req, res, next) => {
  try {
    let image = req?.files?.image;
    if (image) {
      await fileValidations.messageImageValidatorSchema.validate(image, {
        abortEarly: false,
      });
      return next();
    }
  } catch (error) {
    console.log(error.errors);
    res.redirect('/register.html');
  }
};

const userValidator = async (req, res, next) => {
  try {
    await validations.userValidationSchema.validate(
      { ...req.body },
      {
        abortEarly: false,
      }
    );
    return next();
  } catch (error) {
    console.log(error.errors);
    res.redirect('/register.html');
  }
};

module.exports = { messageImageValidator, userImageValidator, userValidator };
