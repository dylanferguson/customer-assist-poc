export enum ParticipantRole {
  CUSTOM_BOT = 'CUSTOM_BOT',
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
  SUPERVISOR = 'SUPERVISOR',
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  contentType: string;
  createdAt: Date;
  participantRole: ParticipantRole;
  participantName: string;
}