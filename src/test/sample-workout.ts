import { WorkoutTransformerService } from '../services/workout-transformer.service';
import { logger } from '../utils/logger';

export const sampleWorkout = `
Warm up 15 minutes easy

Main Set:
3 rounds of:
- 5 minutes Zone 4
- 2 minutes easy recovery

Cool down 10 minutes

End with light stretching
`;

async function testWorkoutTransformation() {
  const transformer = new WorkoutTransformerService();
  try {
    const result = await transformer.transformWorkout(sampleWorkout);
    logger.info('Transformed workout:', result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Transformation failed:', errorMessage);
  }
} 