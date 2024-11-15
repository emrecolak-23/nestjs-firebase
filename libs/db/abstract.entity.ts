import { Schema, Prop } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;
}
