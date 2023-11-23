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
    const projects = await this.projectModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(filter.from),
            $lte: new Date(filter.to),
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalProjects: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalProjects: 1,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    return projects;
  }

  async completedProjects() {
    const projects = await this.projectModel.aggregate([
      {
        $match: {
          $or: [{ isFinished: true }, { isFinished: false }],
        },
      },
      {
        $project: {
          _id: 0,
          isFinished: 1,
        },
      },
      {
        $group: {
          _id: '$isFinished',
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: {
            $cond: {
              if: { $eq: ['$_id', true] },
              then: 'Completados',
              else: 'Pendientes',
            },
          },
          total: 1,
        },
      },
    ]);

    return projects;
  }

  async usersQuantity() {
    const allUsers = await this.userModel.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $group: {
          _id: '$role.name',
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          userRole: '$_id',
          total: 1,
        },
      },
    ]);

    return allUsers;
  }

  async projectsTasksQuantity() {
    const projects = await this.projectModel.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'tasks',
          foreignField: '_id',
          as: 'tasks',
        },
      },
      {
        $project: {
          _id: 0,
          projectName: '$name',
          taskCount: { $size: '$tasks' },
        },
      },
    ]);

    return projects;
  }
}
