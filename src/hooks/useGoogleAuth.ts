import { useState, useEffect, useCallback } from 'react';
import { GoogleAuth } from '@google-cloud/oauth2';

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: GoogleUser | null;
  isLoading: boolean;
  error: string | null;
}

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: false,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = useCallback(async () => {
    try {
      const savedToken = sessionStorage.getItem('google_access_token');
      const savedRefreshToken = sessionStorage.getItem('google_refresh_token');
      const savedUser = sessionStorage.getItem('google_user');
      
      if (savedToken && savedUser) {
        // Verify token is still valid
        const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (response.ok) {
          setAuthState({
            isAuthenticated: true,
            accessToken: savedToken,
            refreshToken: savedRefreshToken,
            user: JSON.parse(savedUser),
            isLoading: false,
            error: null
          });
        } else {
          // Token expired, try to refresh
          if (savedRefreshToken) {
            await refreshAccessToken(savedRefreshToken);
          } else {
            clearSession();
          }
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      clearSession();
    }
  }, []);

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access_token;
        
        // Update stored token
        sessionStorage.setItem('google_access_token', newAccessToken);
        
        // Get updated user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${newAccessToken}`
          }
        });

        if (userResponse.ok) {
          const user = await userResponse.json();
          sessionStorage.setItem('google_user', JSON.stringify(user));
          
          setAuthState(prev => ({
            ...prev,
            accessToken: newAccessToken,
            user,
            isAuthenticated: true,
            error: null
          }));
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearSession();
    }
  };

  const signIn = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      }

      // Try popup first, fallback to redirect if blocked
      await attemptPopupAuth();
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Sign-in failed'
      }));
    }
  };

  const attemptPopupAuth = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin;
    const scope = GOOGLE_SCOPES.join(' ');
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';
    const state = Math.random().toString(36).substring(2, 15);
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=${accessType}&` +
      `prompt=${prompt}&` +
      `state=${state}`;

    // Store state for validation
    sessionStorage.setItem('google_auth_state', state);

    // Try to open popup
    const popup = window.open(
      authUrl, 
      'google-auth', 
      'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
    );
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Popup was blocked, use redirect method instead
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Popup blocked. Redirecting to Google sign-in...' 
      }));
      
      // Small delay to show the message, then redirect
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1500);
      return;
    }

    // Monitor popup for completion
    return new Promise<void>((resolve, reject) => {
      const checkPopup = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            reject(new Error('Authentication cancelled'));
            return;
          }

          // Check if popup has navigated to our redirect URI
          try {
            const url = popup.location.href;
            if (url.includes(redirectUri) && url.includes('code=')) {
              clearInterval(checkPopup);
              popup.close();
              
              // Extract and validate authorization code
              const urlParams = new URLSearchParams(url.split('?')[1]);
              const code = urlParams.get('code');
              const returnedState = urlParams.get('state');
              
              // Validate state parameter
              const storedState = sessionStorage.getItem('google_auth_state');
              if (returnedState !== storedState) {
                reject(new Error('Invalid state parameter'));
                return;
              }
              
              if (code) {
                await exchangeCodeForTokens(code);
                resolve();
              } else {
                reject(new Error('No authorization code received'));
              }
            }
          } catch (e) {
            // Cross-origin error is expected until redirect completes
          }
        } catch (error) {
          clearInterval(checkPopup);
          if (!popup.closed) popup.close();
          reject(error);
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        if (!popup.closed) popup.close();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  };

  // Handle redirect-based auth completion
  useEffect(() => {
    const handleRedirectAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('google_auth_state');
      
      if (code && state && state === storedState) {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        try {
          await exchangeCodeForTokens(code);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Redirect auth error:', error);
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          }));
        }
        
        // Clean up stored state
        sessionStorage.removeItem('google_auth_state');
      }
    };

    handleRedirectAuth();
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = window.location.origin;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const tokenData = await response.json();
      const { access_token, refresh_token } = tokenData;

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const user = await userResponse.json();

      // Store tokens securely in sessionStorage (in-memory for security)
      sessionStorage.setItem('google_access_token', access_token);
      if (refresh_token) {
        sessionStorage.setItem('google_refresh_token', refresh_token);
      }
      sessionStorage.setItem('google_user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Token exchange error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }));
    }
  };

  const signOut = () => {
    clearSession();
  };

  const clearSession = () => {
    sessionStorage.removeItem('google_access_token');
    sessionStorage.removeItem('google_refresh_token');
    sessionStorage.removeItem('google_user');
    
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null
    });
  };

  return {
    ...authState,
    signIn,
    signOut,
    refreshToken: refreshAccessToken
  };
};