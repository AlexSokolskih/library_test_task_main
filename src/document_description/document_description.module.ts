import { Module } from '@nestjs/common';
import { DocumentDescriptionService } from './document_description.service';
import { DocumentDescriptionController } from './document_description.controller';

@Module({
  providers: [DocumentDescriptionService],
  controllers: [DocumentDescriptionController],
})
export class DocumentDescriptionModule {}
