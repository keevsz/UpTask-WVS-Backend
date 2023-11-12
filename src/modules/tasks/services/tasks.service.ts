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

    const order = project.tasks.length + 1;
    const newTask = await this.taskModel.create({ ...createTaskDto, order });

    project.tasks.push(newTask._id);
    await project.save();

    return newTask;
  }

  async findAll(user: User) {
    try {
      const tasks = await this.taskModel.find().populate({
        path: 'project',
        populate: {
          path: 'creator',
          match: [{ _id: user._id }, { collaborators: user._id }],
        },
      });

      if (!tasks)
        throw new NotFoundException(
          `Tareas no encontrada UsuarioId:${user._id}`,
        );

      return tasks;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string, user: User) {
    try {
      const task = await this.taskModel.findById(id).populate('project');

      if (!task) throw new NotFoundException(`Tarea no encontrada ID:${id}`);

      if ((task.project as any).creator.toString() !== user._id.toString()) {
        throw new NotFoundException(`Acción no valida`);
      }
      return task;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.taskModel.findById(id).populate('project');
    if (!task) {
      throw new NotFoundException(`Tarea no encontrada ID: ${task}`);
    }

    if ((task.project as any).creator.toString() !== user._id.toString()) {
      throw new BadRequestException(`Acción no valida`);
    }

    const taskUpdated = await this.taskModel.findByIdAndUpdate(
      id,
      { ...updateTaskDto, project: task.project },
      {
        new: true,
      },
    );
    return taskUpdated;
  }

  async remove(id: string, user: User) {
    try {
      const task = await this.taskModel.findById(id).populate('project');

      if (!task) {
        throw new NotFoundException(`Tarea no encontrada ID: ${id}`);
      }

      if ((task.project as any).creator.toString() !== user._id.toString()) {
        throw new BadRequestException(`Acción no valida`);
      }

      await this.projectModel.findByIdAndUpdate(task.project, {
        $pull: { tasks: task._id },
      });
      await task.deleteOne();
      return `Tarea eliminada`;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changeStatus(id: string, user: User) {
    try {
      const task = await this.taskModel.findById(id).populate('project');

      if (!task) {
        throw new NotFoundException(`Tarea no encontrada ID: ${id}`);
      }

      if (
        (task.project as unknown as Project).creator.toString() !==
          user._id.toString() &&
        !(task.project as any).collaborators.some(
          (collaborator: User) =>
            collaborator._id.toString() === user._id.toString(),
        )
      ) {
        throw new BadRequestException(`Acción no valida`);
      }

      const taskUpdated = await this.taskModel
        .findByIdAndUpdate(
          id,
          {
            status: !task.status,
            completed: user._id,
          },
          {
            new: true,
          },
        )
        .populate('project')
        .populate('completed');

      return taskUpdated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
