export interface TypingEvent {
    conversationId: string;
    participantType: 'CUSTOMER' | 'AGENT' | 'CUSTOM_BOT';
    participantName: string;
}
