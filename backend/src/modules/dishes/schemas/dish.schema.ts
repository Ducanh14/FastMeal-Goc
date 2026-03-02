import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Dish extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl: string;

  @Prop({ default: 'Other' })
  category: string;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const DishSchema = SchemaFactory.createForClass(Dish);