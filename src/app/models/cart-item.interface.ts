export interface CartItem {
  imageId: string;
  optionSubtitle: string;
  price: number;
  quantity: number;
  thumbnailUrl: string | null;
  weight: number;
  productId: string;
  originalPrice?: number;
}
