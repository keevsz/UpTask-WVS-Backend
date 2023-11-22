import { IsDateString, IsString } from "class-validator";

export class FilterProjectsCreatedDto {
    @IsDateString()
    from: Date;

    @IsDateString()
    to: Date;
}