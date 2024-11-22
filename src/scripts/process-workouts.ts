import { ClaudeService } from '../services/claude.service';
// Import other necessary services

async function processWorkouts() {
  try {
    const claudeService = new ClaudeService();
    // Add your workout processing logic here

    console.log('Workout processing completed');
  } catch (error) {
    console.error('Error processing workouts:', error);
    process.exit(1);
  }
}

processWorkouts(); 