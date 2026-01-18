
import React, { useState, useEffect } from 'react';
import { AppScreen, User, VoiceNote } from './types';
import { getCurrentUser, setCurrentUser } from './services/storageService';
import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import RecordView from './components/Views/RecordView';
import NotesView from './components/Views/NotesView';
import ReportsView from './components/Views/ReportsView';
import SettingsView from './components/Views/SettingsView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.RECORD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentUser(newUser);
    setCurrentScreen(AppScreen.RECORD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setCurrentScreen(AppScreen.LOGIN);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen} 
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto pb-20 md:pb-8">
          {currentScreen === AppScreen.RECORD && <RecordView user={user} />}
          {currentScreen === AppScreen.NOTES && <NotesView user={user} />}
          {currentScreen === AppScreen.REPORTS && <ReportsView user={user} />}
          {currentScreen === AppScreen.SETTINGS && <SettingsView user={user} onLogout={handleLogout} />}
        </div>
      </main>
    </div>
  );
};

export default App;
