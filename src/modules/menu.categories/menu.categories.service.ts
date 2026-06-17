import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMenuCategoryDto } from './dto/create-menu.category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu.category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MenuCategory } from './menu.category.schema';
import mongoose, { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class MenuCategoriesService {
  constructor(
    @InjectModel(MenuCategory.name)
    private menuCategoryModel: Model<MenuCategory>,
  ) {}

  async create(createMenuCategoryDto: CreateMenuCategoryDto) {
    const { menu, name, displayOrder } = createMenuCategoryDto;
    return this.menuCategoryModel.create({
      menu: new mongoose.Types.ObjectId(menu),
      name,
      displayOrder: displayOrder ?? 0,
    });
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Support menuId mapping to menu
    if (filter.menuId) {
      filter.menu = new mongoose.Types.ObjectId(filter.menuId);
      delete filter.menuId;
    } else if (filter.menu) {
      filter.menu = new mongoose.Types.ObjectId(filter.menu);
    }

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.menuCategoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.menuCategoryModel
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
    return this.menuCategoryModel.findById(id);
  }

  async findByMenu(menuId: string) {
    if (!mongoose.isValidObjectId(menuId)) {
      throw new BadRequestException('Menu ID không đúng định dạng');
    }
    return this.menuCategoryModel.find({ menu: new mongoose.Types.ObjectId(menuId) });
  }

  async update(id: string, updateMenuCategoryDto: UpdateMenuCategoryDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    const updateData: any = { ...updateMenuCategoryDto };
    if (updateMenuCategoryDto.menu) {
      updateData.menu = new mongoose.Types.ObjectId(updateMenuCategoryDto.menu);
    }
    return this.menuCategoryModel.updateOne(
      { _id: id },
      { $set: updateData }
    );
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng');
    }
    return this.menuCategoryModel.deleteOne({ _id: id });
  }
}
