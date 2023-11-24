import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { FilterProjectsCreatedDto } from './dto/filter-projects-created.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('projects-created')
  projectsCreated(@Query() filter: FilterProjectsCreatedDto) {
    return this.reportsService.projectsCreated(filter);
  }

  @Get('completed-projects')
  completedProjects() {
    return this.reportsService.completedProjects();
  }

  @Get('users-quantity')
  usersQuantity() {
    return this.reportsService.usersQuantity();
  }

  @Get('projects-tasks-quantity')
  projectsTasksQuantity() {
    return this.reportsService.projectsTasksQuantity();
  }

  @Get('generals')
  async generals() {
    return this.reportsService.generals();
  }
}
