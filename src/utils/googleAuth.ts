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
  private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private readonly SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar';

  // Check if running in Electron environment
  private isElectron(): boolean {
    return typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
  }

  async signIn(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    if (!this.CLIENT_ID) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    console.log('Starting Google sign-in process...');
    console.log('Environment:', this.isElectron() ? 'Electron' : 'Web');
    console.log('Client ID configured:', !!this.CLIENT_ID);

    if (this.isElectron()) {
      return this.electronOAuth();
    } else {
      return this.webOAuth();
    }
  }

  private async electronOAuth(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    try {
      console.log('Attempting Electron OAuth...');
      
      // Import electron-oauth2 dynamically to avoid issues in browser
      const { default: electronOauth2 } = await import('electron-oauth2');
      
      const config = {
        clientId: this.CLIENT_ID,
        clientSecret: '', // Not needed for implicit flow
        authorizationUrl: 'https://accounts.google.com/oauth/authorize',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        useBasicAuthorizationHeader: false,
        redirectUri: 'http://localhost',
        additionalAuthorizationParams: {
          scope: this.SCOPE,
          response_type: 'token',
          include_granted_scopes: 'true'
        }
      };

      const windowParams = {
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      };

      const oauth2 = electronOauth2(config, windowParams);
      
      return new Promise((resolve, reject) => {
        oauth2.getAccessToken({})
          .then(async (token: any) => {
            try {
              console.log('Electron OAuth token received');
              const user = await this.getUserInfo(token.access_token);
              
              // Store token with expiry
              const expiryTime = Date.now() + (token.expires_in * 1000);
              localStorage.setItem('google_access_token', token.access_token);
              localStorage.setItem('google_token_expiry', expiryTime.toString());
              localStorage.setItem('google_user', JSON.stringify(user));

              console.log('User authenticated successfully:', user.email);
              resolve({
                user,
                accessToken: token.access_token
              });
            } catch (error) {
              console.error('Failed to get user info:', error);
              reject(error);
            }
          })
          .catch((error) => {
            console.error('Electron OAuth error:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Electron OAuth failed:', error);
      // Fallback to web OAuth if Electron OAuth fails
      console.log('Falling back to web OAuth...');
      return this.webOAuth();
    }
  }

  private async webOAuth(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    console.log('Starting web OAuth flow...');
    
    // Store the current path to redirect back after auth
    sessionStorage.setItem('auth_redirect_path', window.location.pathname);

    // Create auth URL for redirect flow
    const authUrl = new URL('https://accounts.google.com/oauth/authorize');
    authUrl.searchParams.set('client_id', this.CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', window.location.origin);
    authUrl.searchParams.set('scope', this.SCOPE);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('state', Date.now().toString());

    console.log('Redirecting to:', authUrl.toString());

    // Redirect to Google OAuth
    window.location.href = authUrl.toString();
    
    return null; // This won't return since we're redirecting
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    console.log('Fetching user info...');
    
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get user info:', response.status, errorText);
      throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
    }

    const user = await response.json();
    console.log('User info received:', { email: user.email, name: user.name });
    return user;
  }

  async getCurrentUser(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    const accessToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    const userStr = localStorage.getItem('google_user');

    if (!accessToken || !tokenExpiry || !userStr) {
      console.log('No stored authentication found');
      return null;
    }

    // Check if token is expired
    if (Date.now() >= parseInt(tokenExpiry)) {
      console.log('Stored token has expired');
      this.signOut();
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('Found valid stored authentication for:', user.email);
      return { user, accessToken };
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      this.signOut();
      return null;
    }
  }

  async handleOAuthCallback(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    console.log('Handling OAuth callback...');
    console.log('Current URL:', window.location.href);
    
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      const errorMessage = `OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (accessToken && expiresIn) {
      try {
        console.log('Processing OAuth callback with access token');
        const user = await this.getUserInfo(accessToken);
        
        // Store token with expiry
        const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem('google_access_token', accessToken);
        localStorage.setItem('google_token_expiry', expiryTime.toString());
        localStorage.setItem('google_user', JSON.stringify(user));

        console.log('OAuth callback processed successfully');

        return { user, accessToken };
      } catch (error) {
        console.error('Failed to process OAuth callback:', error);
        throw error;
      }
    }

    console.log('No access token found in OAuth callback');
    return null;
  }

  signOut(): void {
    console.log('Signing out user...');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_user');
    sessionStorage.removeItem('auth_redirect_path');
  }

  // Test the stored token validity
  async validateStoredToken(): Promise<boolean> {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return false;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

export const googleAuthService = new GoogleAuthService();