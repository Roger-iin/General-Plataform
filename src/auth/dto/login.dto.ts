import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
    
    @IsEmail({}, { message: 'Deve serum email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório'})
    email!: string

    @IsString({ message: 'A senha deve ser um texto'})
    @IsNotEmpty({ message: 'A senha é obrigatória'})
    password!: string
}