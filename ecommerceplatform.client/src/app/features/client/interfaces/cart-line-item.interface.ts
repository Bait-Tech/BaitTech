export interface ICartLineItem {
  productId: number;
  name: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
  originalPrice?: number;
  lineTotal: number;
  unitPriceLabel: string;
  originalPriceLabel?: string;
  lineTotalLabel: string;
}
