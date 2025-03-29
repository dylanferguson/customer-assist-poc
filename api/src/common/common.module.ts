import { Global, Module } from '@nestjs/common';
import { RedactionService } from './services/redaction.service';

@Global()
@Module({
    providers: [
        RedactionService,
    ],
    exports: [
        RedactionService,
    ],
})
export class CommonModule { } 