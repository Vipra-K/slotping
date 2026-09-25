import 'reflect-metadata';
import {DataSource} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {Business} from '../business/business.entity';
import {Customer} from '../customer/customer.entity';
import {Appointment} from '../appointment/appointment.entity';
import {MessageLog} from '../messaging/message-log.entity';

const ds=new DataSource({type:'postgres',url:process.env.DATABASE_URL||'postgresql://postgres:postgres@localhost:5432/slotping',entities:[Business,Customer,Appointment,MessageLog],synchronize:true});

async function seed(){
 await ds.initialize();
 const numbers=(process.env.DEMO_WHATSAPP_NUMBERS||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(numbers.length<4)throw new Error('Set DEMO_WHATSAPP_NUMBERS to at least 4 real WhatsApp-capable numbers before running the demo seed.');
 const businessRepo=ds.getRepository(Business),customerRepo=ds.getRepository(Customer),appointmentRepo=ds.getRepository(Appointment);
 let business=await businessRepo.findOne({where:{ownerEmail:'demo@slotping.local'}});
 if(!business)business=await businessRepo.save(businessRepo.create({name:'Demo Salon',ownerEmail:'demo@slotping.local',passwordHash:await bcrypt.hash('Demo@12345',12),phone:process.env.DEMO_BUSINESS_PHONE||'+910000000000'}));
 const names=['Arun','Priya','Karthik','Meena'],services=['Haircut','Hair Spa','Consultation','Styling'];
 for(let i=0;i<4;i++){
  let customer=await customerRepo.findOne({where:{businessId:business.id,phone:numbers[i]}});
  if(!customer)customer=await customerRepo.save(customerRepo.create({businessId:business.id,name:names[i],phone:numbers[i]}));
  const today=new Date();today.setHours(10+i*2,0,0,0);
  const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  for(const at of [today,tomorrow]){
   const existing=await appointmentRepo.findOne({where:{businessId:business.id,customerId:customer.id,appointmentAt:at}});
   if(!existing)await appointmentRepo.save(appointmentRepo.create({businessId:business.id,customerId:customer.id,service:services[i],appointmentAt:at,status:'confirmed',reminderSent:false}));
  }
 }
 console.log('Seed complete: demo@slotping.local / Demo@12345');
 await ds.destroy();
}
seed().catch(async e=>{console.error(e);if(ds.isInitialized)await ds.destroy();process.exit(1)});
