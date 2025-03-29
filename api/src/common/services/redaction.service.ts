import { Injectable } from '@nestjs/common';

/**
 * Service for redacting sensitive information from text.
 * It could be extended via AWS Comprehend, but it would impact
 * service latency.
 */
@Injectable()
export class RedactionService {
    private readonly CREDIT_CARD_PATTERN = /\b(?:\d[ -]*?){13,16}\b/g;

    public redactText(text: string): string {
        if (!text) return text;

        return text.replace(this.CREDIT_CARD_PATTERN, '[CCNUMBER]');
    }
} 