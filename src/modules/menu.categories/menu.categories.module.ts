import { Module } from '@nestjs/common';
import { MenuCategoriesService } from './menu.categories.service';
import { MenuCategoriesController } from './menu.categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuCategory, MenuCategorySchema } from './menu.category.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MenuCategory.name, schema: MenuCategorySchema }])],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
  exports: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
