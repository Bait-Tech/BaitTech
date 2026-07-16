import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICartState } from '../interfaces/cart-interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartState = new BehaviorSubject<ICartState[]>([]);
  private panelOpen = signal(false);

  public cartState$ = this.cartState.asObservable();
  public isPanelOpen = this.panelOpen.asReadonly();

  get currentCartState(): ICartState[] {
    return this.cartState.getValue();
  }

  openPanel(): void {
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  togglePanel(): void {
    this.panelOpen.update((open) => !open);
  }

  addToCart(item: ICartState, openPanel = true) {
    const currentState = this.currentCartState;
    const existingItemIndex = currentState.findIndex(
      (c) => c.productID === item.productID
    );

    let updatedItems: ICartState[];

    if (existingItemIndex >= 0) {
      updatedItems = [...currentState];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        qty: updatedItems[existingItemIndex].qty + item.qty,
      };
    } else {
      updatedItems = [...currentState, item];
    }

    this.cartState.next(updatedItems);

    if (openPanel) {
      this.openPanel();
    }
  }

  clearCart(): void {
    this.cartState.next([]);
  }

  removeFromCart(itemId: number): void {
    const updatedItems = this.currentCartState.filter(
      (item) => item.productID !== itemId
    );
    this.cartState.next(updatedItems);
  }

  updateItemQuantity(productId: number, qty: number): void {
    if (qty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updatedItems = this.currentCartState.map((item) => {
      if (item.productID !== productId) {
        return item;
      }

      return { ...item, qty };
    });

    this.cartState.next(updatedItems);
  }

  getCartTotal(): number {
    return this.currentCartState.reduce((total, item) => total + item.qty, 0);
  }
}
