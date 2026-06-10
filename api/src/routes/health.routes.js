import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();

router.get('/', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    systems: []
  };

  try {

    // 1 = connected, 2 = connecting, 3 = disconnecting, 0 = disconnected
    const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
    healthcheck.systems.push({ name: 'database', status: dbStatus });

    if (dbStatus === 'DOWN') {
      throw new Error('Database not connected');
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).json(healthcheck); // 503 Service Unavailable
  }
});

export default router;