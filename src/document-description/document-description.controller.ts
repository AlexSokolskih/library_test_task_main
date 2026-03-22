import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';
import type { Request, Response } from 'express';
import { Readable, Transform, TransformCallback, pipeline } from 'stream';

@Controller('document-descriptions')
export class DocumentDescriptionController {
  constructor(
    private readonly documentDescriptionService: DocumentDescriptionService,
  ) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('per_page') perPage: string = '20',
    @Query('page') page: string = '1',
    @Query('search') search?: string,
  ) {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('application/ndjson')) {
      return this.getAllDocumentsLikeStream(res);
    }

    const take = Number.parseInt(perPage, 10);
    const pageNumber = Number.parseInt(page, 10);

    const data = await this.documentDescriptionService.findAll(
      take,
      pageNumber,
      search,
    );
    return res.json(data);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.documentDescriptionService.findOne(uuid);
  }

  private async getAllDocumentsLikeStream(@Res() res: Response) {
    const dbStream: Readable =
      await this.documentDescriptionService.createDocumentStream();

    res.setHeader('Content-Type', 'application/ndjson');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="export.ndjson"',
    );
    res.setHeader('Transfer-Encoding', 'chunked');
    const ndjsonTransform = new Transform({
      objectMode: true,
      transform(row: any, _enc: BufferEncoding, cb: TransformCallback) {
        cb(null, JSON.stringify(row) + '\n');
      },
    });

    pipeline(dbStream, ndjsonTransform, res, (err) => {
      if (err) {
        console.error('stream error', err);
      }
    });
  }
}
