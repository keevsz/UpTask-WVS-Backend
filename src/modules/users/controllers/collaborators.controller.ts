import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { CollaboratorsService } from '../services/collaborators.service';
import {
  AddRemoveToProjectDto,
  GetCollaboratorDto,
} from '../dto/collaborator.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('/')
  findOne(@Body() getCollaboratorDto: GetCollaboratorDto) {
    return this.collaboratorsService.findOne(getCollaboratorDto);
  }

  @Post('/add')
  @Auth()
  addToProject(
    @Body() addToProjectDto: AddRemoveToProjectDto,
    @GetUser() user: User,
  ) {
    return this.collaboratorsService.addToProject(addToProjectDto, user);
  }

  @Post('/remove')
  @Auth()
  removeFromProject(
    @Body() removeToProjectDto: AddRemoveToProjectDto,
    @GetUser() user: User,
  ) {
    return this.collaboratorsService.removeFromProject(
      removeToProjectDto,
      user,
    );
  }
}
