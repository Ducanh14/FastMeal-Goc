import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Lưu hash, không lưu plain text

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, enum: Role, default: Role.CUSTOMER })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);