import { ConflictException,Injectable,UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Business } from '../business/business.entity';

export interface AuthServiceContract{
 signup(input:{name:string;email:string;password:string;phone:string}):Promise<{accessToken:string;business:Business}>;
 login(input:{email:string;password:string}):Promise<{accessToken:string;business:Business}>;
}

@Injectable()
export class AuthService implements AuthServiceContract{
 constructor(@InjectRepository(Business) private businesses:Repository<Business>,private jwt:JwtService){}
 async signup(input:{name:string;email:string;password:string;phone:string}){
  const email=input.email.trim().toLowerCase();
  if(await this.businesses.findOne({where:{ownerEmail:email}}))throw new ConflictException('Email already registered');
  const business=this.businesses.create({name:input.name.trim(),ownerEmail:email,passwordHash:await bcrypt.hash(input.password,12),phone:input.phone.trim()});
  await this.businesses.save(business);
  return {accessToken:this.jwt.sign({sub:business.id,email:business.ownerEmail}),business};
 }
 async login(input:{email:string;password:string}){
  const business=await this.businesses.findOne({where:{ownerEmail:input.email.trim().toLowerCase()}});
  if(!business||!(await bcrypt.compare(input.password,business.passwordHash)))throw new UnauthorizedException('Invalid email or password');
  return {accessToken:this.jwt.sign({sub:business.id,email:business.ownerEmail}),business};
 }
}
