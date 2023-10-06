import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

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
    default: 'user',
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User).set(
  'timestamps',
  true,
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
