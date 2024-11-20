import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailForm from './auth/EmailForm';
import PhoneForm from './auth/PhoneForm';

type AuthMethod = 'email' | 'phone';

export default function AuthForm() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, hasCompletedOnboarding } = useAuth();

  const handleEmailSubmit = async (email: string, password: string) => {
    try {
      setError('');
      setLoading(true);

      if (isLogin) {
        await login(email, password);
        navigate(hasCompletedOnboarding ? '/express' : '/discover', { replace: true });
      } else {
        await signup(email, password);
        navigate('/discover', { replace: true });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (phone: string) => {
    try {
      setError('');
      setLoading(true);
      // Phone auth implementation here
      navigate('/discover', { replace: true });
    } catch (err: any) {
      setError('Phone authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex rounded-lg bg-gray-800/30 p-1">
        <button
          onClick={() => setAuthMethod('email')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'email' 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setAuthMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            authMethod === 'phone' 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Phone
        </button>
      </div>
      
      {authMethod === 'email' ? (
        <EmailForm
          isLogin={isLogin}
          onSubmit={handleEmailSubmit}
          loading={loading}
        />
      ) : (
        <PhoneForm
          onSubmit={handlePhoneSubmit}
          loading={loading}
        />
      )}
      
      {authMethod === 'email' && (
        <div className="text-sm text-center">
          <span className="text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      )}
    </div>
  );
}