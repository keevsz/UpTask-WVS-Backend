import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/rawheaders.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { UserRoleGuard } from './guards/user-role.guard';
import { Auth } from './decorators/auth.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { RefreshJwtGuard } from './guards/refreshtoken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.create(createUserDto);
  // }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    // @GetUser('username') userEmail: string,
    // @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      user,
      // rawHeaders,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  // "message": "User kevin needs a valid role: [super-user,admin]",
  // @RoleProtected(ValidRoles.superUser, ValidRoles.admin) // Para roles
  @UseGuards(AuthGuard(), UserRoleGuard) // Para guard de auth y rol
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.ADMIN) // Auth y roles si no envias roles, solo verifica que este autenticado como user
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
