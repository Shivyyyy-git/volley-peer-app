
export const SENTIMENT_KEYWORDS = {
    positive: ['win', 'great', 'good', 'awesome', 'excellent', 'success', 'achieved', 'proud', 'happy', 'excited', 'support', 'helpful', 'wonderful', 'clarity', 'progress'],
    negative: ['challenge', 'problem', 'stuck', 'difficult', 'hard', 'struggle', 'issue', 'concern', 'bad', 'frustrated', 'confused', 'anxious'],
};

export const RISK_WORDS = [
    'password', 'credit card', 'ssn', 'social security', 'bank account', 'pin', 'confidential', 'secret'
];

export const analyzeSentiment = (text: string): number => {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    words.forEach(word => {
        const cleanWord = word.replace(/[.,!?]/g, '');
        if (SENTIMENT_KEYWORDS.positive.includes(cleanWord)) {
            score++;
        }
        if (SENTIMENT_KEYWORDS.negative.includes(cleanWord)) {
            score--;
        }
    });
    return score;
};

export const detectRiskWords = (text: string): string | null => {
    const lowerCaseText = text.toLowerCase();
    for (const word of RISK_WORDS) {
        if (lowerCaseText.includes(word)) {
            return word;
        }
    }
    return null;
};