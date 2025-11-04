
export interface Prompt {
    question: string;
    speakerTurn: 'Peer A' | 'Peer B';
}

export interface SessionReport {
    talkTime: {
        peerA: number;
        peerB: number;
        peerADetails?: string;
        peerBDetails?: string;
    };
    highlights: {
        peerA: string[];
        peerB: string[];
    };
    actionItems: Array<{
        action: string;
        owner: 'Peer A' | 'Peer B';
        completed?: boolean;
    }>;
    sentimentAnalysis: {
        overall: string;
        peerA: {
            sentiment: 'positive' | 'neutral' | 'negative';
            whatWentWell: string[];
            whatWentWrong: string[];
            emotionalState: string;
        };
        peerB: {
            sentiment: 'positive' | 'neutral' | 'negative';
            whatWentWell: string[];
            whatWentWrong: string[];
            emotionalState: string;
        };
    };
    riskWords: {
        detected: boolean;
        words?: string[];
        categories?: string[];
        severity?: 'low' | 'medium' | 'high';
    };
    homeworkCompletion: {
        peerA: {
            totalCommitments: number;
            completed: number;
            items: Array<{
                commitment: string;
                completed: boolean;
                notes?: string;
            }>;
        };
        peerB: {
            totalCommitments: number;
            completed: number;
            items: Array<{
                commitment: string;
                completed: boolean;
                notes?: string;
            }>;
        };
    };
    moodAnalysis: string;
    summary: string;
    engagementScore: {
        peerA: number;
        peerB: number;
        overall: number;
    };
}

export interface UserProfile {
    goal: string;
    successDefinition: string;
    feedbackPreference: string;
    talkListenRatio: string;
    challengeApproach: string;
    motivationSource: string;
    availability: string[];
}

export interface QuizQuestion {
    section: string;
    question: string;
    key: keyof Omit<UserProfile, 'availability'>;
    options: Array<{
        text: string;
        value: string;
    }>;
}