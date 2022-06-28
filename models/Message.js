const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  image: { type: String },
  sender: { type: mongoose.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  chat: { type: mongoose.Types.ObjectId, ref: 'Chat' },
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
