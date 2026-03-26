import { Module } from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';
import { DocumentDescriptionController } from './document-description.controller';
import { SearchModule } from './search/search.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [SearchModule, StreamModule],
  providers: [DocumentDescriptionService],
  controllers: [DocumentDescriptionController],
})
export class DocumentDescriptionModule {}
