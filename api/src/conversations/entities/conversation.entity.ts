export enum ConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export class Conversation {
  id: string;
  title: string;
  status: ConversationStatus;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
  unread_count: number;
  closedAt: Date | null;
  archived: boolean;
  archivedAt: Date | null;
} 