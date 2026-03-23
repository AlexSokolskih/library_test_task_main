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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { DocumentDescriptionService } from './document-description.service';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import type { Request, Response } from 'express';
import { Readable, Transform, TransformCallback, pipeline } from 'stream';
import { DocumentDescriptionTokenGuard } from './guards/document-description-token.guard';
import { DocumentDescription } from './document-description.entity';

@ApiTags('document-descriptions')
@ApiBearerAuth()
@Controller('document-descriptions')
@UseGuards(DocumentDescriptionTokenGuard)
export class DocumentDescriptionController {
  constructor(
    private readonly documentDescriptionService: DocumentDescriptionService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Получить список документов',
    description:
      'Возвращает JSON-массив документов с пагинацией или NDJSON stream при Accept: application/ndjson.',
  })
  @ApiHeader({
    name: 'Accept',
    required: false,
    description:
      'Если передать application/ndjson, ответ будет в виде потокового NDJSON.',
    schema: { type: 'string', default: 'application/json' },
  })
  @ApiQuery({ name: 'per_page', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'история',
  })
  @ApiProduces('application/json', 'application/ndjson')
  @ApiOkResponse({
    description: 'JSON-ответ: массив документов',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(DocumentDescription) },
    },
  })
  @ApiOkResponse({
    description: 'NDJSON-ответ: поток строк по одному документу в строке',
    content: {
      'application/ndjson': {
        schema: {
          type: 'string',
          example:
            '{"system_number":1,"uuid":"0f5bf8cc-5d72-4b10-9226-ae4f4f06b340","reg_number":"REG-1","author":"Иванов И.И.","title":"Документ","imprint":"Москва"}\n',
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Получить документ по UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'UUID документа',
    type: String,
    example: '0f5bf8cc-5d72-4b10-9226-ae4f4f06b340',
  })
  @ApiOkResponse({
    description: 'Документ найден',
    type: DocumentDescription,
  })
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
