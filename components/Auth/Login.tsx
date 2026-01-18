
import React from 'react';
import { User } from '../../types';
import { STRINGS, APP_NAME } from '../../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleMockLogin = () => {
    onLogin({
      id: 'user_123',
      name: 'Zaw Zaw',
      email: 'zawzaw@example.com',
      avatar: 'https://picsum.photos/seed/zaw/200'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{APP_NAME}</h1>
          <p className="text-gray-500 mt-2">{STRINGS.MY.welcome}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleMockLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {STRINGS.MY.google_login}
          </button>
          
          <button 
            onClick={handleMockLogin}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold"
          >
            {STRINGS.MY.email_login}
          </button>

          <button 
            onClick={handleMockLogin}
            className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold"
          >
            {STRINGS.MY.phone_login}
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          မြန်မာစာ ယူနီကုတ်ဖြင့် အလိုအလျောက် မှတ်တမ်းတင်ပေးမည့် ကိုယ်ရေးကိုယ်တာ AI အတွင်းရေးမှူး
        </div>
      </div>
    </div>
  );
};

export default Login;
