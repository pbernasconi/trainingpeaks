import axios from 'axios';
import { AuthService } from './auth.service';
import { Workout, StructuredWorkout } from '../types/workout';

export class TrainingPeaksService {
  private authService: AuthService;
  private baseUrl = 'https://tpapi.trainingpeaks.com/fitness/v6';

  constructor() {
    this.authService = AuthService.getInstance();
  }

  private getHeaders() {
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

  async getWorkouts(userId: string, startDate: Date, endDate: Date): Promise<Workout[]> {
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const response = await axios.get(
        `${this.baseUrl}/athletes/${userId}/workouts/${formattedStartDate}/${formattedEndDate}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch workouts' + error);
    }
  }

  async updateWorkout(userId: string, workoutId: string, structure: StructuredWorkout): Promise<Workout> {
    try {
      const response = await axios.put<Workout>(
        `${this.baseUrl}/athletes/${userId}/workouts/${workoutId}`,
        { structure },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update workout: ${error}`);
    }
  }
} 