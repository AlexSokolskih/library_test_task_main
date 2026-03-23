import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DocumentDescription {
  @ApiProperty({ example: 12345 })
  @PrimaryGeneratedColumn()
  system_number: number;

  @ApiProperty({
    format: 'uuid',
    example: '0f5bf8cc-5d72-4b10-9226-ae4f4f06b340',
  })
  @Column({ type: 'uuid', unique: true })
  uuid: string; // unique uuid for the document

  @ApiProperty({ example: 'REG-2026-001' })
  @Column({ type: 'varchar', length: 20 })
  reg_number: string;

  @ApiProperty({ example: 'Иванов И.И.' })
  @Column({ type: 'varchar', length: 200 })
  author: string;

  @ApiProperty({ example: 'Описание документа для каталога' })
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @ApiProperty({ example: 'Москва, Издательство Пример, 2026' })
  @Column({ type: 'varchar', length: 300 })
  imprint: string;
}
