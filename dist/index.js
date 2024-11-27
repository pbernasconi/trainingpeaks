"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const scheduler_1 = require("./utils/scheduler");
// Load environment variables from .env file
dotenv_1.default.config();
async function main() {
    try {
        const processor = new scheduler_1.WorkoutProcessor();
        await processor.processAllWorkouts();
        process.exit(0);
    }
    catch (error) {
        console.error('Failed to process workouts:', error);
        process.exit(1);
    }
}
main();
