import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderDetail, OrderDetailSchema } from '../order.detail/schemas/order.detail.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';
import { MenuItem, MenuItemSchema } from '../menu.items/schemas/menu.item.schema';
import { Menu, MenuSchema } from '../menus/schemas/menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderDetail.name, schema: OrderDetailSchema },
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
