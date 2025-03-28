export type RedactionType = 'creditCard';

const REDACTION_PATTERNS = {
    creditCard: {
        pattern: /\b(?:\d[ -]*?){13,16}\b/g,
        replacement: '[CCNUMBER]'
    },
};

export const redact = (text: string, types: RedactionType[] = ['creditCard']): string => {
    return types.reduce((redactedText, type) => {
        const { pattern, replacement } = REDACTION_PATTERNS[type];
        return redactedText.replace(pattern, replacement);
    }, text);
}; 