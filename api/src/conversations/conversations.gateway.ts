import { Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    OnGatewayInit,
    SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    path: '/v1/ws',
    cors: {
        origin: '*',
    },
})
export class ConversationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private logger: Logger = new Logger(ConversationsGateway.name);
    private readonly AUTH_TIMEOUT = 5000;

    private isAuthenticated(client: Socket): boolean {
        if (!client.data.authenticated) {
            this.logger.warn(`Unauthenticated request from client ${client.id}`);
            client.emit('error', { message: 'Authentication required' });
            return false;
        }
        return true;
    }

    handleConnection(client: Socket, ...args: any[]) {
        const { sockets } = this.server.sockets;

        // Set authentication timeout
        const timeoutId = setTimeout(() => {
            if (!client.data.authenticated) {
                this.logger.warn(`Client ${client.id} failed to authenticate within ${this.AUTH_TIMEOUT}ms`);
                client.disconnect(true);
            }
        }, this.AUTH_TIMEOUT);

        // Store the timeout ID to clear it if auth is successful
        client.data.authTimeoutId = timeoutId;

        this.logger.log(`Client id: ${client.id} connected`);
        this.logger.debug(`Number of connected clients: ${sockets.size}`);
    }

    handleDisconnect(client: any) {
        this.logger.log(`Cliend id:${client.id} disconnected`);
    }

    @SubscribeMessage("ping")
    handleMessage(client: Socket, data: any) {
        if (!this.isAuthenticated(client)) {
            return;
        }

        this.logger.log(`Message received from client id: ${client.id}`);
        this.logger.debug(`Payload: ${data}`);
        return {
            event: "pong",
            data: "Wrong data that will make the test fail",
        };
    }

    @SubscribeMessage('authenticate')
    handleAuthentication(client: Socket, token: string) {
        try {
            // TODO: Add your JWT verification logic here
            // jwt.verify(token, process.env.JWT_SECRET);

            // Clear the timeout since auth was successful
            clearTimeout(client.data.authTimeoutId);
            client.data.authenticated = true;

            return { event: 'authenticated', data: { success: true } };
        } catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
            client.disconnect(true);
            return { event: 'authenticated', data: { success: false, error: 'Invalid token' } };
        }
    }

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
    }
} 