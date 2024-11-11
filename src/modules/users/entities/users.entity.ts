import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';

import { AbstractDocument } from 'libs/db/abstract.entity';

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'users',
})
export class User extends AbstractDocument {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String, default: null })
  @Exclude()
  password?: string;

  @Prop({ type: String, default: null })
  username?: string;

  @Prop({ type: String, default: null })
  image?: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
