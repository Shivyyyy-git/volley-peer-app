
import React, { useState } from 'react';
import { QuizQuestion, UserProfile } from '../types';

interface OnboardingViewProps {
  onOnboardingComplete: (answers: Omit<UserProfile, 'availability'>) => void;
}

const quizData: QuizQuestion[] = [
    {
        section: "Part 1: Your Mission",
        question: "What's your primary goal for joining Volley?",
        key: "goal",
        options: [
            { text: "Advance in my career", value: "career" },
            { text: "Improve my health & wellness", value: "health" },
            { text: "Focus on personal development", value: "personal_growth" },
            { text: "Build better habits", value: "habits" },
        ],
    },
    {
        section: "Part 1: Your Mission",
        question: "In 12 weeks, what does success look like?",
        key: "successDefinition",
        options: [
            { text: "Achieved a specific, measurable outcome", value: "outcome" },
            { text: "Feeling more confident and clear", value: "confidence" },
            { text: "Having a solid plan for my next steps", value: "plan" },
            { text: "Building a consistent routine", value: "routine" },
        ],
    },
    {
        section: "Part 2: Your Communication Style",
        question: "How do you prefer to receive feedback?",
        key: "feedbackPreference",
        options: [
            { text: "Direct and to the point", value: "direct" },
            { text: "Gentle and encouraging", value: "gentle" },
            { text: "A mix of both is ideal", value: "mixed" },
            { text: "Data-driven and objective", value: "objective" },
        ],
    },
    {
        section: "Part 2: Your Communication Style",
        question: "In a typical conversation, you are...",
        key: "talkListenRatio",
        options: [
            { text: "Mostly talking and sharing ideas", value: "talker" },
            { text: "Mostly listening and observing", value: "listener" },
            { text: "A balanced mix of both", value: "balanced" },
            { text: "It depends on the situation", value: "depends" },
        ],
    },
    {
        section: "Part 3: Your Working Style",
        question: "When you face a challenge, you're more likely to:",
        key: "challengeApproach",
        options: [
            { text: "Analyze it logically step-by-step", value: "logical" },
            { text: "Trust my intuition and gut feeling", value: "intuitive" },
            { text: "Talk it through with someone", value: "collaborative" },
            { text: "Experiment with different solutions", value: "experimental" },
        ],
    },
    {
        section: "Part 3: Your Working Style",
        question: "What keeps you motivated on a long-term goal?",
        key: "motivationSource",
        options: [
            { text: "Seeing measurable progress and data", value: "progress" },
            { text: "Regular encouragement from others", value: "encouragement" },
            { text: "My internal drive and passion for the goal", value: "internal" },
            { text: "Focusing on the reward at the end", value: "reward" },
        ],
    }
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ onOnboardingComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Partial<Omit<UserProfile, 'availability'>>>({});

    const handleOptionSelect = (key: keyof Omit<UserProfile, 'availability'>, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question, complete onboarding
            if (Object.keys(answers).length === quizData.length) {
                onOnboardingComplete(answers as Omit<UserProfile, 'availability'>);
            }
        }
    };

    const currentQuestion = quizData[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quizData.length - 1;
    const isOptionSelected = answers[currentQuestion.key] !== undefined;
    const progressPercentage = ((currentQuestionIndex + 1) / quizData.length) * 100;

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome to Volley!</h1>
                    <p className="text-lg text-brand-gray-400">Let's find the perfect peer for you.</p>
                </div>
                
                <div className="w-full bg-brand-gray-700 rounded-full h-2.5 mb-6">
                    <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>

                <div className="bg-brand-gray-800 rounded-lg shadow-2xl p-6 sm:p-8">
                    <p className="text-sm font-semibold text-brand-primary text-center mb-2">{currentQuestion.section}</p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-brand-light mb-6 text-center">{currentQuestion.question}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleOptionSelect(currentQuestion.key, option.value)}
                                className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                                    answers[currentQuestion.key] === option.value
                                        ? 'bg-brand-primary/20 border-brand-primary text-white'
                                        : 'bg-brand-gray-700 border-transparent hover:border-brand-primary/50 text-brand-gray-200'
                                }`}
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                         <button
                            onClick={handleNext}
                            disabled={!isOptionSelected}
                            className="bg-brand-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-indigo-500 transition-colors disabled:bg-brand-gray-600 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {isLastQuestion ? "Start Your First Session" : "Next"}
                        </button>
                    </div>
                </div>
                 <p className="text-center text-sm text-brand-gray-500 mt-6">Your answers help us improve your AI-powered matches.</p>
            </div>
        </div>
    );
};

export default OnboardingView;