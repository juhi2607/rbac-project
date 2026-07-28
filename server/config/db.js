const mongoose = require('mongoose');

// Polyfill crypto for older Node environments
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto').webcrypto || require('crypto');
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
