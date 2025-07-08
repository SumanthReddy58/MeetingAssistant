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

    return new Promise((resolve, reject) => {
      // Create auth URL
      const authUrl = new URL('https://accounts.google.com/oauth/authorize');
      authUrl.searchParams.set('client_id', this.CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
      authUrl.searchParams.set('scope', this.SCOPE);
      authUrl.searchParams.set('response_type', 'token');
      authUrl.searchParams.set('include_granted_scopes', 'true');
      authUrl.searchParams.set('state', Date.now().toString());

      // Open popup window
      const popup = window.open(
        authUrl.toString(),
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      // Listen for popup messages
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();

          try {
            const { accessToken, expiresIn } = event.data;
            const user = await this.getUserInfo(accessToken);
            
            // Store token with expiry
            const expiryTime = Date.now() + (expiresIn * 1000);
            localStorage.setItem('google_access_token', accessToken);
            localStorage.setItem('google_token_expiry', expiryTime.toString());
            localStorage.setItem('google_user', JSON.stringify(user));

            resolve({ user, accessToken });
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          resolve(null);
        }
      }, 1000);
    });
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

  signOut(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_user');
  }

  // Handle OAuth callback in popup
  handleOAuthCallback(): void {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresIn = hashParams.get('expires_in');
    const error = hashParams.get('error');

    if (error) {
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
    } else if (accessToken && expiresIn) {
      window.opener?.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        accessToken,
        expiresIn: parseInt(expiresIn)
      }, window.location.origin);
    }
  }
}

export const googleAuthService = new GoogleAuthService();

// Auto-handle OAuth callback if we're in a popup
if (window.opener && window.location.hash.includes('access_token')) {
  googleAuthService.handleOAuthCallback();
}