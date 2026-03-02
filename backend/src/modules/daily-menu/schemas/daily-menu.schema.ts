import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Dish } from '../../dishes/schemas/dish.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class DailyMenu extends Document {
  @Prop({ required: true, unique: true }) // Mỗi ngày chỉ có 1 menu
  date: Date; 

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Dish' }] })
  dishes: Dish[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: User;
}

export const DailyMenuSchema = SchemaFactory.createForClass(DailyMenu);
// Index để tìm kiếm theo ngày nhanh hơn
DailyMenuSchema.index({ date: 1 });