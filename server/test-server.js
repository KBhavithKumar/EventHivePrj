import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Starting test server...');

try {
  const app = express();
  const PORT = process.env.PORT || 5000;

  app.get('/test', (req, res) => {
    res.json({ message: 'Test server is working!' });
  });

  app.listen(PORT, () => {
    console.log(`✓ Test server running on port ${PORT}`);
  });
} catch (error) {
  console.error('❌ Test server failed:', error.message);
  console.error(error.stack);
}
