const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  body: { type: String, required: true },
  image: { type: String },
  sender: { type: mongoose.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  group: { type: mongoose.Types.ObjectId, ref: 'Group' },
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

module.exports = { GroupMessage };
