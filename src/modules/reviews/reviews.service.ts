import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schemas/review.schema';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(createReviewDto: CreateReviewDto) {
    const { user, restaurant, rating, comment, image } = createReviewDto as any;
    const review = await this.reviewModel.create({
      user: user ? new mongoose.Types.ObjectId(user) : undefined,
      restaurant: new mongoose.Types.ObjectId(restaurant),
      rating,
      comment,
      image,
      status: 'pending',
    });
    return review;
  }

  async findAll(query?: string) {
    const { filter, sort } = aqp(query || '');
    const results = await this.reviewModel.find(filter)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort(sort as any || { createdAt: -1 })
      .exec();
    return results;
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestException('Id không đúng định dạng');
    return this.reviewModel.findById(id)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .exec();
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestException('Id không đúng định dạng');
    return this.reviewModel.updateOne({ _id: id }, { $set: updateReviewDto });
  }

  async addAdminReply(id: string, reply: string) {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestException('Id không đúng định dạng');
    return this.reviewModel.updateOne({ _id: id }, { $set: { adminReply: reply } });
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestException('Id không đúng định dạng');
    return this.reviewModel.deleteOne({ _id: id });
  }

  async getRatingDistribution(restaurantId?: string) {
    const match: any = {};
    if (restaurantId) {
      if (!mongoose.isValidObjectId(restaurantId)) throw new BadRequestException('Id không đúng định dạng');
      match.restaurant = new mongoose.Types.ObjectId(restaurantId);
    }
    const pipeline: any[] = [
      { $match: match },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ];
    const result = await this.reviewModel.aggregate(pipeline).exec();
    const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let total = 0;
    let sum = 0;
    for (const r of result) {
      const key = String(r._id);
      distribution[key] = r.count;
      total += r.count;
      sum += r._id * r.count;
    }
    const average = total ? +(sum / total).toFixed(2) : 0;
    return { distribution, total, average };
  }
}
