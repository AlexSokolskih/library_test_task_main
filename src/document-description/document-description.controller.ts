import { Controller, Get, Param } from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';

@Controller('document-descriptions')
export class DocumentDescriptionController {
  constructor(
    private readonly documentDescriptionService: DocumentDescriptionService,
  ) {}

  @Get()
  findAll() {
    return this.documentDescriptionService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.documentDescriptionService.findOne(uuid);
  }
}
