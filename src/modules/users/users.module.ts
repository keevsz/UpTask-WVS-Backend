import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { UserSchema } from 'src/modules/users/entities/user.entity';
import { Role, RoleSchema } from '../roles/entities/role.entity';
import { Model } from 'mongoose';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { CollaboratorsController } from './controllers/collaborators.controller';
import { CollaboratorsService } from './services/collaborators.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
  ],
  controllers: [UsersController, CollaboratorsController],
  providers: [UsersService, CollaboratorsService],
  exports: [UsersService],
})
export class UsersModule {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async onModuleInit() {
    const roleCount = await this.roleModel.find();
    if (roleCount.length === 0) {
      await this.roleModel.create({
        name: ValidRoles.ADMIN,
      });
    }

    const usersCount = await this.userModel.find();
    if (usersCount.length === 0) {
      await this.userModel.create({
        username: process.env.INITIAL_DATA_USER_ADMIN_USERNAME,
        password: process.env.INITIAL_DATA_USER_ADMIN_PASSWORD,
        firstName: 'admin_fn',
        lastName: 'admin_ln',
        role: ValidRoles.ADMIN,
      });
    }
  }
}
