import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { IProductImage } from '../../../../admin/interfaces/product-image.interface';
import { IOrders } from '../../../../admin/interfaces/orders.interface';
import { OrdersService } from '../../../../admin/services/orders.service';
import { formatJodCurrency } from '../../../../../shared/utils/format-jod-currency.util';
import { ICartLineItem } from '../../../interfaces/cart-line-item.interface';
import { ICartState } from '../../../interfaces/cart-interface';
import { CartService } from '../../../state-services/cart.service';
import { OrderPopupComponent } from '../components/order-popup/order-popup.component';

@Component({
  selector: 'app-cart-panel',
  templateUrl: './cart-panel.component.html',
  styleUrls: ['./cart-panel.component.css'],
  standalone: true,
  imports: [CommonModule, OrderPopupComponent],
})
export class CartPanelComponent implements OnInit, OnDestroy {
  cartLines = signal<ICartLineItem[]>([]);
  subtotal = signal(0);
  discount = signal(0);
  total = signal(0);
  subtotalLabel = signal('');
  discountLabel = signal('');
  totalLabel = signal('');
  itemCount = signal(0);
  showOrderPopup = signal(false);
  orderSubmitting = signal(false);
  orderSuccess = signal(false);
  orderError = signal(false);
  destroy$ = new Subject<void>();

  constructor(
    public cartService: CartService,
    private ordersService: OrdersService
  ) {
    effect(() => {
      if (this.cartService.isPanelOpen()) {
        this.lockBodyScroll();
        return;
      }

      this.unlockBodyScroll();
    });
  }

  ngOnInit(): void {
    this.cartService.cartState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.syncCartState(items);
      });

    this.syncCartState(this.cartService.currentCartState);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unlockBodyScroll();
  }

  onBackdropClick(): void {
    this.cartService.closePanel();
  }

  onCloseClick(): void {
    this.cartService.closePanel();
  }

  onDecreaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateItemQuantity(productId, currentQty - 1);
  }

  onIncreaseQuantity(productId: number, currentQty: number): void {
    this.cartService.updateItemQuantity(productId, currentQty + 1);
  }

  onRemoveItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  onSubmitOrderClick(): void {
    this.showOrderPopup.set(true);
  }

  onOrderSubmit(orderData: IOrders): void {
    this.orderSubmitting.set(true);
    this.orderSuccess.set(false);
    this.orderError.set(false);

    this.ordersService.addOrder(orderData).subscribe({
      next: () => {
        this.orderSubmitting.set(false);
        this.orderSuccess.set(true);
        this.showOrderPopup.set(false);
        this.cartService.clearCart();
      },
      error: () => {
        this.orderSubmitting.set(false);
        this.orderError.set(true);
      },
    });
  }

  onCloseOrderPopup(): void {
    this.showOrderPopup.set(false);
  }

  onDismissSuccess(): void {
    this.orderSuccess.set(false);
  }

  onDismissError(): void {
    this.orderError.set(false);
  }

  private syncCartState(items: ICartState[]): void {
    this.cartLines.set(this.buildCartLines(items));
    this.calculateTotals(items);
    this.itemCount.set(this.countItems(items));
  }

  private buildCartLines(items: ICartState[]): ICartLineItem[] {
    const lines: ICartLineItem[] = [];

    for (const item of items) {
      if (!item.product || item.productID === undefined) {
        continue;
      }

      const hasDiscount = item.product.discountPrice !== undefined;
      const unitPrice = hasDiscount
        ? item.product.discountPrice!
        : item.product.price;
      const lineTotal = unitPrice * item.qty;

      lines.push({
        productId: item.productID,
        name: item.product.name,
        imageUrl: this.resolveMainImage(item.product.images),
        qty: item.qty,
        unitPrice,
        originalPrice: hasDiscount ? item.product.price : undefined,
        lineTotal,
        unitPriceLabel: formatJodCurrency(unitPrice),
        originalPriceLabel: hasDiscount
          ? formatJodCurrency(item.product.price)
          : undefined,
        lineTotalLabel: formatJodCurrency(lineTotal),
      });
    }

    return lines;
  }

  private calculateTotals(items: ICartState[]): void {
    let subtotalValue = 0;
    let discountedTotal = 0;

    for (const item of items) {
      if (!item.product) {
        continue;
      }

      subtotalValue += item.product.price * item.qty;

      const itemTotal =
        item.product.discountPrice !== undefined
          ? item.product.discountPrice * item.qty
          : item.product.price * item.qty;

      discountedTotal += itemTotal;
    }

    const discountValue = subtotalValue - discountedTotal;

    const subtotal = Number(subtotalValue.toFixed(2));
    const discount = Number(discountValue.toFixed(2));
    const total = Number(discountedTotal.toFixed(2));

    this.subtotal.set(subtotal);
    this.discount.set(discount);
    this.total.set(total);
    this.subtotalLabel.set(formatJodCurrency(subtotal));
    this.discountLabel.set(formatJodCurrency(discount));
    this.totalLabel.set(formatJodCurrency(total));
  }

  private countItems(items: ICartState[]): number {
    let count = 0;

    for (const item of items) {
      count += item.qty;
    }

    return count;
  }

  private resolveMainImage(images: IProductImage[] | undefined): string {
    if (!images || images.length === 0) {
      return 'assets/placeholder.png';
    }

    let mainImage = images.find((image) => image.isMain);

    if (!mainImage) {
      mainImage = images[0];
    }

    return mainImage?.imageUrl ?? 'assets/placeholder.png';
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }
}
