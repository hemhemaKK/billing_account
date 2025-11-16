const User = require('../models/User');

// CREATE USER UNDER YEAR
exports.createUser = async (req, res, next) => {
  try {
    const { yearId } = req.params;
    const { name, phone } = req.body;

    if (!name) return res.status(400).json({ message: 'name required' });

    const user = await User.create({ yearId, name, phone });
    res.status(201).json(user);
  } catch (err) { next(err); }
};

// GET USERS UNDER YEAR
exports.getUsers = async (req, res, next) => {
  try {
    const { yearId } = req.params;
    const users = await User.find({ yearId }).sort({ name: 1 });
    res.json(users);
  } catch (err) { next(err); }
};

// GET SINGLE USER
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// UPDATE USER
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// DELETE USER
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
