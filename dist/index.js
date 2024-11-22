"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const scheduler_1 = require("./utils/scheduler");
const auth_service_1 = require("./services/auth.service");
// Load environment variables from .env file
dotenv_1.default.config();
async function main() {
    try {
        // Initialize authentication
        const authService = auth_service_1.AuthService.getInstance();
        await authService.login(process.env.TP_USERNAME, process.env.TP_PASSWORD);
        // Start the scheduler
        const scheduler = new scheduler_1.Scheduler();
        scheduler.startScheduler();
    }
    catch (error) {
        console.error('Failed to start service:', error);
        process.exit(1);
    }
}
main();
