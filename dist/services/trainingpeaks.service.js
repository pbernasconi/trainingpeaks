"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingPeaksService = void 0;
const axios_1 = __importDefault(require("axios"));
const auth_service_1 = require("./auth.service");
class TrainingPeaksService {
    constructor() {
        this.baseUrl = 'https://tpapi.trainingpeaks.com/fitness/v6';
        this.authService = auth_service_1.AuthService.getInstance();
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.authService.getToken()}`,
            'Content-Type': 'application/json',
        };
    }
    async getWorkouts(athleteId, startDate, endDate) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/athletes/${athleteId}/workouts/${startDate}/${endDate}`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch workouts');
        }
    }
    async updateWorkout(athleteId, workoutId, structure) {
        try {
            const response = await axios_1.default.put(`${this.baseUrl}/athletes/${athleteId}/workouts/${workoutId}`, { structure }, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to update workout');
        }
    }
}
exports.TrainingPeaksService = TrainingPeaksService;
