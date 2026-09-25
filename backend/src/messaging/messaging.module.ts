import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {MessageLog} from './message-log.entity';
import {Customer} from '../customer/customer.entity';
import {Business} from '../business/business.entity';
import {Appointment} from '../appointment/appointment.entity';
import {WhatsAppService} from './whatsapp.service';
import {ReminderJob} from './reminder.job';
@Module({
 imports:[TypeOrmModule.forFeature([MessageLog,Customer,Business,Appointment])],
 providers:[WhatsAppService,ReminderJob],
 exports:[WhatsAppService]
})
export class MessagingModule{}
