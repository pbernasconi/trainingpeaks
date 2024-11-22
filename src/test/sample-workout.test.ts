import { WorkoutTransformerService } from '../services/workout-transformer.service';
import { ClaudeService } from '../services/claude.service';
import { beforeEach, describe, it, expect } from '@jest/globals';
import { Workout } from '../types/workout';

// Sample workouts for testing different scenarios
export const sampleWorkouts = {
  basic: `
Warm up 15 minutes easy

Main Set:
3 rounds of:
- 5 minutes Zone 4
- 2 minutes easy recovery

Cool down 10 minutes

End with light stretching
`,
  complex: `
Warm up:
10min easy running, gradually increasing pace
5x30sec drills

Main set:
4 sets of:
800m at 5k pace
200m easy jog recovery
2min rest between sets

Cool down:
10min easy running
stretching
`,
  invalid: `just some random text that shouldn't parse properly`
};

describe('Workout Transformation Tests', () => {
  let transformer: WorkoutTransformerService;
  let claude: ClaudeService;

  beforeEach(() => {
    transformer = new WorkoutTransformerService();
    claude = new ClaudeService();
  });

  Object.entries(sampleWorkouts).forEach(([name, workout]) => {
    describe(`${name} workout`, () => {
      it('should transform workout using WorkoutTransformer', async () => {
        const mockWorkout = {
          workoutId: 1,
          athleteId: 1,
          title: 'Test Workout',
          workoutTypeValueId: 1,
          description: workout
        } as Workout; // Type assertion to satisfy remaining properties

        const result = await transformer.transformWorkout(mockWorkout);
        expect(result).toBeDefined();
      });

      it('should transform workout using Claude', async () => {
        const mockWorkout = {
          workoutId: 1,
          athleteId: 1,
          title: 'Test Workout',
          workoutTypeValueId: 1,
          description: workout
        } as Workout;

        const result = await claude.transformWorkoutDescription(mockWorkout);

        expect(result).toBeDefined();
        expect(Array.isArray(result.structure)).toBeTruthy();
      });

      if (name === 'invalid') {
        it('should handle invalid input appropriately', async () => {
          const mockWorkout = {
            workoutId: 1,
            athleteId: 1,
            title: 'Test Workout',
            workoutTypeValueId: 1,
            description: workout
          } as Workout;

          await expect(transformer.transformWorkout(mockWorkout)).rejects.toThrow();
        });
      }
    });
  });
}); 