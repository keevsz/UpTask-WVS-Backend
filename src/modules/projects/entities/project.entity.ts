import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Schema()
export class Project extends Document {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: Date, required: true, UTC: true })
  deadline: Date;

  @Prop({ type: String, required: false })
  client: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], required: false })
  tasks: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], required: false })
  collaborators: Types.ObjectId[];

  @Prop({ type: Boolean, required: false, default: false })
  isFinished: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project).set(
  'timestamps',
  true,
);
