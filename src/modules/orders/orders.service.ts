import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { OrderDetail } from '../order.detail/schemas/order.detail.schema';
import { User } from '../users/schemas/user.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { MenuItem } from '../menu.items/schemas/menu.item.schema';
import { Menu } from '../menus/schemas/menu.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(OrderDetail.name) private orderDetailModel: Model<OrderDetail>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
    @InjectModel(Menu.name) private menuModel: Model<Menu>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any) {
    const { restaurantId, items, orderType, paymentMethod, totalPrice, deliveryAddress, tableNumber, phone, notes } = createOrderDto;
    
    // Validate restaurant exists
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new BadRequestException('Restaurant not found');
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    // Create the order
    const order = await this.orderModel.create({
      restaurant: new mongoose.Types.ObjectId(restaurantId),
      user: new mongoose.Types.ObjectId(userId),
      status: 'Pending',
      totalPrice,
      orderType,
      paymentMethod,
      deliveryAddress,
      tableNumber,
      phone,
      notes,
      orderTime: new Date(),
    });

    // Create order details for each item
    for (const item of items) {
      await this.orderDetailModel.create({
        order: order._id,
        menuItem: new mongoose.Types.ObjectId(item.menuItemId),
        quantity: item.quantity,
        price: item.price,
      });
    }

    return order;
  }

  async seed() {
    // Clear old orders and details
    await this.orderModel.deleteMany({});
    await this.orderDetailModel.deleteMany({});

    // Retrieve or create users
    let users = await this.userModel.find();
    if (users.length === 0) {
      const dummyUsers = [
        { name: 'John Doe', email: 'john@example.com', password: 'hashedpassword', phone: '0901234567', address: 'Hanoi' },
        { name: 'Jane Smith', email: 'jane@example.com', password: 'hashedpassword', phone: '0907654321', address: 'HCMC' },
        { name: 'Alex Johnson', email: 'alex@example.com', password: 'hashedpassword', phone: '0911112222', address: 'Da Nang' },
        { name: 'David Lee', email: 'david@example.com', password: 'hashedpassword', phone: '0922223333', address: 'Hanoi' },
        { name: 'Emma Watson', email: 'emma@example.com', password: 'hashedpassword', phone: '0933334444', address: 'Hue' },
      ];
      users = await this.userModel.create(dummyUsers);
    }

    // Retrieve or create restaurants
    let restaurants = await this.restaurantModel.find();
    if (restaurants.length === 0) {
      const dummyRestaurants = [
        { name: 'Gia Restaurant', phone: '024123456', address: '120 Ly Thuong Kiet, Hanoi', email: 'contact@gia.com', rating: 4.8, hours: '08:00-22:00' },
        { name: 'Banh Mi Phuong', phone: '090512345', address: '2b Phan Chu Trinh, Hoi An', email: 'contact@phuongbm.com', rating: 4.7, hours: '06:00-21:00' },
      ];
      restaurants = await this.restaurantModel.create(dummyRestaurants);
    }

    // Retrieve or create menus
    let menus = await this.menuModel.find();
    if (menus.length === 0 && restaurants.length > 0) {
      const dummyMenus = [
        { restaurant: restaurants[0]._id, title: 'Main Menu', description: 'Gia signature dishes' },
        { restaurant: restaurants[1]._id, title: 'Hoi An Specialties', description: 'Traditional Hoi An food' },
      ];
      menus = await this.menuModel.create(dummyMenus);
    }

    // Retrieve or create menu items
    let menuItems = await this.menuItemModel.find();
    if (menuItems.length === 0 && menus.length > 0) {
      const dummyMenuItems = [
        { menu: menus[0]._id, title: 'Crispy Spring Rolls', description: 'Delicious fried rolls with pork and shrimp', basePrice: 95000, enabled: true },
        { menu: menus[0]._id, title: 'Wagyu Beef Pho', description: 'Premium pho with thinly sliced wagyu beef', basePrice: 245000, enabled: true },
        { menu: menus[0]._id, title: 'Lotus Seed Salad', description: 'Refreshing salad with prawns and herbs', basePrice: 155000, enabled: true },
        { menu: menus[1]._id, title: 'Classic Banh Mi', description: 'Traditional Hoi An banh mi with cold cuts', basePrice: 35000, enabled: true },
        { menu: menus[1]._id, title: 'Special Mixed Banh Mi', description: 'The absolute bestseller with all toppings', basePrice: 45000, enabled: true },
        { menu: menus[1]._id, title: 'Cao Lau Noodles', description: 'Traditional pork noodle dish of Hoi An', basePrice: 65000, enabled: true },
      ];
      menuItems = await this.menuItemModel.create(dummyMenuItems);
    }

    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const seededOrders = [];

    // Create 60 orders spanning the last 30 days
    for (let i = 0; i < 60; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

      const restaurantMenuIds = menus
        .filter(m => m.restaurant.toString() === randomRestaurant._id.toString())
        .map(m => m._id.toString());
      const filteredMenuItems = menuItems.filter(item => restaurantMenuIds.includes(item.menu.toString()));
      const availableItems = filteredMenuItems.length > 0 ? filteredMenuItems : menuItems;

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let orderTotal = 0;
      for (let j = 0; j < numItems; j++) {
        const item = availableItems[Math.floor(Math.random() * availableItems.length)];
        orderItems.push(item);
        orderTotal += item.basePrice;
      }

      const daysAgo = Math.random() * 30;
      const orderTime = new Date();
      orderTime.setDate(orderTime.getDate() - daysAgo);

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      let deliveryTime = null;
      if (status === 'delivered') {
        deliveryTime = new Date(orderTime.getTime());
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 30 + Math.random() * 60);
      }

      const order = await this.orderModel.create({
        restaurant: randomRestaurant._id,
        user: randomUser._id,
        status,
        totalPrice: orderTotal,
        orderTime,
        deliveryTime,
      });

      seededOrders.push(order);

      for (const item of orderItems) {
        await this.orderDetailModel.create({
          order: order._id,
          menu: item.menu,
          menuItem: item._id,
        });
      }
    }

    return {
      message: 'Seeded successfully',
      ordersCount: seededOrders.length,
    };
  }

  async getAnalytics() {
    const orders = await this.orderModel.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .exec();

    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const averageOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;

    const dailyRevenueMap = new Map<string, { date: string; revenue: number; count: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenueMap.set(dateStr, { date: dateStr, revenue: 0, count: 0 });
    }

    const monthlyRevenueMap = new Map<string, { month: string; revenue: number; count: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenueMap.set(monthStr, { month: monthStr, revenue: 0, count: 0 });
    }

    for (const order of orders) {
      if (order.status !== 'delivered') continue;
      const orderDate = new Date(order.orderTime);
      const dateStr = orderDate.toISOString().split('T')[0];
      const monthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      if (dailyRevenueMap.has(dateStr)) {
        const currentVal = dailyRevenueMap.get(dateStr)!;
        currentVal.revenue += order.totalPrice;
        currentVal.count += 1;
      }
      if (monthlyRevenueMap.has(monthStr)) {
        const currentVal = monthlyRevenueMap.get(monthStr)!;
        currentVal.revenue += order.totalPrice;
        currentVal.count += 1;
      }
    }

    const dailyRevenue = Array.from(dailyRevenueMap.values());
    const monthlyRevenue = Array.from(monthlyRevenueMap.values());

    const details = await this.orderDetailModel.find()
      .populate('menuItem', 'title basePrice image')
      .exec();

    const itemMap = new Map<string, { title: string; count: number; revenue: number; image: string }>();
    for (const detail of details) {
      const relatedOrder = orders.find(o => o._id.toString() === detail.order.toString());
      if (!relatedOrder || relatedOrder.status !== 'delivered') continue;

      const item = detail.menuItem as any;
      if (!item) continue;

      const itemId = item._id.toString();
      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          title: item.title,
          count: 0,
          revenue: 0,
          image: item.image || '',
        });
      }
      const val = itemMap.get(itemId)!;
      val.count += 1;
      val.revenue += item.basePrice;
    }

    const topSellingProducts = Array.from(itemMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const customerMap = new Map<string, { name: string; email: string; orderCount: number; totalSpent: number }>();
    for (const order of orders) {
      const user = order.user as any;
      if (!user) continue;

      const userId = user._id.toString();
      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          name: user.name,
          email: user.email,
          orderCount: 0,
          totalSpent: 0,
        });
      }
      const val = customerMap.get(userId)!;
      val.orderCount += 1;
      if (order.status === 'delivered') {
        val.totalSpent += order.totalPrice;
      }
    }

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const uniqueCustomerCount = customerMap.size;
    const returningCustomersCount = Array.from(customerMap.values()).filter(c => c.orderCount > 1).length;
    const repeatCustomerRate = uniqueCustomerCount > 0 ? Math.round((returningCustomersCount / uniqueCustomerCount) * 100) : 0;

    const recentOrders = orders
      .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime())
      .slice(0, 10)
      .map(o => ({
        _id: o._id,
        customerName: (o.user as any)?.name || 'Unknown',
        restaurantName: (o.restaurant as any)?.name || 'Unknown',
        totalPrice: o.totalPrice,
        status: o.status,
        orderTime: o.orderTime,
      }));

    return {
      summary: {
        totalRevenue,
        totalOrders,
        activeOrders,
        averageOrderValue,
      },
      dailyRevenue,
      monthlyRevenue,
      topSellingProducts,
      customerEngagement: {
        totalCustomers: uniqueCustomerCount,
        returningCustomers: returningCustomersCount,
        repeatCustomerRate,
        topCustomers,
      },
      recentOrders,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.orderModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate('user', 'name email phone address')
      .populate('restaurant', 'name')
      .sort(sort as any);

    return {
      meta: { current, pageSize, pages: totalPages, total: totalItems },
      results,
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.orderModel.findById(id)
      .populate('user', 'name email phone address')
      .populate('restaurant', 'name')
      .exec();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.orderModel.updateOne({ _id: id }, { $set: updateOrderDto });
  }

  async updateStatus(id: string, status: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái đơn hàng không hợp lệ');
    }
    const updateDoc: any = { status };
    if (status === 'delivered') {
      updateDoc.deliveryTime = new Date();
    }
    return this.orderModel.updateOne({ _id: id }, { $set: updateDoc });
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    await this.orderDetailModel.deleteMany({ order: id });
    return this.orderModel.deleteOne({ _id: id });
  }
}

