import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ){}

    async login(loginDto: LoginDto){
        const user = await this.usersService.findByEmail(loginDto.email);
        
        if (!user){
            throw new UnauthorizedException('Credenciais inválidas.');
        }
        
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if(!isPasswordValid){
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const payload = { email: user.email, sub: user.id };

        return{
            access_token: this.jwtService.sign(payload),
        }
    }
}
