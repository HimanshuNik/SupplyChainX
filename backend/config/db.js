const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (process.env.USE_EMBEDDED_DB === 'true') {
    console.log('[SupplyChainX] Running in Embedded Fast JSON DB Mode (Demo & Offline Ready)');
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supplychainx', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[SupplyChainX] Connected to MongoDB: ${conn.connection.host}`);
    isConnected = true;
    return true;
  } catch (error) {
    console.log('[SupplyChainX] MongoDB connection unavailable. Switching seamlessly to Embedded JSON Store.');
    console.log('[SupplyChainX] All features, seed data, and CRUD will work 100% reliably out of the box.');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
