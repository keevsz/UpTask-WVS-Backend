import { Injectable } from '@nestjs/common';
import { FilterProjectsCreatedDto } from './dto/filter-projects-created.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project } from '../projects/entities/project.entity';
import { Model, PopulatedDoc } from 'mongoose';
import { Timestamps } from 'src/types';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Task } from '../tasks/entities/task.entity';
@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async projectsCreated(filter: FilterProjectsCreatedDto) {
    const projects = await this.projectModel.find({
      createdAt: {
        $gte: new Date(filter.from),
        $lte: new Date(filter.to),
      },
    });
    const projectsByMonth = projects.reduce((acc, project) => {
      const key = (project as Project & Timestamps).createdAt
        .toISOString()
        .slice(0, 7);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return projectsByMonth;
  }

  async completedProjects() {
    const projects = await this.projectModel.find();
    const statuses = ['Completados', 'En progreso'];
    const projectsCompleted = projects.reduce((acc, project) => {
      const finished = project.isFinished;

      const key = statuses[finished ? 0 : 1];
      acc[key] = (acc[key] | 0) + 1;
      return acc;
    }, {});

    return projectsCompleted;
  }

  async usersQuantity() {
    const allUsers = (await this.userModel.find().populate('role')) as (User &
      PopulatedDoc<Role & Document>)[];

    const usersByRole = allUsers.reduce((acc, user) => {
      const key = user.role.name;
      acc[key] = (acc[key] | 0) + 1;
      return acc;
    }, {});
    return {
      total: allUsers.length,
      usersByRole,
    };
  }

  async projectsTasksQuantity() {
    const projects = (await this.projectModel
      .find()
      .populate('tasks')) as (Project & PopulatedDoc<Task & Document>)[];

    const projectsWithMostTasks = projects.reduce((acc, project) => {
      acc.push({
        projectName: project.name,
        tasks: project.tasks.length,
        _id: project._id,
      });
      return acc;
    }, []);

    return projectsWithMostTasks.sort(
      (a: { tasks: number }, b: { tasks: number }) => b.tasks - a.tasks,
    );
  }
}
