"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleWorkout = void 0;
const workout_transformer_service_1 = require("../services/workout-transformer.service");
const logger_1 = require("../utils/logger");
exports.sampleWorkout = `
Warm up 15 minutes easy

Main Set:
3 rounds of:
- 5 minutes Zone 4
- 2 minutes easy recovery

Cool down 10 minutes

End with light stretching
`;
async function testWorkoutTransformation() {
    const transformer = new workout_transformer_service_1.WorkoutTransformerService();
    try {
        const result = await transformer.transformWorkout(exports.sampleWorkout);
        logger_1.logger.info('Transformed workout:', result);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error('Transformation failed:', errorMessage);
    }
}
