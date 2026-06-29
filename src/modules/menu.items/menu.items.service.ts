import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMenuItemDto } from './dto/create-menu.item.dto';
import { UpdateMenuItemDto } from './dto/update-menu.item.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MenuItem } from './schemas/menu.item.schema';
import { Menu } from '../menus/schemas/menu.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItem>,
    @InjectModel(Menu.name)
    private menuModel: Model<Menu>,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    const { menu, category, title, description, basePrice, image, enabled } = createMenuItemDto;
    return this.menuItemModel.create({
      menu: new mongoose.Types.ObjectId(menu),
      category: new mongoose.Types.ObjectId(category),
      title,
      description,
      basePrice,
      image,
      enabled: enabled ?? true,
    });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Support restaurantId: lấy tất cả menus thuộc nhà hàng đó, rồi filter item theo menu
    if (filter.restaurantId) {
      if (!mongoose.isValidObjectId(filter.restaurantId)) {
        throw new BadRequestException('restaurantId không đúng định dạng');
      }
      const menus = await this.menuModel.find({
        restaurant: new mongoose.Types.ObjectId(filter.restaurantId),
      }).select('_id');
      const menuIds = menus.map((m) => m._id);
      filter.menu = { $in: menuIds };
      delete filter.restaurantId;
    } else if (filter.menuId) {
      // Support menuId parameter mapping to menu field
      filter.menu = new mongoose.Types.ObjectId(filter.menuId);
      delete filter.menuId;
    } else if (filter.menu) {
      filter.menu = new mongoose.Types.ObjectId(filter.menu);
    }

    // Support categoryId parameter mapping to category field
    if (filter.categoryId) {
      filter.category = new mongoose.Types.ObjectId(filter.categoryId);
      delete filter.categoryId;
    } else if (filter.category) {
      filter.category = new mongoose.Types.ObjectId(filter.category);
    }

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.menuItemModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.menuItemModel
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
    return this.menuItemModel.findById(id);
  }

  async findByMenu(menuId: string) {
    if (!mongoose.isValidObjectId(menuId)) {
      throw new BadRequestException('Menu ID không đúng định dạng');
    }
    return this.menuItemModel.find({ menu: new mongoose.Types.ObjectId(menuId) });
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    const updateData: any = { ...updateMenuItemDto };
    if (updateMenuItemDto.menu) {
      updateData.menu = new mongoose.Types.ObjectId(updateMenuItemDto.menu);
    }
    if (updateMenuItemDto.category) {
      updateData.category = new mongoose.Types.ObjectId(updateMenuItemDto.category);
    }
    return this.menuItemModel.updateOne(
      { _id: id },
      { $set: updateData }
    );
  }

  async bulkUpdate(ids: string[], basePrice?: number, enabled?: boolean, category?: string, description?: string) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Danh sách IDs không hợp lệ');
    }
    const updateDoc: any = {};
    if (basePrice !== undefined) updateDoc.basePrice = basePrice;
    if (enabled !== undefined) updateDoc.enabled = enabled;
    if (category !== undefined) {
      if (category === '' || category === null) {
        updateDoc.category = null;
      } else {
        if (!mongoose.isValidObjectId(category)) {
          throw new BadRequestException('Category ID không đúng định dạng');
        }
        updateDoc.category = new mongoose.Types.ObjectId(category);
      }
    }
    if (description !== undefined) updateDoc.description = description;

    const objectIds = ids.map(id => {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException(`ID ${id} không đúng định dạng`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    return this.menuItemModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: updateDoc }
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.menuItemModel.deleteOne({ _id: id });
  }
}

