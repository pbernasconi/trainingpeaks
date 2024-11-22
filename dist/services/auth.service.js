"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const logger_1 = require("../utils/logger");
const playwright_1 = require("playwright");
class AuthService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.refreshTimeout = null;
        this.userId = null;
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        if (this.accessToken && this.userId && this.tokenExpiry && this.tokenExpiry > new Date()) {
            logger_1.logger.info('Already authenticated with valid token, skipping login');
            return;
        }
        const browser = await playwright_1.chromium.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            page.on('console', msg => logger_1.logger.debug('Browser:', msg.text()));
            this.setupAuthResponseListeners(page);
            logger_1.logger.info('Navigating to login page...');
            await page.goto('https://home.trainingpeaks.com/login', { waitUntil: 'networkidle' });
            logger_1.logger.info('Accepting cookies...');
            await page.waitForSelector('#onetrust-accept-btn-handler', { state: 'visible' });
            await page.click('#onetrust-accept-btn-handler');
            // Check for empty username or password
            if (!username || !password) {
                throw new Error('Username or password cannot be empty');
            }
            logger_1.logger.info('Entering credentials...');
            await page.waitForSelector('[data-cy="username"]', { state: 'visible' });
            await page.fill('[data-cy="username"]', username);
            await page.waitForSelector('[data-cy="password"]', { state: 'visible' });
            await page.fill('[data-cy="password"]', password);
            logger_1.logger.info('Submitting login form...');
            await page.click('#btnSubmit');
            // Wait for the page to load after submitting the login form
            await page.waitForLoadState('networkidle');
            // Check for error message indicating invalid credentials after navigation
            const errorMessage = await page.waitForSelector('[data_cy="invalid_credentials_message"]', { state: 'visible', timeout: 5000 }).catch(() => null);
            if (errorMessage) {
                const errorText = await page.evaluate(el => el.textContent, errorMessage);
                throw new Error(`Login failed: ${errorText}`);
            }
            // Check if the login was successful by verifying the new page URL or an element
            const currentUrl = page.url();
            if (!currentUrl.includes('https://app.trainingpeaks.com')) {
                throw new Error('Login failed: did not navigate to the expected page');
            }
            // Wait for successful navigation
            await page.waitForURL('https://app.trainingpeaks.com/**', { timeout: 30000 });
            if (!this.accessToken || !this.userId) {
                throw new Error('Failed to retrieve authentication data');
            }
            this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);
            this.setupTokenRefresh();
        }
        catch (error) {
            logger_1.logger.error('Login failed:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            await browser.close();
        }
    }
    setupTokenRefresh() {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }
        const timeUntilRefresh = this.tokenExpiry.getTime() - Date.now();
        this.refreshTimeout = setTimeout(async () => {
            try {
                await this.login(process.env.TP_USERNAME, process.env.TP_PASSWORD);
                this.setupTokenRefresh();
            }
            catch (error) {
                logger_1.logger.error('Token refresh failed:', error);
            }
        }, timeUntilRefresh);
    }
    getToken() {
        if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
            throw new Error('Invalid or expired token');
        }
        return this.accessToken;
    }
    getUserId() {
        return this.userId;
    }
    setupAuthResponseListeners(page) {
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/users/v3/token')) {
                await this.handleTokenResponse(response);
            }
            else if (url.includes('/users/v3/user')) {
                await this.handleUserResponse(response);
            }
        });
    }
    async handleTokenResponse(response) {
        try {
            if (!response.ok()) {
                logger_1.logger.warn(`Token response failed with status ${response.status()}`);
                return;
            }
            const json = await this.parseJsonResponse(response);
            if (!json?.token?.access_token)
                return;
            this.accessToken = json.token.access_token;
            logger_1.logger.info('Successfully retrieved auth token');
        }
        catch (error) {
            logger_1.logger.error('Error processing token response:', error);
        }
    }
    async handleUserResponse(response) {
        try {
            if (!response.ok()) {
                logger_1.logger.warn(`User response failed with status ${response.status()}`);
                return;
            }
            const json = await this.parseJsonResponse(response);
            if (!json?.user.userId)
                return;
            this.userId = json.user.userId;
            logger_1.logger.info('Successfully retrieved user ID');
        }
        catch (error) {
            logger_1.logger.error('Error processing user response:', error);
        }
    }
    async parseJsonResponse(response) {
        try {
            return await response.json();
        }
        catch (error) {
            const text = await response.text().catch(() => '');
            logger_1.logger.warn('Failed to parse response as JSON:', {
                url: response.url(),
                status: response.status(),
                text: text.substring(0, 200),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return null;
        }
    }
}
exports.AuthService = AuthService;
