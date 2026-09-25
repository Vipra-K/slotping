import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CustomerModule } from './customer/customer.module';
import { AppointmentModule } from './appointment/appointment.module';
import { MessagingModule } from './messaging/messaging.module';
import { JwtAuthGuard } from './auth/jwt.guard';
import { Business } from './business/business.entity';
import { Customer } from './customer/customer.entity';
import { Appointment } from './appointment/appointment.entity';
import { MessageLog } from './messaging/message-log.entity';

@Module({
  imports:[
    ConfigModule.forRoot({isGlobal:true}),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>({
        type:'postgres',
        url:config.getOrThrow<string>('DATABASE_URL'),
        entities:[Business,Customer,Appointment,MessageLog],
        synchronize:config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,BusinessModule,CustomerModule,AppointmentModule,MessagingModule
  ],
  providers:[{provide:APP_GUARD,useClass:JwtAuthGuard}],
})
export class AppModule {}
