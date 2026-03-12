import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentDescriptionModule } from './document_description/document_description.module';

@Module({
  imports: [DocumentDescriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
