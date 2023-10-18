import { TYPE_PRIORITY } from '../entities/task.entity';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  deadline: Date;

  @IsEnum(TYPE_PRIORITY)
  @IsNotEmpty()
  priority: TYPE_PRIORITY;

  @IsMongoId()
  @IsNotEmpty()
  project: string;
}
