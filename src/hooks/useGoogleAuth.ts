import { useState, useEffect } from 'react';

interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: any | null;
}

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    accessToken: null,
    user: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const savedToken = localStorage.getItem('google_access_token');
    const savedUser = localStorage.getItem('google_user');
    
    if (savedToken && savedUser) {
      setAuthState({
        isAuthenticated: true,
        accessToken: savedToken,
        user: JSON.parse(savedUser)
      });
    }
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    
    try {
      // Initialize Google OAuth
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      // Create OAuth URL
      const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
      const redirectUri = window.location.origin;
      const responseType = 'token';
      
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${responseType}&` +
        `scope=${encodeURIComponent(scope)}`;

      // Open popup for authentication
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      // Listen for the popup to close or receive the token
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
        }
        
        try {
          if (popup?.location.hash) {
            const hash = popup.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            
            if (accessToken) {
              clearInterval(checkClosed);
              popup.close();
              
              // Get user info
              fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              })
              .then(response => response.json())
              .then(user => {
                // Save to localStorage
                localStorage.setItem('google_access_token', accessToken);
                localStorage.setItem('google_user', JSON.stringify(user));
                
                setAuthState({
                  isAuthenticated: true,
                  accessToken,
                  user
                });
                setIsLoading(false);
              });
            }
          }
        } catch (e) {
          // Cross-origin error is expected until redirect
        }
      }, 1000);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user');
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      user: null
    });
  };

  return {
    ...authState,
    isLoading,
    signIn,
    signOut
  };
};