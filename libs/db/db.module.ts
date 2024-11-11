import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, ModelDefinition } from '@nestjs/mongoose';
import { DBMigrationService } from './db-migration.service';
import { DBService } from './db.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get('NODE_ENV') === 'development'
            ? configService.get('MONGO_URI')
            : configService.get('MONGO_URI_PROD'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [DBMigrationService, DBService],
  exports: [DBService],
})
export class DBModule {
  static forFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
