import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Appointment} from './appointment.entity';
import {Customer} from '../customer/customer.entity';
import {AppointmentController} from './appointment.controller';
import {AppointmentService} from './appointment.service';
import {MessagingModule} from '../messaging/messaging.module';
@Module({imports:[TypeOrmModule.forFeature([Appointment,Customer]),MessagingModule],controllers:[AppointmentController],providers:[AppointmentService],exports:[AppointmentService]})
export class AppointmentModule{}
