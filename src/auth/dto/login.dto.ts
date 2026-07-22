import { Transform } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
    
    @Transform(({ value }) => value.trim().toLowerCase())
    @IsEmail({}, { message: 'Deve serum email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório'})
    email!: string

    @IsString({ message: 'A senha deve ser um texto'})
    @IsNotEmpty({ message: 'A senha é obrigatória'})
    password!: string
}