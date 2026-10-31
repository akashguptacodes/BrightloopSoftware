import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`\nMissing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example and set these variables.\n');
  process.exit(1);
}

// Import app after env vars are validated
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`========================================\n`);
});
