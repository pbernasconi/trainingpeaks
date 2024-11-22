import { ClaudeService } from './claude.service';
import { StructuredWorkout, Workout } from '../types/workout';

export class WorkoutTransformerService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  async transformWorkout(workout: Workout): Promise<StructuredWorkout> {
    try {
      const structure = await this.claudeService.transformWorkoutDescription(workout);
      this.validateWorkoutStructure(structure);
      return structure;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to transform workout: ${errorMessage}`);
    }
  }

  private validateWorkoutStructure(structure: any): void {
    if (!structure.Structure || !Array.isArray(structure.Structure)) {
      throw new Error('Invalid workout structure format');
    }

    for (const step of structure.Structure) {
      if (!step.IntensityClass || !step.Length || !step.Type || !step.IntensityTarget) {
        throw new Error('Missing required fields in workout step');
      }
    }
  }

  transform(description: string): any {
    // Implement your workout transformation logic here
    // Return the structured workout format
    return {
      // Your transformed workout structure
    };
  }
} 
