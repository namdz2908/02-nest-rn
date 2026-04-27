import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/utils';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name)
  private userModel: Model<User>,
  ) { }

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email: email });
    // hàm exists trả về 1 đối tượng nếu thỏa mãn filter, null nếu ngược lại
    if (user) return true;
    return false;
  }

  // Có thể bọc thêm 1 cặp try catch để xử lý các trường hợp bị lỗi
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;

    // check email
    const isExist = await this.isEmailExist(email); // Nếu không có await, isExist trả về 1 Promise mà không phải boolean
    // Promise luôn là truethy nên luôn đi vào nhánh if và throw exception kể cả khi email đó chưa tồn tại trong db
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại. Vui lòng sử dụng email khác.`);
    }

    // hash password
    const hashPassword = await hashPasswordHelper(password);

    const user = await this.userModel.create({ // đây là hàm create của mongoose, không phải là hàm create đang được định nghĩa
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    })

    return {
      _id: user._id, // _id là quy ước định danh bản ghi của mongoose được tạo tự động
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    // Đọc hướng dẫn của api-query-params để hiểu về hàm aqp()
    // limit: lấy tối đa bao nhiêu bản ghi, skip: bỏ qua bao nhiêu bản ghi đầu tiên
    // --> Kết hợp limit và skip để làm phân trang
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // cần validate dữ liệu kỹ hơn sau này, đây là làm nhanh
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select("-password") //loại trường password khỏi results
      .sort(sort as any);

    return { results, totalPages };
  }

  findById(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({email});
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { $set: updateUserDto } // update những field truyền vào
    )
  }

  async remove(_id: string) {
    // Check id
    if (mongoose.isValidObjectId(_id)) {
      //delete
      return this.userModel.deleteOne({ _id })
    } else {
      throw new BadRequestException(`Id: ${_id} không đúng định dạng của mongoose`)
    }
  }
}
