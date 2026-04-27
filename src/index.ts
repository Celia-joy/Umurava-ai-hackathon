// src/index.ts

import 'dotenv/config';
import { app } from './app';
import { connectDB } from './config/db';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function main() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});