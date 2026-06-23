export class CreateReviewDto {
  user?: string;
  restaurant: string;
  rating: number;
  comment?: string;
  image?: string;
}
