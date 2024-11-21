"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const constants_1 = require("../config/constants");
const logger_1 = require("./logger");
const trainingpeaks_service_1 = require("../services/trainingpeaks.service");
const workout_transformer_service_1 = require("../services/workout-transformer.service");
class Scheduler {
    constructor() {
        this.interval = null;
        this.trainingPeaksService = new trainingpeaks_service_1.TrainingPeaksService();
        this.workoutTransformer = new workout_transformer_service_1.WorkoutTransformerService();
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
            // Implementation of the scheduled task
            logger_1.logger.info('Running scheduled task...');
            // Add your scheduled task implementation here
        }
        catch (error) {
            logger_1.logger.error('Scheduled task failed:', error.message);
        }
    }
}
exports.Scheduler = Scheduler;
