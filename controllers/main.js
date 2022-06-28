const jwt = require('jsonwebtoken');
const shortId = require('shortid');
const bcrypt = require('bcryptjs');

const { User } = require('../models/User');

const handleLogin = async (req, res, next) => {
  const username = req.body.username,
    password = req.body.password;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'There is no user with this username' });
    }
    let isMatched = bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    let token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET
    );
    user.password = '';
    return res.status(302).json({
      message: 'Successful',
      data: { token, user },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Database error' });
  }
};
const register = async (req, res, next) => {
  let image = req.files.image;
  let imageName = `${shortId.generate()}_${image.name}`;

  try {
    const user = await User.findOne({
      username: req.body.username,
    });
    if (user) {
      return res.status(400).json({ message: 'You have registered already' });
    }
    image.mv(`./public/images/profiles/${imageName}`, (err) => {
      if (err) console.log(err);
    });
    await User.create({
      username: req.body.username,
      password: req.body.password,
      image: imageName,
    });
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
};

const uploadMessageImage = async (req, res, next) => {
  try {
    let image = req.files.image;
    let imageName = `${shortId.generate()}_${image.name}`;
    image.mv(`./public/images/chats/${imageName}`, (err) => {
      if (err) console.log(err);
    });
    res.status(200).json({ message: 'Image Saved', imageName });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handleLogin, register, uploadMessageImage };
