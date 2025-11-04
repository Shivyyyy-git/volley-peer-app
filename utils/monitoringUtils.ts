
export const SENTIMENT_KEYWORDS = {
    positive: ['win', 'great', 'good', 'awesome', 'excellent', 'success', 'achieved', 'proud', 'happy', 'excited', 'support', 'helpful', 'wonderful', 'clarity', 'progress'],
    negative: ['challenge', 'problem', 'stuck', 'difficult', 'hard', 'struggle', 'issue', 'concern', 'bad', 'frustrated', 'confused', 'anxious'],
};

export const RISK_WORDS = [
    // Financial/PII
    'password', 'credit card', 'ssn', 'social security', 'bank account', 'pin', 'confidential', 'secret',
    'routing number', 'account number', 'cvv', 'ssn', 'driver license',
    // Money requests
    'send money', 'wire transfer', 'venmo', 'paypal', 'zelle', 'cashapp', 'need money', 'loan', 'borrow money',
    'give me money', 'send cash', 'wire funds', 'transfer funds',
    // Inappropriate language (basic common words)
    'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'hate', 'kill',
    // More severe (add more as needed, keeping it basic for now)
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