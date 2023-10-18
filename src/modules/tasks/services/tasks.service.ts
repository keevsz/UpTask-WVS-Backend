import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from '../entities/task.entity';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { Project } from 'src/modules/projects/entities/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}
  async create(createTaskDto: CreateTaskDto, user: User) {
    const project = await this.projectModel.findById(createTaskDto.project);
    if (!project) {
      throw new NotFoundException(
        `Proyecto no encontrado ID: ${createTaskDto.project}`,
      );
    }

    if (project.creator.toString() !== user._id.toString()) {
      throw new BadRequestException(
        `No tienes permiso para añadir tareas a este proyecto`,
      );
    }

    const newTask = await this.taskModel.create(createTaskDto);

    project.tasks.push(newTask._id);
    await project.save();

    return newTask;
  }

  findAll() {
    return `This action returns all tasks`;
  }

  async findOne(id: string, user: User) {
    try {
      const task = await this.taskModel.findById(id).populate('project');
      console.log({ task });

      if (!task) throw new NotFoundException(`Tarea no encontrada ID:${id}`);

      if ((task.project as any).creator.toString() !== user._id.toString()) {
        throw new NotFoundException(`Acción no valida`);
      }
      return task;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: string) {
    return `This action removes a #${id} task`;
  }
}
