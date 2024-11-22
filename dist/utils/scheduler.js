"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const constants_1 = require("../config/constants");
const logger_1 = require("./logger");
const trainingpeaks_service_1 = require("../services/trainingpeaks.service");
const workout_transformer_service_1 = require("../services/workout-transformer.service");
const auth_service_1 = require("../services/auth.service");
const claude_service_1 = require("../services/claude.service");
class Scheduler {
    constructor() {
        this.interval = null;
        this.trainingPeaksService = new trainingpeaks_service_1.TrainingPeaksService();
        this.workoutTransformer = new workout_transformer_service_1.WorkoutTransformerService();
        this.authService = auth_service_1.AuthService.getInstance();
        this.claudeService = new claude_service_1.ClaudeService();
    }
    startScheduler() {
        logger_1.logger.info('Starting scheduler...');
        this.scheduleNextRun();
        this.interval = setInterval(() => {
            this.scheduleNextRun();
        }, constants_1.CONFIG.POLL_INTERVAL);
    }
    stopScheduler() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    async scheduleNextRun() {
        try {
            logger_1.logger.info('Running scheduled task...');
            await this.ensureAuthentication();
            const dateRange = this.calculateDateRange();
            await this.processWorkouts(dateRange);
        }
        catch (error) {
            logger_1.logger.error('Scheduled task failed:', error);
        }
    }
    async ensureAuthentication() {
        try {
            this.authService.getToken();
        }
        catch (error) {
            logger_1.logger.info('Authentication token invalid or expired, attempting to login...');
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
            // Only attempt to update workouts that have a description but no structure
            if (workout.description && !workout.structure) {
                logger_1.logger.info(`Updating workout ${workout.workoutId} with structure...`);
                const structure = await this.claudeService.transformWorkoutDescription(workout);
                console.log(structure);
                const updatedWorkout = { ...workout, structure: JSON.stringify(structure) };
                await this.trainingPeaksService.updateWorkout(userId, workout.workoutId.toString(), updatedWorkout);
                logger_1.logger.info(`Successfully updated workout ${workout.workoutId}`);
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
exports.Scheduler = Scheduler;
