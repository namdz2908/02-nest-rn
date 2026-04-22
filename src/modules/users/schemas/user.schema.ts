import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // timestamps dùng để tự động thêm 2 trường createdAt và updatedAt
export class User {
    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    image: string;

    @Prop({ default: "USERS" })
    role: string;

    @Prop({ default: "LOCAL" })
    accountType: string;

    @Prop({ default: false })
    isActive: boolean;

    @Prop()
    codeId: string;

    @Prop()
    codeExpired: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);
