export function tracksProductStock(stockQuantity: number | null | undefined): boolean {
  return stockQuantity != null;
}

export function isProductOutOfStock(stockQuantity: number | null | undefined): boolean {
  return tracksProductStock(stockQuantity) && stockQuantity === 0;
}

export function isProductLowStock(stockQuantity: number | null | undefined): boolean {
  return tracksProductStock(stockQuantity) && stockQuantity! > 0 && stockQuantity! <= 5;
}
