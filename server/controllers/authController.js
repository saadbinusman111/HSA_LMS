const { User, Enrollment, Submission, Message, Attendance, Fee, Result } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'hsa_lms_super_secret_key'; // In prod, use .env

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Successful login for: ${username}`);
    const token = jwt.sign({ id: user.id, role: user.role, name: user.fullName }, SECRET_KEY, { expiresIn: '1d' });
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStudent = async (req, res) => {
  // Only teacher can register students
  const { username, password, fullName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: 'student',
      fullName
    });

    res.status(201).json({ message: 'Student created successfully', student: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete all related data
    await Enrollment.destroy({ where: { UserId: id } });
    await Submission.destroy({ where: { UserId: id } });
    await Message.destroy({ where: { senderId: id } });
    await Attendance.destroy({ where: { UserId: id } });
    await Fee.destroy({ where: { UserId: id } });
    await Result.destroy({ where: { UserId: id } });

    // Finally delete the user
    await user.destroy();

    res.json({ message: 'Student and all associated data removed successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    // If teacher, validate 6-digit PIN if desired, but let's just hash it
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeUsername = async (req, res) => {
  const { newUsername, password } = req.body;
  const { userId } = req;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password first
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Check if username is already taken
    const existingUser = await User.findOne({ where: { username: newUsername } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    user.username = newUsername;
    await user.save();

    res.json({ message: 'Username updated successfully', username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
