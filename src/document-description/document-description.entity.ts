import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DocumentDescription {
  @PrimaryGeneratedColumn()
  system_number: number;

  @Column({ type: 'uuid', unique: true })
  uuid: string; // unique uuid for the document

  @Column({ type: 'varchar', length: 20 })
  reg_number: string;

  @Column({ type: 'varchar', length: 200 })
  author: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 300 })
  imprint: string;
}
