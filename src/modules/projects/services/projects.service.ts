import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../entities/project.entity';
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/modules/users/services/users.service';
import { FilterProjectsDto } from '../dto/filter-projects.dto';
import { User } from 'src/modules/users/entities/user.entity';

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

  async findAll(filterProjectsDto: FilterProjectsDto) {
    try {
      const projects = await this.projectModel
        .find({
          $or: [
            { colaborators: { $in: filterProjectsDto.user } },
            { creator: { $in: filterProjectsDto.user } },
          ],
        })
        .select('-tasks');
      return projects;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string, user: User) {
    try {
      const project = await this.projectModel.findById(id).populate({
        path: 'tasks',
        populate: {
          path: 'colaborators',
          select: 'name',
        },
      });

      if (!project)
        throw new NotFoundException(`Proyecto de ID ${id} no encontrado`);

      if (
        project.creator.toString() !== user._id.toString() &&
        !project.colaborators.some(
          (colaborador) => colaborador._id.toString() === user._id.toString(),
        )
      ) {
        throw new BadRequestException(`Acción no valida`);
      }
      return project;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: string) {
    return `This action removes a #${id} project`;
  }
}
