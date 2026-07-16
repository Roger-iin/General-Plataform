import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString({ message: 'O nome deve ser um texto.'})
    @IsNotEmpty({ message: 'O nome deve ser informado.'})
    name!: string;

    @Transform(({ value }) => value.trim().toLowerCase())
    @IsEmail({}, { message: 'Forneça um email válido.'})
    @IsNotEmpty({message: 'O email deve ser informado.'})
    email!: string;

    @IsString({message: 'A senha deve ser um texto'})
    @IsNotEmpty({message: 'A senha é obrigatória.'})
    @MinLength(6, {message: 'A senha deve ter no mínimo 6 caracteres.'})
    password!: string;
}