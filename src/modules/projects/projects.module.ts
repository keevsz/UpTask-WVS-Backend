import { Module } from '@nestjs/common';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './entities/project.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { Task, TaskSchema } from '../tasks/entities/task.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
      {
        name: Task.name,
        schema: TaskSchema,
      },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
