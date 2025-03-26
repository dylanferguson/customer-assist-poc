import { z } from 'zod';

export const participantRoleSchema = z.enum(['AGENT', 'CUSTOMER', 'SYSTEM']);

export const subscribeMessageSchema = z.object({
    topic: z.literal('aws/subscribe'),
    content: z.object({
        topics: z.array(z.literal("aws/chat")),
        status: z.literal('success'),
    })
});

export const heartbeatMessageSchema = z.object({
    topic: z.literal('aws/heartbeat'),
});

export const pingMessageSchema = z.object({
    topic: z.literal('aws/ping'),
    statusCode: z.number(),
    statusContent: z.string()
});

const baseChatMessageSchema = z.object({
    Id: z.string(),
    AbsoluteTime: z.string().datetime(),
    InitialContactId: z.string(),
    ParticipantId: z.string(),
});

const BaseEventSchema = z.object({
    Id: z.string(),
    AbsoluteTime: z.string().datetime(),
    InitialContactId: z.string(),
});

export const EVENT_CONTENT_TYPE = {
    TYPING: "application/vnd.amazonaws.connect.event.typing",
    READ_RECEIPT: "application/vnd.amazonaws.connect.event.message.read",
    DELIVERED_RECEIPT: "application/vnd.amazonaws.connect.event.message.delivered",
    PARTICIPANT_JOINED: "application/vnd.amazonaws.connect.event.participant.joined",
    PARTICIPANT_LEFT: "application/vnd.amazonaws.connect.event.participant.left",
    PARTICIPANT_INVITED: "application/vnd.amazonaws.connect.event.participant.invited",
    TRANSFER_SUCCEEDED: "application/vnd.amazonaws.connect.event.transfer.succeed",
    TRANSFER_FAILED: "application/vnd.amazonaws.connect.event.transfer.failed",
    CONNECTION_ACKNOWLEDGED: "application/vnd.amazonaws.connect.event.connection.acknowledged",
    CHAT_ENDED: "application/vnd.amazonaws.connect.event.chat.ended"
} as const;

const eventChatMessageSchema = baseChatMessageSchema.extend({
    Type: z.literal('EVENT'),
    ParticipantRole: participantRoleSchema.optional(),
    ParticipantId: z.string().optional(),
    ContentType: z.enum([
        EVENT_CONTENT_TYPE.TYPING,
        EVENT_CONTENT_TYPE.READ_RECEIPT,
        EVENT_CONTENT_TYPE.DELIVERED_RECEIPT,
        EVENT_CONTENT_TYPE.PARTICIPANT_JOINED,
        EVENT_CONTENT_TYPE.PARTICIPANT_LEFT,
        EVENT_CONTENT_TYPE.PARTICIPANT_INVITED,
        EVENT_CONTENT_TYPE.TRANSFER_SUCCEEDED,
        EVENT_CONTENT_TYPE.TRANSFER_FAILED,
        EVENT_CONTENT_TYPE.CONNECTION_ACKNOWLEDGED,
        EVENT_CONTENT_TYPE.CHAT_ENDED
    ]),
});

const MESSAGE_CONTENT_TYPE = {
    PLAIN_TEXT: "text/plain",
    MARKDOWN: "text/markdown",
    JSON: "application/json",
    INTERACTIVE: "application/vnd.amazonaws.connect.message.interactive.response",
} as const;

const messageChatMessageSchema = baseChatMessageSchema.extend({
    Type: z.literal('MESSAGE'),
    ContactId: z.string(),
    ParticipantRole: participantRoleSchema,
    Content: z.string(),
    ContentType: z.enum([
        MESSAGE_CONTENT_TYPE.PLAIN_TEXT,
        MESSAGE_CONTENT_TYPE.MARKDOWN,
        MESSAGE_CONTENT_TYPE.JSON,
        MESSAGE_CONTENT_TYPE.INTERACTIVE,
    ]),
});

const chatMessageTypeSchema = z.discriminatedUnion('Type', [
    eventChatMessageSchema,
    messageChatMessageSchema,
]);

export const connectMessageSchema = z.object({
    topic: z.literal('aws/chat'),
    contentType: z.literal('application/json'),
    content: z.preprocess(
        (val) => (typeof val === "string" ? JSON.parse(val) : val),
        chatMessageTypeSchema,
    )
});

export const connectWebsockMessageSchema = z.discriminatedUnion('topic', [
    subscribeMessageSchema,
    heartbeatMessageSchema,
    pingMessageSchema,
    connectMessageSchema,
]);

export type WebSocketMessage = z.infer<typeof connectWebsockMessageSchema>;
export type ConnectMessage = z.infer<typeof connectMessageSchema>;
export type HeartbeatMessage = z.infer<typeof heartbeatMessageSchema>;
export type PingMessage = z.infer<typeof pingMessageSchema>; 