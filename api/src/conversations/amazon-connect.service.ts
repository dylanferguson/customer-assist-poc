import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ConnectClient,
    StartChatContactCommand,
} from "@aws-sdk/client-connect";

@Injectable()
export class AmazonConnectService {
    private readonly client: ConnectClient;

    constructor(private configService: ConfigService) {
        this.client = new ConnectClient({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    async startChat(participantDetails: {
        username: string;
        contactFlowId: string;
        instanceId: string;
    }) {
        const command = new StartChatContactCommand({
            InstanceId: participantDetails.instanceId,
            ContactFlowId: participantDetails.contactFlowId,
            ParticipantDetails: {
                DisplayName: participantDetails.username,
            },
        });

        try {
            const response = await this.client.send(command);
            return response;
        } catch (error) {
            throw new Error(`Failed to start chat: ${error.message}`);
        }
    }
} 