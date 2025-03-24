import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';

interface ParticipantConnection {
    conversationId: string;
    websocket: WebSocket;
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
     * @returns The connection ID if successful
     */
    async createWebsocketConnection(conversationId: string, websocketUrl: string): Promise<string> {
        try {
            // Close existing connection if it exists
            if (this.participantConnections[conversationId]) {
                await this.closeConnection(conversationId);
            }

            // Create new websocket connection
            const websocket = new WebSocket(websocketUrl);

            // Set up event handlers
            websocket.on('open', () => {
                this.logger.log(`Websocket connection established for ${conversationId}`);
            });

            websocket.on('message', (data) => {
                this.logger.debug(`Received message for ${conversationId}: ${data}`);
                // Update last activity timestamp
                if (this.participantConnections[conversationId]) {
                    this.participantConnections[conversationId].lastActivity = new Date();
                }
            });

            websocket.on('error', (error) => {
                this.logger.error(`Websocket error for ${conversationId}: ${error.message}`);
            });

            websocket.on('close', (code, reason) => {
                this.logger.log(`Websocket closed for ${conversationId}: ${code} - ${reason}`);
                delete this.participantConnections[conversationId];
            });

            // Store the connection
            this.participantConnections[conversationId] = {
                conversationId,
                websocket,
                lastActivity: new Date(),
            };

            return conversationId;
        } catch (error) {
            this.logger.error(`Failed to create websocket connection: ${error.message}`);
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
            this.logger.error(`Failed to send message: ${error.message}`);
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
            this.logger.error(`Error closing websocket: ${error.message}`);
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