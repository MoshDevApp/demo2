/**
 * Sequelize Database Configuration
 * Initializes MySQL connection with Sequelize ORM
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'signcraft',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'M.o.s.a.h5!?SQL',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000
  },
  timezone: '+00:00'
});

/**
 * Initialize database connection and verify connectivity
 */
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

/**
 * Close database connection gracefully
 */
export async function closeDatabaseConnection() {
  await sequelize.close();
}

export default sequelize;
