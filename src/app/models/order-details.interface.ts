export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnailUrl: string | null;
}

export interface AppliedDiscount {
  code: string;
  amount: number;
}

export interface OrderDetails {
  orderId: string;

  customerName: string;
  customerEmail: string;

  products: OrderProduct[];

  subtotal: number;
  shippingCost: number | null;
  total: number;

  discount: AppliedDiscount | null;

  shippingAddress: {
    street: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  orderDate: string; // ISO string
}
