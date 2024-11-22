"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutTransformerService = void 0;
const claude_service_1 = require("./claude.service");
class WorkoutTransformerService {
    constructor() {
        this.claudeService = new claude_service_1.ClaudeService();
    }
    async transformWorkout(workout) {
        try {
            const structure = await this.claudeService.transformWorkoutDescription(workout);
            this.validateWorkoutStructure(structure);
            return structure;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to transform workout: ${errorMessage}`);
        }
    }
    validateWorkoutStructure(structure) {
        if (!structure.Structure || !Array.isArray(structure.Structure)) {
            throw new Error('Invalid workout structure format');
        }
        for (const step of structure.Structure) {
            if (!step.IntensityClass || !step.Length || !step.Type || !step.IntensityTarget) {
                throw new Error('Missing required fields in workout step');
            }
        }
    }
    transform(description) {
        // Implement your workout transformation logic here
        // Return the structured workout format
        return {
        // Your transformed workout structure
        };
    }
}
exports.WorkoutTransformerService = WorkoutTransformerService;
