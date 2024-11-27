import dotenv from 'dotenv';
import { WorkoutProcessor } from './utils/scheduler';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    const processor = new WorkoutProcessor();
    await processor.processAllWorkouts();
    process.exit(0);
  } catch (error) {
    console.error('Failed to process workouts:', error);
    process.exit(1);
  }
}

main(); 