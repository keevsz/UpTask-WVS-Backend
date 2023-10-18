import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCollaboratorDto } from '../dto/collaborator.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
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
}
