import {Column,CreateDateColumn,Entity,Index,JoinColumn,ManyToOne,PrimaryGeneratedColumn} from 'typeorm';
import {Customer} from '../customer/customer.entity';

@Entity('appointment')
@Index(['businessId','appointmentAt'])
export class Appointment{
 @PrimaryGeneratedColumn('uuid')id!:string;
 @Column({name:'business_id'})businessId!:string;
 @Column({name:'customer_id'})customerId!:string;
 @ManyToOne(()=>Customer,{onDelete:'CASCADE'}) @JoinColumn({name:'customer_id'}) customer!:Customer;
 @Column()service!:string;
 @Column({name:'appointment_at',type:'timestamptz'})appointmentAt!:Date;
 @Column()status!:'confirmed'|'completed'|'cancelled';
 @Column({name:'reminder_sent',default:false})reminderSent!:boolean;
 @CreateDateColumn({name:'created_at',type:'timestamptz'})createdAt!:Date;
}