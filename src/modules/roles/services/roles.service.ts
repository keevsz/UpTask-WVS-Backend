import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../entities/role.entity';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = await this.roleModel.create(createRoleDto);
    return newRole;
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: string) {
    return `This action returns a #${id} role`;
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }
}
