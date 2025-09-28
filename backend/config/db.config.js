import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// Database configuration. Exporting it for Sequalize.
export default {
    // Database host
    HOST: process.env.DB_HOST,
    // Database username
    USER: process.env.DB_USER,
    // Database password
    PASSWORD: process.env.DB_PASSWORD,
    // Database name
    DB: process.env.DB_NAME,
    // Type of database
    dialect: "postgres",
    // Database port
    PORT: process.env.DB_PORT,
    // Connection pool settings to manage multiple connections
    pool: {
        max: 5,       // Maximum number of connections
        min: 0,       // Minimum number of connections
        acquire: 30000, // Maximum time (ms) to try getting connection before error
        idle: 10000,    // Maximum time (ms) a connection can be idle before being released
    },
};
