import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({
    unique: true,
    index: true,
  })
  username: string;

  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
  })
  token: string;

  @Prop({
    type: String,
    required: false,
  })
  verified_email: string;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: String,
    required: true,
    default: 'admin',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User).set(
  'timestamps',
  true,
);
