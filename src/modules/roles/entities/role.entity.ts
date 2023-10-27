import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, models } from 'mongoose';

@Schema()
export class Role extends Document {
  @Prop({
    type: String,
    required: true,
    uppercase: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  name: string;

  @Prop({ type: Boolean, required: true, default: true })
  state: boolean;
}

export const RoleSchema =
  models.Role || SchemaFactory.createForClass(Role).set('timestamps', true);
