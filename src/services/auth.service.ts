
import { logger } from '../utils/logger';
import { chromium, Browser, Page, Response } from 'playwright';

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<void> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (this.accessToken && this.userId && this.tokenExpiry && this.tokenExpiry > new Date()) {
      logger.info('Already authenticated with valid token, skipping login');
      return;
    }

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      page.on('console', msg => logger.debug('Browser:', msg.text()));
      this.setupAuthResponseListeners(page);

      logger.info('Navigating to login page...');
      await page.goto('https://home.trainingpeaks.com/login', { waitUntil: 'networkidle' });

      logger.info('Accepting cookies...');
      await page.waitForSelector('#onetrust-accept-btn-handler', { state: 'visible' });
      await page.click('#onetrust-accept-btn-handler');

      // Check for empty username or password
      if (!username || !password) {
        throw new Error('Username or password cannot be empty');
      }

      logger.info('Entering credentials...');
      await page.waitForSelector('[data-cy="username"]', { state: 'visible' });
      await page.fill('[data-cy="username"]', username);
      await page.waitForSelector('[data-cy="password"]', { state: 'visible' });
      await page.fill('[data-cy="password"]', password);

      logger.info('Submitting login form...');
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

    } catch (error: unknown) {
      logger.error('Login failed:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await browser.close();
    }
  }

  private setupTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const timeUntilRefresh = this.tokenExpiry!.getTime() - Date.now();
    this.refreshTimeout = setTimeout(async () => {
      try {
        await this.login(process.env.TP_USERNAME!, process.env.TP_PASSWORD!);
        this.setupTokenRefresh();
      } catch (error) {
        logger.error('Token refresh failed:', error);
      }
    }, timeUntilRefresh);
  }

  public getToken(): string {
    if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      throw new Error('Invalid or expired token');
    }
    return this.accessToken;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  private setupAuthResponseListeners(page: Page): void {
    page.on('response', async (response) => {
      const url = response.url();

      if (url.includes('/users/v3/token')) {
        await this.handleTokenResponse(response);
      } else if (url.includes('/users/v3/user')) {
        await this.handleUserResponse(response);
      }
    });
  }

  private async handleTokenResponse(response: Response): Promise<void> {
    try {
      if (!response.ok()) {
        logger.warn(`Token response failed with status ${response.status()}`);
        return;
      }

      const json = await this.parseJsonResponse(response);
      if (!json?.token?.access_token) return;

      this.accessToken = json.token.access_token;
      logger.info('Successfully retrieved auth token');
    } catch (error) {
      logger.error('Error processing token response:', error);
    }
  }

  private async handleUserResponse(response: Response): Promise<void> {
    try {
      if (!response.ok()) {
        logger.warn(`User response failed with status ${response.status()}`);
        return;
      }

      const json = await this.parseJsonResponse(response);
      if (!json?.user.userId) return;

      this.userId = json.user.userId;
      logger.info('Successfully retrieved user ID');
    } catch (error) {
      logger.error('Error processing user response:', error);
    }
  }

  private async parseJsonResponse(response: Response): Promise<any | null> {
    try {
      return await response.json();
    } catch (error) {
      const text = await response.text().catch(() => '');
      logger.warn('Failed to parse response as JSON:', {
        url: response.url(),
        status: response.status(),
        text: text.substring(0, 200),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }
} 