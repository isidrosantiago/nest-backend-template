import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { LoginUserDto } from './dto/loginUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const errorResponse = { errors: {} };

      const [userByEmail, userByUsername] = await Promise.all([
        this.userRepository.findOne({ where: { email: createUserDto.email } }),
        this.userRepository.findOne({
          where: { username: createUserDto.email },
        }),
      ]);

      if (userByEmail) errorResponse.errors['email'] = 'has already been taken';
      if (userByUsername)
        errorResponse.errors['username'] = 'has already been taken';

      if (userByEmail || userByUsername) {
        throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
      }

      const newUser = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(newUser);

      delete savedUser.password;
      return savedUser;
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    try {
      const errorResponse = {
        errors: {
          'email or password': 'is invalid',
        },
      };

      const user = await this.userRepository.findOne({
        where: { email: loginUserDto.email },
        select: ['id', 'username', 'email', 'bio', 'image', 'password'],
      });

      if (!user)
        throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

      const isPasswordValid = await compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid)
        throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

      delete user.password;
      return user;
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.findById(userId);
      return await this.userRepository.save({ ...user, ...updateUserDto });
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateJwt(user: UserEntity): string {
    try {
      return sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
      );
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    try {
      return {
        user: {
          ...user,
          token: this.generateJwt(user),
        },
      };
    } catch {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
