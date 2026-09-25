import {Body,Controller,Post} from '@nestjs/common';
import {IsEmail,IsNotEmpty,IsString,MinLength} from 'class-validator';
import {AuthService} from './auth.service';
import {Public} from './public.decorator';

class SignupBody{@IsString()@IsNotEmpty()name!:string;@IsEmail()email!:string;@IsString()@MinLength(8)password!:string;@IsString()@IsNotEmpty()phone!:string}
class LoginBody{@IsEmail()email!:string;@IsString()@MinLength(8)password!:string}

@Controller('auth')
export class AuthController{
 constructor(private auth:AuthService){}
 @Public()@Post('signup')signup(@Body()body:SignupBody){return this.auth.signup(body)}
 @Public()@Post('login')login(@Body()body:LoginBody){return this.auth.login(body)}
}
