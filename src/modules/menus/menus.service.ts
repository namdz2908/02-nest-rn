import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Menu } from './schemas/menu.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class MenusService {
  constructor(
    @InjectModel(Menu.name)
    private menuModel: Model<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const { restaurant, title, description, image } = createMenuDto;
    return this.menuModel.create({
      restaurant: new mongoose.Types.ObjectId(restaurant),
      title,
      description,
      image,
    });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Support restaurantId parameter mapping to restaurant field
    if (filter.restaurantId) {
      filter.restaurant = new mongoose.Types.ObjectId(filter.restaurantId);
      delete filter.restaurantId;
    } else if (filter.restaurant) {
      filter.restaurant = new mongoose.Types.ObjectId(filter.restaurant);
    }

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.menuModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.menuModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.menuModel.findById(id);
  }

  async findByRestaurant(restaurantId: string) {
    if (!mongoose.isValidObjectId(restaurantId)) {
      throw new BadRequestException('Restaurant ID không đúng định dạng');
    }
    return this.menuModel.find({ restaurant: new mongoose.Types.ObjectId(restaurantId) });
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    const updateData: any = { ...updateMenuDto };
    if (updateMenuDto.restaurant) {
      updateData.restaurant = new mongoose.Types.ObjectId(updateMenuDto.restaurant);
    }
    return this.menuModel.updateOne(
      { _id: id },
      { $set: updateData }
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.menuModel.deleteOne({ _id: id });
  }
}

