import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Customer} from './customer.entity';
@Module({imports:[TypeOrmModule.forFeature([Customer])],exports:[TypeOrmModule]})
export class CustomerModule{}
