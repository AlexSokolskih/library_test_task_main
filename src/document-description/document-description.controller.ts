import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentDescriptionService } from './document-description.service';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import type { Request, Response } from 'express';
import { Readable, Transform, TransformCallback, pipeline } from 'stream';
import { DocumentDescriptionTokenGuard } from './guards/document-description-token.guard';

@Controller('document-descriptions')
@UseGuards(DocumentDescriptionTokenGuard)
export class DocumentDescriptionController {
  constructor(
    private readonly documentDescriptionService: DocumentDescriptionService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: FindAllQueryDto,
  ) {
    const { per_page = 20, page = 1, search } = query;
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('application/ndjson')) {
      return this.getAllDocumentsLikeStream(res);
    }

    return await this.getDocumentsWithPaginationAndSearch(
      per_page,
      page,
      search,
      res,
    );
  }

  private async getDocumentsWithPaginationAndSearch(
    perPage: number,
    page: number,
    search: string | undefined,
    res: Response,
  ) {
    const data = await this.documentDescriptionService.findAll(
      perPage,
      page,
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
