import { IsEmail, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class AddRemoveToProjectDto extends GetCollaboratorDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  projectId: string;
}
