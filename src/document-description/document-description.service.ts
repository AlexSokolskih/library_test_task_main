import { Injectable } from '@nestjs/common';
import { DocumentDescription } from './document-description.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DocumentDescriptionService {
  constructor(
    @InjectRepository(DocumentDescription)
    private documentDescriptionRepository: Repository<DocumentDescription>,
  ) {}

  async findAll(): Promise<DocumentDescription[]> {
    return this.documentDescriptionRepository.find();
  }

  async findOne(uuid: string): Promise<DocumentDescription | null> {
    return this.documentDescriptionRepository.findOne({ where: { uuid } });
  }
}
