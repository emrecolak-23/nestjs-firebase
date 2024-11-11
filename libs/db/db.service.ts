import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DBService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getDBConnection() {
    return this.connection;
  }
}
