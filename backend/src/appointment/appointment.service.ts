import {BadRequestException,Injectable,NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Between,Repository} from 'typeorm';
import {Appointment} from './appointment.entity';
import {Customer} from '../customer/customer.entity';
import {WhatsAppService} from '../messaging/whatsapp.service';

export interface AppointmentServiceContract{
 create(businessId:string,input:{customerName:string;customerPhone:string;service:string;appointmentAt:string}):Promise<Appointment>;
 list(businessId:string,date?:string):Promise<Appointment[]>;
 updateStatus(businessId:string,id:string,status:'confirmed'|'completed'|'cancelled'):Promise<Appointment>;
 remove(businessId:string,id:string):Promise<void>;
 delay(businessId:string,id:string,minutesLate:number):Promise<unknown>;
}

@Injectable()
export class AppointmentService implements AppointmentServiceContract{
 constructor(@InjectRepository(Appointment)private appointments:Repository<Appointment>,@InjectRepository(Customer)private customers:Repository<Customer>,private whatsapp:WhatsAppService){}
 private dayRange(date?:string){const start=new Date(date?date+'T00:00:00':new Date().toISOString().slice(0,10));const end=new Date(start);end.setDate(end.getDate()+1);return [start,end] as const}
 async create(businessId:string,input:{customerName:string;customerPhone:string;service:string;appointmentAt:string}){
  const phone=input.customerPhone.trim();let customer=await this.customers.findOne({where:{businessId,phone}});
  if(!customer)customer=await this.customers.save(this.customers.create({businessId,name:input.customerName.trim(),phone}));
  else if(input.customerName.trim()&&customer.name!==input.customerName.trim()){customer.name=input.customerName.trim();await this.customers.save(customer)}
  const appointment=await this.appointments.save(this.appointments.create({businessId,customerId:customer.id,service:input.service.trim(),appointmentAt:new Date(input.appointmentAt),status:'confirmed',reminderSent:false}));
  const log=await this.whatsapp.sendConfirmation(appointment);if(log.status==='failed')console.warn('Confirmation was logged as failed');
  return appointment;
 }
 async list(businessId:string,date?:string){const [start,end]=this.dayRange(date);return this.appointments.find({where:{businessId,appointmentAt:Between(start,end)},order:{appointmentAt:'ASC'}})}
 async updateStatus(businessId:string,id:string,status:'confirmed'|'completed'|'cancelled'){const a=await this.appointments.findOne({where:{id,businessId}});if(!a)throw new NotFoundException('Appointment not found');a.status=status;return this.appointments.save(a)}
 async remove(businessId:string,id:string){const r=await this.appointments.delete({id,businessId});if(!r.affected)throw new NotFoundException('Appointment not found')}
 async delay(businessId:string,id:string,minutesLate:number){if(!Number.isInteger(minutesLate)||minutesLate<1||minutesLate>600)throw new BadRequestException('minutesLate must be between 1 and 600');const a=await this.appointments.findOne({where:{id,businessId}});if(!a)throw new NotFoundException('Appointment not found');return this.whatsapp.sendDelayAlert(a,minutesLate)}
}
