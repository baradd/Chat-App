const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  socketId: { type: String, default: '' },
  username: {
    type: String,
    max: 50,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    max: 100,
    required: true,
  },
  status: {
    type: String,
    enum: ['Offline', 'Online'],
    default: 'Offline',
  },
  currentChat: {
    type: mongoose.Types.ObjectId,
    default: '62b0b96c136f8a85dddddddd',
  },
  image: { type: String, default: 'user.png' },
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified) {
    try {
      user.password = await bcrypt.hash(user.password, 11);
      return next();
    } catch (error) {
      console.log(err);
    }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
