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
import { Project, ProjectSchema } from '../projects/entities/project.entity';
import { AuthModule } from 'src/auth/auth.module';
import * as bcrypt from 'bcrypt';

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
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),
    AuthModule,
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
    const usersCount = await this.userModel.find();

    if (roleCount.length === 0 || usersCount.length === 0) {
      await Promise.all([
        this.roleModel.deleteMany(),
        this.userModel.deleteMany(),
      ]);

      //Roles
      const roles = await this.roleModel.insertMany([
        { name: 'Administrador' },
        { name: 'Super Usuario' },
        { name: 'Usuario' },
      ]);

      //Usuarios
      await this.userModel.insertMany([
        {
          username: 'admin',
          firstName: 'Administrador',
          lastName: 'Administrador',
          email: 'admin@test.com',
          password: bcrypt.hashSync('password', 10),
          role: roles[0]._id,
          address: 'Calle 123',
        },
        {
          username: 'superusuario',
          firstName: 'Super Usuario',
          lastName: 'Super Usuario',
          email: 'superusuario@test.com',
          password: bcrypt.hashSync('password', 10),
          role: roles[1]._id,
          address: 'Calle 123',
        },
        {
          username: 'usuario',
          firstName: 'Usuario',
          lastName: 'Usuario',
          email: 'usuario@test.com',
          password: bcrypt.hashSync('password', 10),
          role: roles[2]._id,
          address: 'Calle 123',
        },
      ]);
    }

    // const roleCount = await this.roleModel.find();

    // if (roleCount.length === 0) {
    //   await this.roleModel.create({
    //     name: ValidRoles.ADMIN,
    //   });
    // }

    // const usersCount = await this.userModel.find();
    // if (usersCount.length === 0) {
    //   await this.userModel.create({
    //     username: process.env.INITIAL_DATA_USER_ADMIN_USERNAME,
    //     password: process.env.INITIAL_DATA_USER_ADMIN_PASSWORD,
    //     firstName: 'admin_fn',
    //     lastName: 'admin_ln',
    //     role: ValidRoles.ADMIN,
    //   });
    // }
  }
}
