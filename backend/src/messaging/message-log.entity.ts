import {Column,CreateDateColumn,Entity,PrimaryGeneratedColumn} from 'typeorm';
@Entity('message_log')
export class MessageLog{
 @PrimaryGeneratedColumn('uuid')id!:string;
 @Column({name:'appointment_id'})appointmentId!:string;
 @Column()type!:'confirmation'|'reminder'|'delay_alert';
 @Column()content!:string;
 @Column({name:'whatsapp_msg_id',nullable:true})whatsappMsgId!:string|null;
 @Column()status!:'sent'|'delivered'|'failed';
 @CreateDateColumn({name:'sent_at',type:'timestamptz'})sentAt!:Date;
}
