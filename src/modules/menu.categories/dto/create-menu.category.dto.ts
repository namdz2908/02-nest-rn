import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateMenuCategoryDto {
    @IsNotEmpty({ message: 'menu ID không được để trống' })
    menu: string;

    @IsNotEmpty({ message: 'Tên category không được để trống' })
    name: string;

    @IsOptional()
    @IsNumber({}, { message: 'displayOrder phải là số' })
    displayOrder?: number;
}
