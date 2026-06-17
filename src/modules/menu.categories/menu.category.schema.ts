import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Menu } from '@/modules/menus/schemas/menu.schema';

export type MenuCategoryDocument = HydratedDocument<MenuCategory>;

@Schema({ timestamps: true })
export class MenuCategory {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Menu.name })
    menu: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    @Prop({ default: 0 })
    displayOrder: number;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
