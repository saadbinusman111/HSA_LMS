const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Setup/Reset Route (Use this once if login fails)
app.get('/api/setup-db', async (req, res) => {
  try {
    await sequelize.sync();
    const hashedPassword = await bcrypt.hash('123456', 10);
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hashedPassword,
        role: 'teacher',
        fullName: 'Saad Bin Usman'
      }
    });
    res.json({ message: 'Database synced', adminCreated: created, username: 'admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database Sync and Seed
async function initDb() {
  try {
    // Use the default sync to preserve data. 
    // SQLite often crashes with { alter: true } due to backup table conflicts.
    await sequelize.sync(); 
    console.log('Database synced successfully.');

    // Check if admin exists
    const admin = await User.findOne({ where: { role: 'teacher' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'teacher',
        fullName: 'Saad Bin Usman'
      });
      console.log('Default Teacher Account Created: admin / 123456');
    }

  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDb();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;