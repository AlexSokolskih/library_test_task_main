import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentDescriptionModule } from './document-description/document-description.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDbConnectionConfig } from './database/db.config';

@Module({
  imports: [
    DocumentDescriptionModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...getDbConnectionConfig(),
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
