import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<Restaurant>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto, user: any) {
    const { name, phone, address, email, rating, hours } = createRestaurantDto;
    const restaurant = await this.restaurantModel.create({
      name,
      phone,
      address,
      email,
      rating,
      hours,
    });

    if (user && user._id) {
      await this.userModel.updateOne(
        { _id: user._id },
        { $push: { restaurants: restaurant._id } }
      );
    }

    return {
      _id: restaurant._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number, user: any) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Filter by user's owned restaurants if user info is present
    if (user && user._id) {
      const userDb = await this.userModel.findById(user._id);
      const restaurantIds = userDb?.restaurants || [];
      filter._id = { $in: restaurantIds };
    }

    const totalItems = (await this.restaurantModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.restaurantModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findByUser(userId: string) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new BadRequestException('User ID không đúng định dạng');
    }
    const userDb = await this.userModel.findById(userId);
    if (!userDb || !userDb.restaurants) return [];
    return this.restaurantModel.find({ _id: { $in: userDb.restaurants } });
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.restaurantModel.findById(id);
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.restaurantModel.updateOne(
      { _id: id },
      { $set: updateRestaurantDto }
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    // Also remove from user's restaurants array
    await this.userModel.updateMany(
      { restaurants: id },
      { $pull: { restaurants: id } }
    );
    return this.restaurantModel.deleteOne({ _id: id });
  }
}

