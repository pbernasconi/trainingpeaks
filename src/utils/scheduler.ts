import { logger } from './logger';
import { TrainingPeaksService } from '../services/trainingpeaks.service';
import { AuthService } from '../services/auth.service';
import { ClaudeService } from '../services/claude.service';
import { Workout } from '../types/workout';
import { UserSettings } from '../types/user';

export class WorkoutProcessor {
  private trainingPeaksService: TrainingPeaksService;
  private authService: AuthService;
  private claudeService: ClaudeService;

  constructor() {
    this.trainingPeaksService = new TrainingPeaksService();
    this.authService = AuthService.getInstance();
    this.claudeService = new ClaudeService();
  }

  async processAllWorkouts(): Promise<void> {
    try {
      logger.info('Starting workout processing...');
      await this.ensureAuthentication();
      const dateRange = this.calculateDateRange();
      await this.processWorkouts(dateRange);
      logger.info('Finished processing workouts');
    } catch (error: any) {
      logger.error('Processing failed:', error);
      throw error;
    }
  }

  private async ensureAuthentication(): Promise<void> {
    try {
      this.authService.getToken();
    } catch (error) {
      logger.info('Authenticating...');
      await this.authService.login(process.env.TP_USERNAME!, process.env.TP_PASSWORD!);
    }

    if (!this.authService.getUserId()) {
      throw new Error('Failed to get user ID after authentication');
    }
  }

  private calculateDateRange(): { start: Date; end: Date } {
    const today = new Date();
    return {
      start: today,
      end: this.addDays(today, 7)
    };
  }

  private async processWorkouts(dateRange: { start: Date; end: Date }): Promise<void> {
    const userId = this.authService.getUserId()!;
    const userSettings = await this.trainingPeaksService.getUserSettings(userId);
    const workouts = await this.trainingPeaksService.getWorkouts(
      userId,
      dateRange.start,
      dateRange.end
    );
    logger.info(`Found ${workouts.length} workouts in date range`);

    for (const workout of workouts) {
      await this.processWorkout(workout, userId, userSettings);
    }
  }

  private async processWorkout(workout: Workout, userId: string, userSettings: UserSettings): Promise<void> {
    try {
      this.logWorkoutDetails(workout);
      if (![1, 2, 3].includes(workout.workoutTypeValueId)) {
        logger.info(`Skipping workout that is not Swim, Bike or Run ${workout.workoutId}`);
        return;
      }
      if (workout.totalTime != null) {
        logger.info(`Skipping completed workout ${workout.workoutId}`);
        return;
      }
      const structure = await this.claudeService.transformWorkoutDescription(workout, userSettings);
      const updatedWorkout = { ...workout, structure: JSON.stringify(structure) };
      await this.trainingPeaksService.updateWorkout(userId, workout.workoutId.toString(), updatedWorkout);
      logger.info(`Successfully processed workout ${workout.workoutId}`);

    } catch (error: any) {
      logger.error(`Failed to process workout ${workout.workoutId}:`, error);
    }
  }

  private logWorkoutDetails(workout: any): void {
    logger.info(`
--------------------
Workout ID: ${workout.workoutId}
Type: ${workout.workoutTypeValueId}
Date: ${workout.workoutDay}
Title: ${workout.title || 'N/A'}
Description: ${workout.description || 'N/A'}
Structured: ${workout.structure ? 'Yes' : 'No'}
--------------------
`);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  }
} 