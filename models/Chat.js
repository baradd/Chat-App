const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  users: [
    {
      user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
  ],
  specialId: {
    type: String,
  },
  dateModified: { type: Date, default: Date.now },
});

chatSchema.pre('save', async function (next) {
  let chat = this;
  try {
    if (chat.isModified()) {
      chat.specialId = chat.users[0].user + chat.users[1].user;
      return next();
    }
  } catch (error) {
    console.log(error);
  }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Chat };
