const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, max: 30, required: true },
  createdAt: { type: Date, default: Date.now },
  image: { type: String, default: 'group.png' },
  bio: { type: String, max: 50 },
  invitationLink: { type: String },
  owner: { type: mongoose.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  lastModified: { type: Date, default: Date.now },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = { Group };
