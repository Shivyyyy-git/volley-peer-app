
export interface Prompt {
    question: string;
    speakerTurn: 'Peer A' | 'Peer B';
}

export interface SessionReport {
    talkTime: {
        peerA: number;
        peerB: number;
    };
    highlights: {
        peerA: string[];
        peerB: string[];
    };
    actionItems: Array<{
        action: string;
        owner: 'Peer A' | 'Peer B';
    }>;
    moodAnalysis: string;
    summary: string;
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