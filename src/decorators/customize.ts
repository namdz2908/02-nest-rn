
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// SetMetadata(key, value); // Ta gán key cho SetMetadata và nó chỉ lưu lại value. Thông qua key để lấy ra value, value ở đây chính là metadata muốn gán
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
