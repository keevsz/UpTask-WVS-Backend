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
import { Task } from 'src/modules/tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly userService: UsersService,
  ) {}
  async create(createProjectDto: CreateProjectDto) {
    await this.userService.findOne(createProjectDto.creator);

    let newProject = (
      await this.projectModel.create(createProjectDto)
    ).populate('creator');
    return newProject;
  }

  async findAll(user: User) {
    try {
      const projects = await this.projectModel
        .find({
          $or: [
            { collaborators: { $in: [user._id.toString()] } },
            { creator: user._id.toString() },
          ],
        })
        .select('-tasks')
        .populate('creator');

      return projects;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string, user: User) {
    try {
      const project = await this.projectModel
        .findById(id)
        .populate('collaborators', 'username')
        .populate('tasks')
        .populate('creator');

      if (!project)
        throw new NotFoundException(`Proyecto de ID ${id} no encontrado`);

      if (
        project.creator._id.toString() !== user._id.toString() &&
        !project.collaborators.some(
          (collaborator) => collaborator._id.toString() === user._id.toString(),
        )
      ) {
        throw new BadRequestException(`Acción no valida`);
      }
      return project;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    try {
      const project = await this.projectModel.findById(id);

      if (!project)
        throw new NotFoundException(`Proyecto de ID ${id} no encontrado`);

      if (project.creator.toString() !== user._id.toString()) {
        throw new BadRequestException(`Acción no valida`);
      }

      const updatedProject = await this.projectModel.findByIdAndUpdate(
        id,
        updateProjectDto,
        { new: true },
      );
      return updatedProject;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, user: User) {
    try {
      const project = await this.projectModel.findById(id);

      if (!project)
        throw new NotFoundException(`Proyecto de ID ${id} no encontrado`);

      if (project.creator.toString() !== user._id.toString()) {
        throw new BadRequestException(`Acción no valida`);
      }

      await this.taskModel.deleteMany({
        project: id,
      });
      await project.deleteOne();
      return 'Proyecto eliminado';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
