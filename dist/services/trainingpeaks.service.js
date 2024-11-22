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
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://app.trainingpeaks.com',
            'Referer': 'https://app.trainingpeaks.com/',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        };
    }
    async getWorkouts(userId, startDate, endDate) {
        try {
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];
            const response = await axios_1.default.get(`${this.baseUrl}/athletes/${userId}/workouts/${formattedStartDate}/${formattedEndDate}`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch workouts' + error);
        }
    }
    async updateWorkout(userId, workoutId, workout) {
        try {
            const response = await axios_1.default.put(`${this.baseUrl}/athletes/${userId}/workouts/${workoutId}`, workout, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new Error(`Failed to update workout:\n` +
                    `Status: ${error.response?.status}\n` +
                    `Message: ${error.message}\n` +
                    // `Response data: ${JSON.stringify(error.response?.data, null, 2)}\n` +
                    `Request URL: ${error.config?.url}\n` +
                    `Request method: ${error.config?.method}\n` +
                    `Request data: ${error.config?.data}`);
            }
            throw error;
        }
    }
}
exports.TrainingPeaksService = TrainingPeaksService;
