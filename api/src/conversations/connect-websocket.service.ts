import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { connectWebsockMessageSchema, ConnectMessage } from './schemas/connect-message.schema';
import { ZodError } from 'zod';

interface ParticipantConnection {
    conversationId: string;
    websocket: WebSocket;
    heartbeat: NodeJS.Timeout;
    lastActivity: Date;
}

@Injectable()
export class ConnectWebsocketService {
    private readonly logger = new Logger(ConnectWebsocketService.name);
    private participantConnections: Record<string, ParticipantConnection> = {};

    /**
     * Creates and maintains a websocket connection for a participant
     * @param conversationId The Amazon Connect participant connection ID
     * @param websocketUrl The websocket URL provided by Amazon Connect
     * @param userId The ID of the user this connection belongs to
     * @returns The connection ID if successful
     */
    async createWebsocketConnection(
        conversationId: string,
        websocketUrl: string,
        onNewMessage: (message: ConnectMessage) => void
    ): Promise<void> {
        try {
            // Close existing connection if it exists
            if (this.participantConnections[conversationId]) {
                await this.closeConnection(conversationId);
            }

            // Create new websocket connection
            const websocket = new WebSocket(websocketUrl);

            // Wait for connection to open
            await new Promise((resolve, reject) => {
                websocket.once('open', () => {
                    this.logger.log(`Websocket connection established for ${conversationId}`);
                    websocket.send(JSON.stringify({ topic: "aws/subscribe", content: { topics: ["aws/chat"] } }));
                    resolve(void 0);
                });
                websocket.once('error', (error) => reject(error));

                // Set a timeout in case connection hangs
                setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);
            });

            const heartbeatIntervalId = setInterval(() => {
                websocket.send(JSON.stringify({ topic: "aws/ping" }));
                websocket.send(JSON.stringify({ topic: "aws/heartbeat" }));
            }, 30000);

            // Set up event handlers
            websocket.on('message', (data) => {
                try {
                    const rawMessage = JSON.parse(data.toString());
                    this.logger.log(data);
                    const message = connectWebsockMessageSchema.parse(rawMessage);

                    this.logger.debug(`Received validated message for ${conversationId}: ${JSON.stringify(message)}`);

                    // Update last activity timestamp
                    if (this.participantConnections[conversationId]) {
                        this.participantConnections[conversationId].lastActivity = new Date();
                    }

                    // Emit event for other services to consume
                    if (message.topic === 'aws/chat') {
                        onNewMessage(message);
                    }
                } catch (error) {
                    if (error instanceof ZodError) {
                        this.logger.error(`Invalid message format: ${JSON.stringify(error)}`);
                    } else if (error instanceof SyntaxError) {
                        this.logger.error(`Invalid JSON: ${error.message}`);
                    } else {
                        this.logger.error(`Unexpected error processing message: ${error.message}`);
                    }
                }
            });

            websocket.on('error', (error) => {
                this.logger.error(`Websocket error for ${conversationId}: ${error.message} `);
            });

            websocket.on('close', (code, reason) => {
                this.logger.log(`Websocket closed for ${conversationId}: ${code} - ${reason} `);
                clearInterval(this.participantConnections[conversationId].heartbeat);
                delete this.participantConnections[conversationId];
            });

            // Store the connection
            this.participantConnections[conversationId] = {
                conversationId,
                websocket,
                heartbeat: heartbeatIntervalId,
                lastActivity: new Date(),
            };
        } catch (error) {
            this.logger.error(`Failed to create websocket connection: ${error.message} `);
            throw error;
        }
    }

    /**
     * Sends a message through the websocket connection
     * @param conversationId The connection ID
     * @param message The message to send
     * @returns boolean indicating success
     */
    async sendMessage(conversationId: string, message: string | object): Promise<boolean> {
        const connection = this.participantConnections[conversationId];
        if (!connection) {
            this.logger.warn(`No active connection found for ${conversationId}`);
            return false;
        }

        try {
            const messageString = typeof message === 'string' ? message : JSON.stringify(message);
            connection.websocket.send(messageString);
            connection.lastActivity = new Date();
            return true;
        } catch (error) {
            this.logger.error(`Failed to send message: ${error.message} `);
            return false;
        }
    }

    /**
     * Closes a websocket connection
     * @param conversationId The connection ID to close
     */
    async closeConnection(conversationId: string): Promise<void> {
        const connection = this.participantConnections[conversationId];
        if (!connection) {
            return;
        }

        try {
            connection.websocket.close();
        } catch (error) {
            this.logger.error(`Error closing websocket: ${error.message} `);
        } finally {
            delete this.participantConnections[conversationId];
        }
    }

    /**
     * Gets all active connections
     * @returns Array of connection IDs
     */
    getActiveConnections(): string[] {
        return Object.keys(this.participantConnections);
    }

    /**
     * Checks if a connection is active
     * @param conversationId The connection ID to check
     * @returns boolean indicating if connection is active
     */
    isConnectionActive(conversationId: string): boolean {
        return !!this.participantConnections[conversationId];
    }
}