import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GetCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
