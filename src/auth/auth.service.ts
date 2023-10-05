import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserDetails } from './interfaces/user-google.interfaace';
import { User } from 'src/modules/users/entities/user.entity';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService');

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = await this.userModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      const userObject = user.toObject();
      delete userObject.password;

      return {
        ...userObject,
        token: this.getJwt({ id: user._id }),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.userModel
      .findOne({
        username,
      })
      .select([
        'username',
        'password',
        'firstName',
        'lastName',
        'avatar',
        'isActive',
        'role',
      ])
      .lean()
      .exec();

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');

    delete user.password;
    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(
          { id: user._id },
          {
            expiresIn: process.env.JWT_EXPIRES_IN,
            secret: process.env.JWT_SECRET,
          },
        ),
        refreshToken: await this.jwtService.signAsync(
          { id: user._id },
          {
            expiresIn: process.env.REFRESH_EXPIRES_IN,
            secret: process.env.REFRESH_SECRET,
          },
        ),
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
  }

  async validateUser(details: UserDetails) {
    const user = await this.userModel.findOne({ email: details.email });
    if (user) return user;

    const newUser = this.userModel.create({
      email: details.email,
      username: details.displayName.trim().toLocaleLowerCase(),
      password: 'password',
    });
    return newUser;
  }

  async findUser(id: number) {
    const user = await this.userModel.findOne({ id });
    return user;
  }

  public getJwt(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async refreshToken(user: any) {
    const payload: JwtPayload = {
      id: user.id,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_EXPIRES_IN,
        secret: process.env.JWT_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRESH_EXPIRES_IN,
        secret: process.env.REFRESH_SECRET,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  private handleError(error: any): never {
    if (error.code === 11000)
      throw new BadRequestException(`The username already exists`);

    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
