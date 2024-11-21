export const CONFIG = {
  POLL_INTERVAL: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  API: {
    TRAINING_PEAKS_BASE_URL: 'https://tpapi.trainingpeaks.com/fitness/v6',
    CLAUDE_BASE_URL: 'https://api.anthropic.com/v1/messages'
  }
}; 