import { Restaurant } from '@/modules/restaurants/schemas/restaurant.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Restaurant.name })
    restaurant: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    user: mongoose.Schema.Types.ObjectId;

    @Prop({ default: 'Pending' })
    status: string;

    @Prop({ required: true })
    totalPrice: number;

    @Prop({ default: () => new Date() })
    orderTime: Date;

    @Prop()
    deliveryTime: Date;

    @Prop({ enum: ['delivery', 'dine-in'], required: true })
    orderType: string;

    @Prop()
    deliveryAddress: string;

    @Prop()
    tableNumber: string;

    @Prop()
    phone: string;

    @Prop()
    notes: string;

    @Prop({ enum: ['cash', 'card', 'online'], default: 'cash' })
    paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
