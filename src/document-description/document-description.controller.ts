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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DocumentDescriptionService } from './document-description.service';
import { FindAllQueryDto } from './dto/find-all-query.dto';
import { DocumentDescriptionOneResponseDto } from './dto/document-description-one-response.dto';
import type { Request, Response } from 'express';
import { DocumentDescriptionTokenGuard } from './guards/document-description-token.guard';
import { PaginatedDocumentDescriptionsResponseDto } from './dto/paginated-document-descriptions-response.dto';

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
    description: 'JSON-ответ: объект с данными и мета-пагинацией',
    type: PaginatedDocumentDescriptionsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Токен отсутствует или недействителен.',
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
      await this.getAllDocumentsLikeStream(res, req);
      return;
    }

    const data = await this.getDocumentsWithPaginationAndSearch(
      per_page,
      page,
      search,
    );
    return res.json(data);
  }

  private async getDocumentsWithPaginationAndSearch(
    perPage: number,
    page: number,
    search: string | undefined,
  ): Promise<PaginatedDocumentDescriptionsResponseDto> {
    const { items, total } = await this.documentDescriptionService.findAll(
      perPage,
      page,
      search,
    );
    return {
      data: items,
      meta: {
        page: page,
        per_page: items.length, //не понятно на текущей странице или тот per_page что передали в запросе сделал на текущей странице
        total_pages: Math.ceil(total / perPage),
        search: search || null,
      },
    };
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
    type: DocumentDescriptionOneResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Токен отсутствует или недействителен.',
  })
  @ApiNotFoundResponse({
    description: 'Документ с указанным UUID не найден.',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.documentDescriptionService.findOne(uuid);
  }

  private async getAllDocumentsLikeStream(
    res: Response,
    req: Request,
  ): Promise<void> {
    await this.documentDescriptionService.createDocumentStream(res, req);
  }
}
