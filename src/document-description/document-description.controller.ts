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
    @Query('per_page') perPage?: string,
    @Query('page') page?: string,
  ) {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('application/ndjson')) {
      return this.getAllDocumentsLikeStream(res);
    }

    const take = perPage ? Math.max(1, Number(perPage)) : 20;
    const pageNumber = page ? Math.max(1, Number(page)) : 1;

    return this.documentDescriptionService.findAll(take, pageNumber);
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
        setTimeout(() => {
          cb(null, JSON.stringify(row) + '\n');
        }, 1000);
      },
    });

    pipeline(dbStream, ndjsonTransform, res, (err) => {
      if (err) {
        console.error('stream error', err);
      }
    });
  }
}
