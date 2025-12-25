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

// Diagnostic Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    hasDbUrl: !!(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.STORAGE_URL)
  });
});

// Setup/Reset Route (Use this once if login fails)
app.get('/api/setup-db', async (req, res) => {
  console.log('Starting database setup...');
  try {
    // Test connection first
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    const hashedPassword = await bcrypt.hash('123456', 10);
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        password: hashedPassword,
        role: 'teacher',
        fullName: 'Saad Bin Usman'
      }
    });
    res.json({ message: 'Database setup complete', adminCreated: created, username: 'admin' });
  } catch (err) {
    console.error('Setup DB Error:', err);
    res.status(500).json({ 
      error: 'Database Setup Failed', 
      details: err.message,
      hint: 'Check if Neon database is active and credentials are correct.' 
    });
  }
});

// Database Sync and Seed (Only run automatically in development)
async function initDb() {
  if (process.env.NODE_ENV === 'production') return;
  try {
    await sequelize.sync(); 
    console.log('Database synced successfully.');
    const admin = await User.findOne({ where: { role: 'teacher' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'teacher',
        fullName: 'Saad Bin Usman'
      });
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDb();

// Global Error Handler for Vercel
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;