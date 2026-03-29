import { DynamicModule, Module } from '@nestjs/common';
import { StreamPoolProvider } from './stream-pool.provider';
import { StreamService } from './stream.service';
import { STREAM_FORMATTER, StreamFormatter } from './stream.tokens';

@Module({
  providers: [
    StreamPoolProvider,
    StreamService,
    {
      provide: STREAM_FORMATTER,
      useValue: (row: unknown) => JSON.stringify(row),
    },
  ],
  exports: [StreamService],
})
export class StreamModule {
  static forFeature(formatter: StreamFormatter): DynamicModule {
    return {
      module: StreamModule,
      providers: [{ provide: STREAM_FORMATTER, useValue: formatter }],
      exports: [STREAM_FORMATTER, StreamService],
    };
  }
}
