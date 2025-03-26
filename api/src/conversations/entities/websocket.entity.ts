export interface TypingEvent {
    participantType: 'CUSTOMER' | 'AGENT' | 'CUSTOM_BOT';
    participantName: string;
}
