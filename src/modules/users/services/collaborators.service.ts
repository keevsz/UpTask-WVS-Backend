import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  AddRemoveToProjectDto,
  GetCollaboratorDto,
} from '../dto/collaborator.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import { Project } from 'src/modules/projects/entities/project.entity';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}
  async findOne(getCollaboratorDto: GetCollaboratorDto) {
    const user = await this.userModel
      .findOne({ username: getCollaboratorDto.username.toLowerCase() })
      .select('-createdAt -password -updatedAt -__v ');

    if (!user) {
      throw new NotFoundException(
        `Usuario de username: ${getCollaboratorDto.username} no encontrado`,
      );
    }
    return user;
  }

  async addToProject(addToProjectDto: AddRemoveToProjectDto, userAuth: User) {
    const project = await this.projectModel.findById(addToProjectDto.projectId);

    if (!project)
      throw new NotFoundException(
        `Proyecto de ID ${addToProjectDto.projectId} no encontrado`,
      );

    if (project.creator.toString() !== userAuth._id.toString()) {
      throw new BadRequestException(`Acción no valida`);
    }

    const userToAdd = await this.findOne({
      username: addToProjectDto.username,
    });

    if (project.creator.toString() === userToAdd._id.toString()) {
      throw new BadRequestException(
        `El creador del proyecto no puede ser colaborador`,
      );
    }

    if (project.collaborators.includes(userToAdd._id)) {
      throw new BadRequestException(`El usuario ya pertenece al proyecto`);
    }

    project.collaborators.push(userToAdd._id);
    await project.save();

    return 'Colaborador agregado';
  }

  async removeFromProject(
    removeFromProjectDto: AddRemoveToProjectDto,
    userAuth: User,
  ) {
    const project = await this.projectModel.findById(
      removeFromProjectDto.projectId,
    );

    if (!project)
      throw new NotFoundException(
        `Proyecto de ID ${removeFromProjectDto.projectId} no encontrado`,
      );

    if (project.creator.toString() !== userAuth._id.toString()) {
      throw new BadRequestException(`Acción no valida`);
    }

    const userToRemove = await this.findOne({
      username: removeFromProjectDto.username,
    });

    await this.projectModel.findByIdAndUpdate(project._id, {
      $pull: { collaborators: userToRemove._id },
    });
    return 'Colaborador eliminado';
  }

  async getCollaboratorsOfProjects() {
    const projects = await this.projectModel.find().populate('collaborators');
    return projects;
  }
}
