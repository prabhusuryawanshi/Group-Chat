const mongoose = require('mongoose');

// Local Imports
const Message = require('../models/message');
const Group = require('../models/group');
const User = require('../models/user');

const fetchMessages = async (req, res, next) => {
  const gid = req.params.gid;

  if (!gid) return next(new Error('wrong group id: '));

  // Find group's messages
  let group;
  try {
    group = await Group.findById(gid).populate('messages');
  } catch (error) {
    return next(new Error('Could not find group by id: ' + error));
  }

  res.json({ message: 'Messages fetched!', messages: group.messages });
};

const sendMessage = async (req, res, next) => {
  const { gid, username, text, image, uid, date } = req.body;

  // Find group
  let group;
  try {
    group = await Group.findById(gid);
  } catch (error) {
    return next(new Error('Could not find group by id: ' + error));
  }

  // Add member
  let user;
  try {
    user = await User.findById(uid);
  } catch (error) {
    return next(new Error('Could not find user by id: ' + error));
  }

  let isMember = false;
  for (const member of group.members) {
    if (member._id == uid) isMember = true;
  }
  if (!isMember) group.members.push(user);

  // Create message
  const newMessage = new Message({
    username,
    text,
    image,
    group,
    date
  });

  // Transaction
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newMessage.save();
    group.messages.push(newMessage);
    await group.save();
    await session.commitTransaction();
    
  } catch (error) {
    return next(new Error('Message transaction failed: ', error));
  }

  // Send Response
  res.json({ message: 'Message sent!' });
};

exports.fetchMessages = fetchMessages;
exports.sendMessage = sendMessage;
