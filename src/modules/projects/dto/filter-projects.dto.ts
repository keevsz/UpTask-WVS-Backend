import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FilterProjectsDto {
  @IsArray()
  @IsNotEmpty()
  user: Types.ObjectId[];
}
