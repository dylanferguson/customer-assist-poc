import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ConnectClient,
    RehydrationType,
    StartChatContactCommand,
} from "@aws-sdk/client-connect";
import { Env } from '../config/env.validation';

@Injectable()
export class AmazonConnectService {
    private readonly client: ConnectClient;
    private readonly instanceId: string;
    private readonly contactFlowId: string;

    constructor(
        private configService: ConfigService<Env>,
        @Optional() instanceId?: string,
        @Optional() contactFlowId?: string
    ) {
        this.instanceId = instanceId || this.configService.get<string>('AWS_CONNECT_INSTANCE_ID');
        this.contactFlowId = contactFlowId || this.configService.get<string>('AWS_CONNECT_CONTACT_FLOW_ID');

        if (!this.instanceId) {
            throw new Error('AWS_CONNECT_INSTANCE_ID is not configured');
        }
        if (!this.contactFlowId) {
            throw new Error('AWS_CONNECT_CONTACT_FLOW_ID is not configured');
        }

        this.client = new ConnectClient({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
                sessionToken: this.configService.get<string>('AWS_SESSION_TOKEN'),
            },
        });
    }

    async startChat({
        customerDisplayName,
        lastContactId,
        attributes,
    }: {
        customerDisplayName: string;
        lastContactId?: string;
        attributes?: Record<string, string>;
    }) {
        const command = new StartChatContactCommand({
            InstanceId: this.instanceId,
            ContactFlowId: this.contactFlowId,
            ChatDurationInMinutes: this.configService.get<number>('AWS_CONNECT_CHAT_DURATION_IN_MINUTES'),
            SupportedMessagingContentTypes: ['text/plain'],
            ParticipantDetails: {
                DisplayName: customerDisplayName,
            },
            ...(lastContactId && {
                PersistentChat: {
                    RehydrationType: RehydrationType.ENTIRE_PAST_SESSION,
                    SourceContactId: lastContactId,
                }
            }),
            ...(attributes && {
                Attributes: attributes,
            }),
        });

        try {
            const response = await this.client.send(command);
            return response;
        } catch (error) {
            throw new Error(`Failed to start chat: ${error.message}`);
        }
    }
} 