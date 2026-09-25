import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import twilio from 'twilio';
import {Appointment} from '../appointment/appointment.entity';
import {Customer} from '../customer/customer.entity';
import {Business} from '../business/business.entity';
import {MessageLog} from './message-log.entity';

@Injectable()
export class WhatsAppService{
 private client:ReturnType<typeof twilio>|null;
 constructor(private config:ConfigService,@InjectRepository(MessageLog)private logs:Repository<MessageLog>,@InjectRepository(Customer)private customers:Repository<Customer>,@InjectRepository(Business)private businesses:Repository<Business>){
  const sid=config.get<string>('TWILIO_ACCOUNT_SID');const token=config.get<string>('TWILIO_AUTH_TOKEN');
  this.client=sid&&token?twilio(sid,token):null;
 }
 private async send(a:Appointment,type:'confirmation'|'reminder'|'delay_alert',content:string){
  let id:string|null=null;let status:'sent'|'delivered'|'failed'='failed';
  try{
   if(!this.client)throw new Error('Twilio credentials are not configured');
   const c=await this.customers.findOneBy({id:a.customerId});if(!c)throw new Error('Customer not found');
   const from=this.config.getOrThrow<string>('TWILIO_WHATSAPP_NUMBER');
   const to=c.phone.startsWith('whatsapp:')?c.phone:'whatsapp:'+c.phone;
   const message=await this.client.messages.create({from,to,body:content});
   id=message.sid;status=message.status==='failed'||message.status==='undelivered'?'failed':'sent';
  }catch(e){console.error('WhatsApp send failed:',e)}
  return this.logs.save(this.logs.create({appointmentId:a.id,type,content,whatsappMsgId:id,status}));
 }
 private async businessName(id:string){const b=await this.businesses.findOneBy({id});return b?.name||'our business'}
 async sendConfirmation(a:Appointment){
  const c=await this.customers.findOneBy({id:a.customerId});if(!c)throw new Error('Customer not found');
  const name=await this.businessName(a.businessId);
  return this.send(a,'confirmation','Hi '+c.name+', your appointment for '+a.service+' at '+name+' is confirmed for '+a.appointmentAt.toLocaleString()+'.');
 }
 async sendReminder(a:Appointment){
  const name=await this.businessName(a.businessId);
  return this.send(a,'reminder','Reminder: your appointment at '+name+' is today at '+a.appointmentAt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'. See you soon!');
 }
 async sendDelayAlert(a:Appointment,minutesLate:number){
  const c=await this.customers.findOneBy({id:a.customerId});if(!c)throw new Error('Customer not found');
  const name=await this.businessName(a.businessId);
  return this.send(a,'delay_alert','Hi '+c.name+', we\'re running about '+minutesLate+' minutes behind schedule at '+name+'. Thanks for your patience!');
 }
}
