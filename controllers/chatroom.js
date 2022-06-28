const { User } = require('../models/User');
const { Chat } = require('../models/Chat');
const { Message } = require('../models/Message');
const { Group } = require('../models/Group');
const { GroupMessage } = require('../models/GroupMessage');
const sharp = require('sharp');
const shortId = require('shortid');

const date = new Date();
const chatting = (io) => {
  io.on('connection', (socket) => {
    //@Get user information to UPDATE in database
    //Store current socketId
    socket.on('user-data', async (data) => {
      let user = JSON.parse(data.user);
      user.socketId = socket.id;
      let chats;
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              socketId: socket.id,
              status: 'Online',
              currentChat: '62b0b96c136f8a85dddddddd',
            },
          }
        );

        //@Desc when you get online all messaged will be delivered to you
        await Message.updateMany(
          { receiver: user._id },
          { $set: { delivered: true } }
        );

        // @Desc  when you get online all you chats will send to ui to show in left sidebar
        chats = await Chat.find({ 'users.user': user._id })
          .populate('users.user', ['_id', 'username', 'status', 'image'])
          .sort([['dateModified', 'descending']]);
        io.to(socket.id).emit('update-chats-list', { chats, sender: user });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('disconnect', async () => {
      //@Desc  when you get offline by closing your tab or your browser
      //you data in database such as your socket and status will be changed
      await User.updateOne(
        { socketId: socket.id },
        { socketId: '', status: 'Offline' }
      );
    });

    //@Desc this event will be emiited when you search any user or click on a user in your chat list
    //The program try to find the person who you want to chat
    socket.on('start-chat', async (who) => {
      try {
        let user1 = await User.findOne({ socketId: socket.id });
        let user2 = await User.findOne({ username: who.who });
        if (!user2) {
          //If the server can't find any record in database send you a message
          return socket.emit('no-user', {
            message: 'There is no user with this username',
          });
        }
        //if the server could find the user name it tries to find the chat record with that person based on specialId (mix your id and that person)
        let chat =
          (await Chat.findOne({ specialId: user1._id + user2._id })) ||
          (await Chat.findOne({ specialId: user2._id + user1._id }));
        //if the server can't find any chat with this person that means you want to send your first so the server create new chat for you
        if (!chat) {
          chat = await Chat.create({
            users: [{ user: user1._id }, { user: user2._id }],
          });
        }

        chat = await chat.populate('users.user', [
          '_id',
          'username',
          'status',
          'image',
        ]);
        await User.updateOne({ _id: user1._id }, { currentChat: chat._id });
        await Message.updateMany(
          { chat: chat._id, receiver: user1._id },
          { $set: { delivered: true, seen: true } }
        );

        //Every chat contains a lot of message the server tries to find all of them and send them to UI for showing
        let messages = await Message.find({ chat: chat._id });
        chat = JSON.stringify(chat);
        //due to the server send the full information of sender and receiver to UI so it's better to remove their password for higher security though The passwords are encrypted
        user1.password = '';
        user2.password = '';
        //your chats on left sidebar should be update so the server send all your chats to UI
        let chats = await Chat.find({ 'users.user': user1._id })
          .populate('users.user', ['_id', 'username', 'status', 'image'])
          .sort([['dateModified', 'descending']]);
        //your selected chat will be sent to UI by server to show in chat-box
        socket.emit('send-private-chat', {
          chat,
          sender: user1,
          receiver: user2,
          chats,
          messages,
        });
      } catch (error) {
        console.log(error);
      }
    });

    //@Desc this event is ready to listen to any direct message that you send
    socket.on('send-private-message', async (data) => {
      try {
        //datas that are sent by user, contains the receiver information and Body of message and current chat of sender user
        let receiver = JSON.parse(data.receiver);
        receiver = await User.findById(receiver._id);
        let receiverSocketId = receiver.socketId;
        let sender = await User.findOne({ socketId: socket.id });
        //the server has the sender information and the receiver information is given so the sever tries to find the record between this 2 users
        let chat =
          (await Chat.findOne({ specialId: sender._id + receiver._id })) ||
          (await Chat.findOne({ specialId: receiver._id + sender._id }));
        let dateModified =
          date.getFullYear() +
          '-' +
          (date.getMonth() + 1) +
          '-' +
          date.getDate();
        dateModified +=
          ' ' +
          date.getHours() +
          ':' +
          date.getMinutes() +
          ':' +
          date.getSeconds();
        await Chat.updateOne({ _id: chat._id }, { dateModified });
        let message = await Message.create({
          body: data.message,
          image: data.image,
          chat: chat._id,
          sender: sender._id,
          receiver: receiver._id,
        });
        //if the receiver was online so it defienetely has a socket so the server send the message for Him or Her
        if (receiverSocketId) {
          await Message.updateOne(
            { _id: message._id },
            { $set: { delivered: true } }
          );
          message.delivered = true;
          if (
            receiver.currentChat.toString() === sender.currentChat.toString()
          ) {
            message.seen = true;
            await Message.updateOne(
              { _id: message.id },
              { $set: { seen: true } }
            );
          }
          // the current that is sent by sender will be sent to receiver again to check if this 2 users are on same chat or not
          io.to(receiverSocketId).emit('send-message-to-receiver', {
            message,
            currentChat: data.currentChat,
          });
        }
        // the message will be sent to sender without any condition
        io.to(socket.id).emit('send-message-to-sender', message);

        //neither the message sent to receiver or not it must be saved on database to show for him or her when he gets online
      } catch (error) {
        console.log(error);
      }
    });

    //@Desc this event is ready to listen to user who is typing and send a status of sender for receiver
    socket.on('typing', async (data) => {
      let receiver = JSON.parse(data.receiver);
      let user = await User.findById(receiver._id);
      // if the receiver was offline the server wouldn't send typing status for him or her
      if (user.socketId) {
        io.to(user.socketId).emit('typing', { currentChat: data.currentChat });
      }
    });
    socket.on('upload-group-image', (file, callback) => {
      let imageName = shortId.generate();
      imageName += '.jpg';
      sharp(file).toFile(`./public/images/groups/${imageName}`, (err, info) => {
        err
          ? callback({ message: 'failure' })
          : callback({ message: 'success', imageName });
      });
    });
    socket.on('create-group', async (data) => {
      try {
        let { groupName, groupBio, groupImage } = JSON.parse(data);
        let user = await User.findOne({ socketId: socket.id });
        let group = new Group({
          name: groupName,
          bio: groupBio,
          image: groupImage,
          owner: user._id,
          members: [user._id],
        });
        await group.save();
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('get-chats-list', async () => {
      try {
        let user = await User.findOne({ socketId: socket.id });
        let chats;
        chats = await Chat.find({ 'users.user': user._id })
          .populate('users.user', ['_id', 'username', 'status', 'image'])
          .sort([['dateModified', 'descending']]);
        io.to(socket.id).emit('update-chats-list', { chats, sender: user });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on('get-groups-list', async () => {
      try {
        let groups = await Group.find().sort([['lastModified', 'descending']]);
        let user = await User.findOne({ socketId: socket.id });
        let userGroups = [];
        groups.forEach((group) => {
          if (group.members.includes(user._id)) userGroups.push(group);
        });
        io.to(socket.id).emit('get-groups-list', { groups: userGroups });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on('join-group', async (data) => {
      try {
        let { groupId } = JSON.parse(data);
        let group = await Group.findById(groupId);
        if (group) {
          let groupMessages = await GroupMessage.find({
            group: groupId,
          }).populate('sender', ['image', '_id', 'status', 'username']);
          socket.join(groupId);
          io.to(socket.id).emit('joined-group', { group, groupMessages });
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on('send-message-to-group', async (data) => {
      try {
        let { groupMessage, currentGroup } = JSON.parse(data);
        let sender = await User.findOne({ socketId: socket.id });
        sender.password = '';
        io.in(currentGroup).emit('send-message-to-group', {
          groupMessage,
          sender,
          currentGroup,
        });
        await GroupMessage.create({
          body: groupMessage,
          sender: sender._id,
          group: currentGroup,
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on('add-user-to-group', async (data) => {
      try {
        let group = await Group.findById(data.currentGroup);
        let user = await User.findOne({ username: data.username });
        if (group && user) {
          if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await Group.findByIdAndUpdate(group._id, { $set: { ...group } });
            io.in(data.currentGroup).emit('user-added-to-group', user.username);
            io.to(socket.id).emit('add-user-to-group-result', {
              status: 200,
              message: 'User added to group',
            });
          } else {
            io.to(socket.id).emit('add-user-to-group-result', {
              status: 400,
              message: 'This user has already been in group',
            });
          }
        } else {
          io.to(socket.id).emit('add-user-to-group-result', {
            status: 400,
            message: 'Unsuccessfull',
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
};

module.exports = { chatting };
