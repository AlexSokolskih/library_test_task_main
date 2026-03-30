import { Module } from '@nestjs/common';
import { StreamPoolProvider } from './stream-pool.provider';
import { StreamService } from './stream.service';

@Module({
  providers: [StreamPoolProvider, StreamService],
  exports: [StreamService],
})
export class StreamModule {}
