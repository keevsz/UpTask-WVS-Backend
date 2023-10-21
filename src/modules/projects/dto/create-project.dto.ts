import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  deadline: Date;

  @IsString()
  client: string;

  @IsMongoId()
  @IsNotEmpty()
  creator: string;
}
