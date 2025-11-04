
import React, { useState, useEffect, useCallback } from 'react';
import { generateSessionReport } from '../services/geminiService';
import { SessionReport } from '../types';

interface ReportViewProps {
  transcript: string;
  onStartNewSession: () => void;
  onNavigateToProfile: () => void;
  gamificationData: {
      sessionCount: number;
      streak: number;
  }
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);

const ReportCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-brand-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center mb-4">
            <div className="mr-3 text-brand-secondary">{icon}</div>
            <h3 className="text-lg font-semibold text-brand-light">{title}</h3>
        </div>
        <div className="text-brand-gray-300 space-y-2">{children}</div>
    </div>
);

const AchievementBadge: React.FC<{ icon: React.ReactNode; label: string; achieved: boolean }> = ({ icon, label, achieved }) => (
    <div className={`flex items-center p-3 rounded-lg transition-all ${achieved ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-brand-gray-700 text-brand-gray-400'}`}>
        <div className={`mr-3 ${achieved ? 'opacity-100' : 'opacity-50'}`}>{icon}</div>
        <span className={`font-medium ${achieved ? 'opacity-100' : 'opacity-50'}`}>{label}</span>
    </div>
);

const ReportView: React.FC<ReportViewProps> = ({ transcript, gamificationData, onStartNewSession, onNavigateToProfile }) => {
  const [report, setReport] = useState<SessionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!transcript) {
        setError("No transcript available to generate a report.");
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError(null);
    try {
      const generatedReport = await generateSessionReport(transcript);
      setReport(generatedReport);
    } catch (err) {
      setError('Failed to generate session report. The AI may be experiencing high load. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transcript]);

  useEffect(() => {
    fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-brand-dark p-4">
            <h2 className="text-2xl font-bold mb-4 text-brand-light">Generating Your Session Report...</h2>
            <p className="text-brand-gray-400 mb-8">Kelly is analyzing your conversation for key insights.</p>
            <LoadingSpinner />
        </div>
    );
  }

  if (error || !report) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-brand-dark p-4 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-brand-gray-300 mb-8">{error}</p>
            <button
                onClick={onStartNewSession}
                className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
            >
                Start a New Session
            </button>
        </div>
    );
  }

  const peerATalkPercentage = report.talkTime.peerA || 50;
  const peerBTalkPercentage = report.talkTime.peerB || 50;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Peer Session Intelligence Report</h1>
            <p className="text-brand-gray-400 mt-1">Here's a summary of your coaching session, moderated by Kelly.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
             <button
                onClick={onStartNewSession}
                className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
            >
                Start New Session
            </button>
            <button onClick={onNavigateToProfile} className="p-3 bg-brand-gray-700 rounded-full hover:bg-brand-gray-600 transition-colors" aria-label="View Profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <ReportCard title="Session Summary" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}>
                <p>{report.summary}</p>
            </ReportCard>
            <ReportCard title="Action Items" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
                {report.actionItems.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                        {report.actionItems.map((item, i) => (
                            <li key={i}><strong>{item.owner}:</strong> {item.action}</li>
                        ))}
                    </ul>
                ) : <p>No specific action items were identified.</p>}
            </ReportCard>
             <ReportCard title="Key Highlights" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-brand-light mb-2">Peer A's Highlights</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {report.highlights.peerA.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-brand-light mb-2">Peer B's Highlights</h4>
                         <ul className="list-disc pl-5 space-y-1">
                            {report.highlights.peerB.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </ReportCard>
        </div>
        <div className="space-y-6">
            <ReportCard title="Talk-Time Balance" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6-4a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2h2" /></svg>}>
                <div className="w-full bg-brand-gray-700 rounded-full h-4 flex overflow-hidden">
                    <div className="bg-brand-primary" style={{ width: `${peerATalkPercentage}%` }}></div>
                    <div className="bg-brand-secondary" style={{ width: `${peerBTalkPercentage}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-primary mr-2"></div>Peer A: {peerATalkPercentage}%</span>
                    <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-brand-secondary mr-2"></div>Peer B: {peerBTalkPercentage}%</span>
                </div>
            </ReportCard>
             <ReportCard title="Mood & Engagement" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <p>{report.moodAnalysis}</p>
             </ReportCard>
            <ReportCard title="Progress & Achievements" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <div className="flex justify-around text-center mb-4">
                    <div>
                        <div className="text-3xl font-bold text-white">{gamificationData.sessionCount}</div>
                        <div className="text-sm text-brand-gray-400">Sessions</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">{gamificationData.streak}</div>
                        <div className="text-sm text-brand-gray-400">Day Streak</div>
                    </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-brand-gray-700">
                    <AchievementBadge label="First Session!" achieved={gamificationData.sessionCount >= 1} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>} />
                    <AchievementBadge label="5 Sessions Strong" achieved={gamificationData.sessionCount >= 5} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
                    <AchievementBadge label="Consistency King" achieved={gamificationData.streak >= 3} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88a3 3 0 00-4.242 4.242z" /></svg>} />
                </div>
            </ReportCard>
        </div>
      </div>
    </div>
  );
};

export default ReportView;