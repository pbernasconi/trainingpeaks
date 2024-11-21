import dotenv from 'dotenv';
import { Scheduler } from './utils/scheduler';
import { AuthService } from './services/auth.service';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Initialize authentication
    const authService = AuthService.getInstance();
    await authService.login(process.env.TP_USERNAME!, process.env.TP_PASSWORD!);

    // Start the scheduler
    const scheduler = new Scheduler();
    scheduler.startScheduler();
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

main(); 