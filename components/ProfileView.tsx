
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onBack: () => void;
}

const goalOptions = [
    { text: "Advance in my career", value: "career" },
    { text: "Improve my health & wellness", value: "health" },
    { text: "Focus on personal development", value: "personal_growth" },
    { text: "Build better habits", value: "habits" },
];
const successDefinitionOptions = [
    { text: "Achieved a specific, measurable outcome", value: "outcome" },
    { text: "Feeling more confident and clear", value: "confidence" },
    { text: "Having a solid plan for my next steps", value: "plan" },
    { text: "Building a consistent routine", value: "routine" },
];
const feedbackPreferenceOptions = [
    { text: "Direct and to the point", value: "direct" },
    { text: "Gentle and encouraging", value: "gentle" },
    { text: "A mix of both is ideal", value: "mixed" },
    { text: "Data-driven and objective", value: "objective" },
];
const talkListenRatioOptions = [
    { text: "Mostly talking and sharing ideas", value: "talker" },
    { text: "Mostly listening and observing", value: "listener" },
    { text: "A balanced mix of both", value: "balanced" },
    { text: "It depends on the situation", value: "depends" },
];
const challengeApproachOptions = [
    { text: "Analyze it logically step-by-step", value: "logical" },
    { text: "Trust my intuition and gut feeling", value: "intuitive" },
    { text: "Talk it through with someone", value: "collaborative" },
    { text: "Experiment with different solutions", value: "experimental" },
];
const motivationSourceOptions = [
    { text: "Seeing measurable progress and data", value: "progress" },
    { text: "Regular encouragement from others", value: "encouragement" },
    { text: "My internal drive and passion for the goal", value: "internal" },
    { text: "Focusing on the reward at the end", value: "reward" },
];
const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onUpdateProfile, onBack }) => {
    const [profileData, setProfileData] = useState<UserProfile>(userProfile);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleFieldChange = (field: keyof Omit<UserProfile, 'availability'>, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvailabilityChange = (day: string) => {
        setProfileData(prev => {
            const newAvailability = prev.availability.includes(day)
                ? prev.availability.filter(d => d !== day)
                : [...prev.availability, day];
            return { ...prev, availability: newAvailability };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveState('saving');
        // Simulate API call
        setTimeout(() => {
            onUpdateProfile(profileData);
            setSaveState('saved');
            setTimeout(() => onBack(), 1000);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Profile</h1>
                    <p className="text-lg text-brand-gray-400">Keep your preferences up-to-date for the best matches.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-brand-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 space-y-8">
                    
                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Primary Goal</label>
                        <select value={profileData.goal} onChange={(e) => handleFieldChange('goal', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {goalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Success Definition</label>
                        <select value={profileData.successDefinition} onChange={(e) => handleFieldChange('successDefinition', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {successDefinitionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Feedback Preference</label>
                        <select value={profileData.feedbackPreference} onChange={(e) => handleFieldChange('feedbackPreference', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {feedbackPreferenceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Communication Style</label>
                        <select value={profileData.talkListenRatio} onChange={(e) => handleFieldChange('talkListenRatio', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {talkListenRatioOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Challenge Approach</label>
                        <select value={profileData.challengeApproach} onChange={(e) => handleFieldChange('challengeApproach', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {challengeApproachOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Motivation Source</label>
                        <select value={profileData.motivationSource} onChange={(e) => handleFieldChange('motivationSource', e.target.value)} className="w-full bg-brand-gray-700 text-white p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none">
                            {motivationSourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                        </select>
                    </div>

                     <div>
                        <label className="text-lg font-semibold text-brand-light mb-4 block">Preferred Availability</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {availabilityOptions.map(day => (
                                <button
                                    type="button"
                                    key={day}
                                    onClick={() => handleAvailabilityChange(day)}
                                    className={`p-3 rounded-lg text-center transition-all duration-200 border-2 ${
                                        profileData.availability.includes(day)
                                            ? 'bg-brand-primary/20 border-brand-primary text-white'
                                            : 'bg-brand-gray-700 border-transparent hover:border-brand-primary/50 text-brand-gray-200'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-brand-gray-700">
                         <button
                            type="button"
                            onClick={onBack}
                            className="text-white font-semibold px-8 py-3 rounded-full hover:bg-brand-gray-700 transition-colors w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                         <button
                            type="submit"
                            disabled={saveState !== 'idle'}
                            className="bg-brand-secondary text-white font-semibold px-8 py-3 rounded-full hover:bg-green-500 transition-colors disabled:bg-brand-gray-600 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {saveState === 'idle' && 'Save Changes'}
                            {saveState === 'saving' && 'Saving...'}
                            {saveState === 'saved' && 'Saved!'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileView;