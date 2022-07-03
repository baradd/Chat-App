const jwt = require('jsonwebtoken');

const userAuthenticated = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (token) {
      let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken) {
        throw new Error();
      }
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ messsage: 'Unauthorized user' });
  }
};

module.exports = { userAuthenticated };
