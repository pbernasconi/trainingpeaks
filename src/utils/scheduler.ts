import { CONFIG } from '../config/constants';
import { logger } from './logger';
import { TrainingPeaksService } from '../services/trainingpeaks.service';
import { WorkoutTransformerService } from '../services/workout-transformer.service';
import { AuthService } from '../services/auth.service';

export class Scheduler {
  private interval: NodeJS.Timeout | null = null;
  private trainingPeaksService: TrainingPeaksService;
  private workoutTransformer: WorkoutTransformerService;
  private authService: AuthService;

  constructor() {
    this.trainingPeaksService = new TrainingPeaksService();
    this.workoutTransformer = new WorkoutTransformerService();
    this.authService = AuthService.getInstance();
  }

  startScheduler(): void {
    logger.info('Starting scheduler...');
    this.scheduleNextRun();
    this.interval = setInterval(() => {
      this.scheduleNextRun();
    }, CONFIG.POLL_INTERVAL);
  }

  stopScheduler(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async scheduleNextRun(): Promise<void> {
    try {
      logger.info('Running scheduled task...');
      await this.ensureAuthentication();
      const dateRange = this.calculateDateRange();
      await this.processWorkouts(dateRange);
    } catch (error: any) {
      logger.error('Scheduled task failed:', error);
    }
  }

  private async ensureAuthentication(): Promise<void> {
    try {
      this.authService.getToken();
    } catch (error) {
      logger.info('Authentication token invalid or expired, attempting to login...');
      await this.authService.login(process.env.TP_USERNAME!, process.env.TP_PASSWORD!);
    }

    if (!this.authService.getUserId()) {
      throw new Error('Failed to get user ID after authentication');
    }
  }

  private calculateDateRange(): { start: Date; end: Date } {
    const today = new Date();
    return {
      start: this.addDays(today, -14),
      end: this.addDays(today, 14)
    };
  }

  private async processWorkouts(dateRange: { start: Date; end: Date }): Promise<void> {
    const userId = this.authService.getUserId()!;
    const workouts = await this.trainingPeaksService.getWorkouts(
      userId,
      dateRange.start,
      dateRange.end
    );

    logger.info(`Found ${workouts.length} workouts in date range`);

    for (const workout of workouts) {
      try {
        this.logWorkoutDetails(workout);

        // Only attempt to update workouts that have a description but no structure
        if (workout.description && !workout.structure) {
          logger.info(`Updating workout ${workout.workoutId} with structure...`);
          const structuredWorkout = this.workoutTransformer.transform(workout.description);
          await this.trainingPeaksService.updateWorkout(
            userId,
            workout.workoutId.toString(),
            structuredWorkout
          );
          logger.info(`Successfully updated workout ${workout.workoutId}`);
        }
      } catch (error: any) {
        logger.error(`Failed to process workout ${workout.workoutId}:`, error);
      }
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
--------------------`);
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  }
} 