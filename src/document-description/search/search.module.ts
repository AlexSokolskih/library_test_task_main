import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentDescription } from '../document-description.entity';
import { DocumentDescriptionRepository } from './repositories/document-description.repository';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentDescription])],
  providers: [DocumentDescriptionRepository, SearchService],
  exports: [SearchService],
})
export class SearchModule {}
