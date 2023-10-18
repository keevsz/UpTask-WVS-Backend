import { Controller, Get, Param, Body } from '@nestjs/common';
import { CollaboratorsService } from '../services/collaborators.service';
import { GetCollaboratorDto } from '../dto/collaborator.dto';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Get('/')
  findOne(@Body() getCollaboratorDto: GetCollaboratorDto) {
    return this.collaboratorsService.findOne(getCollaboratorDto)
  }
}
