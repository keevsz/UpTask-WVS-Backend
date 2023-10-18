import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../entities/project.entity';
import { Model } from 'mongoose';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly userService: UsersService,
  ) {}
  async create(createProjectDto: CreateProjectDto) {
    await this.userService.findOne(createProjectDto.creator);

    let newProject = (
      await this.projectModel.create(createProjectDto)
    ).populate('creator');
    return newProject;
  }

  findAll() {
    return `This action returns all projects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
