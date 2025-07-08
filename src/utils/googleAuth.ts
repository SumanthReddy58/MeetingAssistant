import { electronAuthService } from './electronAuth';

interface GoogleUser {
  id: string;
  email: string;
  verified_email?: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

class GoogleAuthService {
  // Check if running in Electron environment
  private isElectron(): boolean {
    return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
  }

  async signIn(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    // Use Electron OAuth2 if available, otherwise fallback to web OAuth
    if (this.isElectron()) {
      try {
        const result = await electronAuthService.signIn();
        return result;
      } catch (error) {
        console.warn('Electron OAuth failed, falling back to web OAuth:', error);
        // Continue to web OAuth fallback
      }
    }

    // Web OAuth fallback
    return await electronAuthService.signIn();
  }

  async getCurrentUser(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    return await electronAuthService.getCurrentUser();
  }

  async handleOAuthCallback(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    return await electronAuthService.handleOAuthCallback();
  }

  signOut(): void {
    electronAuthService.signOut();
  }
}

export const googleAuthService = new GoogleAuthService();

  }

  async getCurrentUser(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    const accessToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    const userStr = localStorage.getItem('google_user');

    if (!accessToken || !tokenExpiry || !userStr) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= parseInt(tokenExpiry)) {
      this.signOut();
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return { user, accessToken };
    } catch {
      this.signOut();
      return null;
    }
  }

  async handleOAuthCallback(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    const error = hashParams.get('error');

    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }

    if (accessToken && expiresIn) {
      try {
        const user = await this.getUserInfo(accessToken);
        
        // Store token with expiry
        const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_token_expiry', expiryTime.toString());
        localStorage.setItem('google_user', JSON.stringify(user));

        // Clean up URL
        const redirectPath = sessionStorage.getItem('auth_redirect_path') || '/';
        sessionStorage.removeItem('auth_redirect_path');
        window.history.replaceState({}, document.title, redirectPath);

        return { user, accessToken };
      } catch (error) {
        console.error('Failed to get user info:', error);
        throw error;
      }
    }

    return null;
  }

  signOut(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_user');
    sessionStorage.removeItem('auth_redirect_path');
  }
}

export const googleAuthService = new GoogleAuthService();