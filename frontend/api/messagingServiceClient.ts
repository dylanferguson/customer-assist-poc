import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Type definitions based on the OpenAPI spec
export interface Error {
    error: string;
}

export interface Conversation {
    id: string;
    title: string;
    status: 'open' | 'closed';
    user_id: string;
    createdAt: string;
    updatedAt: string;
    unread_count: number;
    closedAt: string | null;
    archived: boolean;
    archivedAt: string | null;
}

export interface Message {
    id: string;
    content: string;
    contentType: 'plain_text';
    createdAt: string;
    participantRole: 'CUSTOM_BOT' | 'CUSTOMER' | 'AGENT' | 'SYSTEM' | 'SUPERVISOR';
    participantName: string;
}

export interface ConversationList {
    conversations: Array<Conversation & { lastMessage: Message }>;
    _links: {
        next?: {
            href: string;
        };
    };
}

export interface MessageList {
    data: Message[];
    _links: {
        next?: {
            href: string;
        };
    };
}

// Request types
export interface CreateConversationRequest {
    title?: string;
}

export interface UpdateConversationRequest {
    status?: 'open' | 'closed';
    archived?: boolean;
    subject?: string;
}

export interface GetConversationsRequest {
    limit?: number;
    cursor?: string;
    order?: 'asc' | 'desc';
    is_archived?: boolean;
}

export interface SendMessageRequest {
    content: string;
    contentType: 'plain_text';
}

/**
 * Type for token provider callback function
 */
export type TokenProvider = () => Promise<string | null>;

/**
 * API client for the Messaging Service
 */
export class MessagingServiceClient {
    private client: AxiosInstance;
    private baseUrl: string = 'http://localhost:3000/v1';
    private getAuthToken: () => Promise<string | null>;

    /**
     * Create a new MessagingServiceClient
     * @param tokenProvider Async callback that returns the authentication token
     * @param config Optional axios configuration
     */
    constructor(getAuthToken: () => Promise<string | null>, config?: AxiosRequestConfig) {
        this.getAuthToken = getAuthToken;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            ...config,
        });

        // Add a request interceptor to include the JWT token
        this.client.interceptors.request.use(async (config) => {
            const token = await this.getAuthToken();
            if (!token) {
                throw new Error('No token provided');
            }

            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        }, (error: AxiosError) => {
            return Promise.reject(error);
        });
    }

    /**
     * Create a new conversation
     * @param data Optional conversation data
     * @returns The created conversation
     */
    async createConversation(data?: CreateConversationRequest): Promise<Conversation> {
        const response = await this.client.post<Conversation>('/conversations', data);
        return response.data;
    }

    /**
     * Get a list of conversations
     * @param params Query parameters
     * @returns List of conversations
     */
    async getConversations(params?: GetConversationsRequest): Promise<ConversationList> {
        const response = await this.client.get<ConversationList>('/conversations', { params });
        return response.data;
    }

    /**
     * Get a conversation by ID
     * @param conversationId The conversation ID
     * @returns The conversation details
     */
    async getConversation(conversationId: string): Promise<Conversation> {
        const response = await this.client.get<Conversation>(`/conversations/${conversationId}`);
        return response.data;
    }

    /**
     * Update a conversation
     * @param conversationId The conversation ID
     * @param data The data to update
     * @returns The updated conversation
     */
    async updateConversation(
        conversationId: string,
        data: UpdateConversationRequest
    ): Promise<Conversation> {
        const response = await this.client.patch<Conversation>(
            `/conversations/${conversationId}`,
            data
        );
        return response.data;
    }

    /**
     * Get messages for a conversation
     * @param conversationId The conversation ID
     * @returns List of messages
     */
    async getMessages(conversationId: string): Promise<MessageList> {
        const response = await this.client.get<MessageList>(
            `/conversations/${conversationId}/messages`
        );
        return response.data;
    }

    /**
     * Send a message in a conversation
     * @param conversationId The conversation ID
     * @param data The message data
     * @returns The sent message
     */
    async sendMessage(
        conversationId: string,
        data: SendMessageRequest
    ): Promise<Message> {
        const response = await this.client.post<Message>(
            `/conversations/${conversationId}/messages`,
            data
        );
        return response.data;
    }
} 