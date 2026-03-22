import { IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_page?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
