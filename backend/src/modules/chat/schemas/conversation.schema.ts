import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true, enum: ['customer-staff', 'staff-admin'] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  initiatorId: Types.ObjectId;

  @Prop({ required: true })
  initiatorName: string;

  @Prop({ required: true, enum: ['customer', 'staff'] })
  initiatorRole: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  responderId: Types.ObjectId;

  @Prop({ default: '' })
  responderName: string;

  @Prop({ default: '' })
  responderRole: string;

  @Prop({ default: '' })
  lastMessage: string;

  @Prop({ default: Date.now })
  lastMessageAt: Date;

  @Prop({ default: 0 })
  unreadByInitiator: number;

  @Prop({ default: 0 })
  unreadByResponder: number;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
