import {Column,CreateDateColumn,Entity,PrimaryGeneratedColumn} from 'typeorm';
@Entity('business')
export class Business{
 @PrimaryGeneratedColumn('uuid')id!:string;
 @Column()name!:string;
 @Column({name:'owner_email',unique:true})ownerEmail!:string;
 @Column({name:'password_hash'})passwordHash!:string;
 @Column()phone!:string;
 @CreateDateColumn({name:'created_at',type:'timestamptz'})createdAt!:Date;
}
