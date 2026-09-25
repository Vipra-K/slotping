import {Body,Controller,Delete,Get,Param,Patch,Post,Query,Req} from '@nestjs/common';
import {IsDateString,IsIn,IsInt,IsNotEmpty,IsString,Max,Min} from 'class-validator';
import {AppointmentService} from './appointment.service';

class CreateAppointmentBody{@IsString()@IsNotEmpty()customerName!:string;@IsString()@IsNotEmpty()customerPhone!:string;@IsString()@IsNotEmpty()service!:string;@IsDateString()appointmentAt!:string}
class StatusBody{@IsString()@IsIn(['confirmed','completed','cancelled'])status!:'confirmed'|'completed'|'cancelled'}
class DelayBody{@IsInt()@Min(1)@Max(600)minutesLate!:number}

@Controller('appointments')
export class AppointmentController{
 constructor(private service:AppointmentService){}
 @Post()create(@Req()req:any,@Body()body:CreateAppointmentBody){return this.service.create(req.user.sub,body)}
 @Get()list(@Req()req:any,@Query('date')date?:string){return this.service.list(req.user.sub,date)}
 @Patch(':id/status')status(@Req()req:any,@Param('id')id:string,@Body()body:StatusBody){return this.service.updateStatus(req.user.sub,id,body.status)}
 @Delete(':id')async remove(@Req()req:any,@Param('id')id:string){await this.service.remove(req.user.sub,id);return {success:true}}
 @Post(':id/delay')delay(@Req()req:any,@Param('id')id:string,@Body()body:DelayBody){return this.service.delay(req.user.sub,id,body.minutesLate)}
}
