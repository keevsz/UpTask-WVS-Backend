import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entities/user.entity';
import { Model } from 'mongoose';
import { Role } from 'src/modules/roles/entities/role.entity';

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

    const role = 'user';
    const roleExists = await this.roleModel.findOne({ name: role });
    if (!roleExists) {
      throw new BadRequestException(`No se encontró el rol: ${role}`);
    }

    const newUser = await this.userModel.create({
      ...createUserDto,
      role: roleExists.name,
    });
    return newUser;
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
