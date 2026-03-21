import { Module } from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';
import { DocumentDescriptionController } from './document-description.controller';
import { DocumentDescription } from './document-description.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search/search.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentDescription])],
  providers: [DocumentDescriptionService, SearchService],
  controllers: [DocumentDescriptionController],
})
export class DocumentDescriptionModule {}
