interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

class GoogleAuthService {
  private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private readonly REDIRECT_URI = window.location.origin;
  private readonly SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar';

  async signIn(): Promise<{ user: GoogleUser; accessToken: string } | null> {
    if (!this.CLIENT_ID) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    // Store the current path to redirect back after auth
    sessionStorage.setItem('auth_redirect_path', window.location.pathname);

    // Create auth URL for redirect flow
    const authUrl = new URL('https://accounts.google.com/oauth/authorize');
    authUrl.searchParams.set('client_id', this.CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.set('scope', this.SCOPE);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('state', Date.now().toString());

    // Redirect to Google OAuth
    window.location.href = authUrl.toString();
    
    return null; // This won't return since we're redirecting
  }

  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return await response.json();
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