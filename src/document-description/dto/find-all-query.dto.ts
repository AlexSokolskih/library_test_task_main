import { IsOptional, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindAllQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Math.max(1, Number(value)) : 20))
  per_page?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Math.max(1, Number(value)) : 1))
  page?: number = 1;
}
