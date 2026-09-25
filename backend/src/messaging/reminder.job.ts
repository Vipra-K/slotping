import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {InjectRepository} from '@nestjs/typeorm';
import {Between,Repository} from 'typeorm';
import {Appointment} from '../appointment/appointment.entity';
import {WhatsAppService} from './whatsapp.service';

@Injectable()
export class ReminderJob{
 constructor(@InjectRepository(Appointment)private appointments:Repository<Appointment>,private whatsapp:WhatsAppService){}
 @Cron('*/10 * * * *')
 async run(){
  const now=new Date();const from=new Date(now.getTime()+110*60*1000);const to=new Date(now.getTime()+130*60*1000);
  const matches=await this.appointments.find({where:{appointmentAt:Between(from,to),status:'confirmed',reminderSent:false}});
  for(const a of matches){const log=await this.whatsapp.sendReminder(a);if(log.status!=='failed'){a.reminderSent=true;await this.appointments.save(a)}}
 }
}
