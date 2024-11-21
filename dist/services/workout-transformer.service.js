"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutTransformerService = void 0;
const claude_service_1 = require("./claude.service");
class WorkoutTransformerService {
    constructor() {
        this.claudeService = new claude_service_1.ClaudeService();
    }
    async transformWorkout(description) {
        try {
            const jsonString = await this.claudeService.transformWorkoutDescription(description);
            const structure = JSON.parse(jsonString);
            // Validate the structure matches our schema
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
}
exports.WorkoutTransformerService = WorkoutTransformerService;
