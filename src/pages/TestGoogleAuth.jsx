import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const TestGoogleAuth = () => {
  const handleSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    alert('Google login successful! Check console for details.');
  };

  const handleError = () => {
    console.error('Google Login Failed');
    alert('Google login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-8">
      <div className="bg-dark-800 p-8 rounded-lg border border-dark-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Test Google OAuth2
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Client ID: 147677613775-q03t1b3a1emq3na0a4ghc7eu3donck0b.apps.googleusercontent.com
          </p>
          <p className="text-gray-400 text-sm">
            This tests basic Google OAuth2 login without additional scopes.
          </p>
        </div>

        <GoogleOAuthProvider clientId="147677613775-q03t1b3a1emq3na0a4ghc7eu3donck0b.apps.googleusercontent.com">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              text="Sign in with Google"
            />
          </div>
        </GoogleOAuthProvider>

        <div className="mt-6 text-center">
          <a href="/" className="text-primary-500 hover:text-primary-400 text-sm">
            Back to HRMS
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestGoogleAuth;
