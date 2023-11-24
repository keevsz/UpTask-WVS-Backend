import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Project } from 'src/modules/projects/entities/project.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum TYPE_PRIORITY {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema()
export class Task extends Document {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: Date, required: true, UTC: true })
  deadline: Date;

  @Prop({ type: String, required: true, enum: TYPE_PRIORITY })
  priority: TYPE_PRIORITY;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  completed: Types.ObjectId;

  @Prop({ type: Number, required: true, trim: true })
  order: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task).set(
  'timestamps',
  true,
);
