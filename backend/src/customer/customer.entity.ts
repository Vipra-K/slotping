import {Column,CreateDateColumn,Entity,Index,PrimaryGeneratedColumn} from 'typeorm';
@Entity('customer')
@Index(['businessId','phone'],{unique:true})
export class Customer{
 @PrimaryGeneratedColumn('uuid')id!:string;
 @Column({name:'business_id'})businessId!:string;
 @Column()name!:string;
 @Column()phone!:string;
 @CreateDateColumn({name:'created_at',type:'timestamptz'})createdAt!:Date;
}
