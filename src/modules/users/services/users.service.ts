import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model, Types } from 'mongoose';
import { Role } from 'src/modules/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const usernameExists = await this.userModel.findOne({
      username: createUserDto.username,
    });
    if (usernameExists)
      throw new BadRequestException(
        `El nombre de usuario ${createUserDto.username} ya se encuentra registrado`,
      );

    const roleExists = await this.roleModel.findById(createUserDto.role);

    if (!roleExists) {
      throw new BadRequestException(
        `No se encontró el rol: ${createUserDto.role}`,
      );
    }

    const newUser = await this.userModel.create({
      ...createUserDto,
      isActive: true,
    });

    return newUser;
  }

  findAll() {
    return this.userModel.find().populate('role', 'name');
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid Object ID`);
    }

    const userExists = await this.userModel
      .findById(id)
      .populate('role', 'name');

    if (!userExists) {
      throw new NotFoundException(`El usuario con ID: ${id} no existe`);
    }
    return userExists;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userExists = await this.userModel.findById(id);
    if (!userExists) {
      throw new NotFoundException(`El usuario de ID: ${id} no existe `);
    }
    if (
      updateUserDto.username &&
      updateUserDto.username !== userExists.username
    ) {
      const existUsername = await this.userModel.findOne({
        username: updateUserDto.email,
      });

      if (existUsername) {
        throw new BadRequestException(
          `El username: ${updateUserDto.username} ya existe`,
        );
      }
    }
    if (!updateUserDto.password) {
      updateUserDto.password = userExists.password;
    } else {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (!updateUserDto.avatar) updateUserDto.avatar === userExists.avatar;

    const update = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
      })
      .populate('role', 'name');

    return update;
  }

  async remove(id: string) {
    await this.findOne(id);

    return await this.userModel.findByIdAndDelete(id);
  }
}
