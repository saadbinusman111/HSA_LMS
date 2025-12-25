const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.POSTGRES_URL) {
  // Production: Use Vercel Postgres
  sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
