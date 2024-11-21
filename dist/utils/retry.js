"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
async function retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError = new Error('Operation failed');
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw lastError;
}
