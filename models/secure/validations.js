const Yup = require('yup');

const userValidationSchema = Yup.object().shape({
  username: Yup.string()
    .max(100, 'Too large username')
    .required('Fill username'),
  password: Yup.string().required('Fill password'),
  passwordRepeat: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords are not matched'
  ),
});

module.exports = { userValidationSchema };
