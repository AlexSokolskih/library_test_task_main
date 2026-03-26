import { Module } from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';
import { DocumentDescriptionController } from './document-description.controller';
import { DocumentDescription } from './document-description.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search/search.service';
import { StreamService } from './stream/stream.service';
import { DocumentDescriptionRepository } from './repositories/document-description.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentDescription])],
  providers: [
    DocumentDescriptionService,
    SearchService,
    StreamService,
    DocumentDescriptionRepository,
  ],
  controllers: [DocumentDescriptionController],
})
export class DocumentDescriptionModule {}
