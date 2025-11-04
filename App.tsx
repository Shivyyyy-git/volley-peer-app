
import React, { useState, useEffect } from 'react';
import OnboardingView from './components/OnboardingView';
import SessionView from './components/SessionView';
import ReportView from './components/ReportView';
import ProfileView from './components/ProfileView';
import { UserProfile } from './types';

type AppView = 'onboarding' | 'session' | 'report' | 'profile';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionTranscript, setSessionTranscript] = useState<string>('');
  const [gamificationData, setGamificationData] = useState({ sessionCount: 0, streak: 0 });

  // Load user profile from local storage on initial load
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('volley_user_profile');
      const savedGamification = localStorage.getItem('volley_gamification');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
        setView('session'); // If profile exists, skip onboarding
      }
      if (savedGamification) {
        setGamificationData(JSON.parse(savedGamification));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // If loading fails, ensure we start from onboarding.
      setView('onboarding');
    }
  }, []);

  const handleOnboardingComplete = (answers: Omit<UserProfile, 'availability'>) => {
    const newProfile: UserProfile = { ...answers, availability: [] }; // Default availability
    setUserProfile(newProfile);
    localStorage.setItem('volley_user_profile', JSON.stringify(newProfile));
    setView('session');
  };

  const handleSessionEnd = (transcript: string) => {
    setSessionTranscript(transcript);
    const newGamificationData = {
      sessionCount: gamificationData.sessionCount + 1,
      // Simple streak increment for now, a real implementation would check dates
      streak: gamificationData.streak + 1, 
    };
    setGamificationData(newGamificationData);
    localStorage.setItem('volley_gamification', JSON.stringify(newGamificationData));
    setView('report');
  };

  const handleStartNewSession = () => {
    setSessionTranscript('');
    setView('session');
    // Clear the hash to allow creating a new session
    window.location.hash = '';
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('volley_user_profile', JSON.stringify(updatedProfile));
    // The ProfileView will navigate back on its own after saving
  };
  
  const handleNavigateToProfile = () => {
      setView('profile');
  };

  const renderContent = () => {
    switch (view) {
      case 'onboarding':
        return <OnboardingView onOnboardingComplete={handleOnboardingComplete} />;
      
      case 'session':
        // The user should not be able to access session view without completing onboarding.
        if (!userProfile) {
            // This is a fallback in case localStorage fails or is cleared.
            setView('onboarding');
            return <OnboardingView onOnboardingComplete={handleOnboardingComplete} />;
        }
        return <SessionView onEndSession={handleSessionEnd} />;
      
      case 'report':
        return (
          <ReportView
            transcript={sessionTranscript}
            gamificationData={gamificationData}
            onStartNewSession={handleStartNewSession}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
      
      case 'profile':
        if (!userProfile) {
            // Should not happen, but as a fallback redirect to onboarding
            setView('onboarding');
            return null;
        }
        return (
            <ProfileView 
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onBack={() => setView('report')} // Go back to report view from profile
            />
        );
      default:
        // Default to onboarding if view state is invalid
        return <OnboardingView onOnboardingComplete={handleOnboardingComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
