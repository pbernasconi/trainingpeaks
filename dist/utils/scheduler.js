"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutProcessor = void 0;
const logger_1 = require("./logger");
const trainingpeaks_service_1 = require("../services/trainingpeaks.service");
const workout_transformer_service_1 = require("../services/workout-transformer.service");
const auth_service_1 = require("../services/auth.service");
const claude_service_1 = require("../services/claude.service");
class WorkoutProcessor {
    constructor() {
        this.trainingPeaksService = new trainingpeaks_service_1.TrainingPeaksService();
        this.workoutTransformer = new workout_transformer_service_1.WorkoutTransformerService();
        this.authService = auth_service_1.AuthService.getInstance();
        this.claudeService = new claude_service_1.ClaudeService();
    }
    async processAllWorkouts() {
        try {
            logger_1.logger.info('Starting workout processing...');
            await this.ensureAuthentication();
            const dateRange = this.calculateDateRange();
            await this.processWorkouts(dateRange);
            logger_1.logger.info('Finished processing workouts');
        }
        catch (error) {
            logger_1.logger.error('Processing failed:', error);
            throw error;
        }
    }
    async ensureAuthentication() {
        try {
            this.authService.getToken();
        }
        catch (error) {
            logger_1.logger.info('Authenticating...');
            await this.authService.login(process.env.TP_USERNAME, process.env.TP_PASSWORD);
        }
        if (!this.authService.getUserId()) {
            throw new Error('Failed to get user ID after authentication');
        }
    }
    calculateDateRange() {
        const today = new Date();
        return {
            start: this.addDays(today, -14),
            end: this.addDays(today, 14)
        };
    }
    async processWorkouts(dateRange) {
        const userId = this.authService.getUserId();
        const workouts = await this.trainingPeaksService.getWorkouts(userId, dateRange.start, dateRange.end);
        logger_1.logger.info(`Found ${workouts.length} workouts in date range`);
        for (const workout of workouts) {
            await this.processWorkout(workout, userId);
        }
    }
    async processWorkout(workout, userId) {
        try {
            this.logWorkoutDetails(workout);
            if (workout.description && !workout.structure) {
                logger_1.logger.info(`Processing workout ${workout.workoutId}...`);
                const structure = await this.claudeService.transformWorkoutDescription(workout);
                const updatedWorkout = { ...workout, structure: JSON.stringify(structure) };
                await this.trainingPeaksService.updateWorkout(userId, workout.workoutId.toString(), updatedWorkout);
                logger_1.logger.info(`Successfully processed workout ${workout.workoutId}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to process workout ${workout.workoutId}:`, error);
        }
    }
    logWorkoutDetails(workout) {
        logger_1.logger.info(`--------------------
Workout ID: ${workout.workoutId}
Type: ${workout.workoutTypeValueId}
Date: ${workout.workoutDay}
Title: ${workout.title || 'N/A'}
Description: ${workout.description || 'N/A'}
Structured: ${workout.structure ? 'Yes' : 'No'}
--------------------`);
    }
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }
}
exports.WorkoutProcessor = WorkoutProcessor;
