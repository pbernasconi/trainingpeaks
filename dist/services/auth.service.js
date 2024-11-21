"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const logger_1 = require("../utils/logger");
const puppeteer_1 = __importDefault(require("puppeteer"));
class AuthService {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.refreshTimeout = null;
    }
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    async login(username, password) {
        let browser;
        try {
            browser = await puppeteer_1.default.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                defaultViewport: { width: 1920, height: 1080 }
            });
            const page = await browser.newPage();
            // Add better logging
            page.on('console', msg => logger_1.logger.debug('Browser console:', msg.text()));
            logger_1.logger.info('Navigating to TrainingPeaks login page...');
            await page.goto('https://home.trainingpeaks.com/login', {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            logger_1.logger.info('Entering credentials...');
            await page.type('#username', username);
            await page.type('#password', password);
            logger_1.logger.info('Submitting login form...');
            await Promise.all([
                page.click('#login-button'),
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            // Wait for auth token to be present
            logger_1.logger.info('Waiting for auth token...');
            const token = await page.evaluate(() => {
                return new Promise((resolve) => {
                    let attempts = 0;
                    const checkToken = () => {
                        const token = localStorage.getItem('tp.auth.token');
                        if (token) {
                            resolve(token);
                        }
                        else if (attempts < 10) {
                            attempts++;
                            setTimeout(checkToken, 1000);
                        }
                        else {
                            resolve('');
                        }
                    };
                    checkToken();
                });
            });
            if (!token) {
                throw new Error('Failed to retrieve auth token');
            }
            this.token = token;
            this.tokenExpiry = this.calculateTokenExpiry();
            logger_1.logger.info('Successfully authenticated with TrainingPeaks');
        }
        catch (error) {
            logger_1.logger.error('Login failed:', error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    calculateTokenExpiry() {
        // Set expiry to 23 hours from now to refresh before actual expiration
        return new Date(Date.now() + 23 * 60 * 60 * 1000);
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
                logger_1.logger.error('Failed to refresh token:', error);
            }
        }, timeUntilRefresh);
    }
    getToken() {
        if (!this.token || !this.tokenExpiry || this.tokenExpiry < new Date()) {
            throw new Error('Invalid or expired token');
        }
        return this.token;
    }
}
exports.AuthService = AuthService;
