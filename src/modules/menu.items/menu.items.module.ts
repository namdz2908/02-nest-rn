import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu.items.service';
import { MenuItemsController } from './menu.items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from './schemas/menu.item.schema';
import { Menu, MenuSchema } from '../menus/schemas/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
