import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  state: boolean;
}
