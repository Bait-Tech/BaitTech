import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../../features/client/state-services/cart.service';
import { CompanyService } from '../../../../shared/services/company.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  imports: [RouterModule]
})
export class NavBarComponent implements OnInit, OnDestroy {
  cartItemCount = signal(0);
  searchTerm = signal('');
  destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    public companyService: CompanyService
  ) {}

  ngOnInit() {
    this.cartService.cartState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cartItems) => {
        this.cartItemCount.set(this.calculateCartCount(cartItems));
      });
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    this.navigateToProductsSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calculateCartCount(cartItems: { qty: number }[]): number {
    let total = 0;

    for (const item of cartItems) {
      total += item.qty;
    }

    return total;
  }

  openCart() {
    this.cartService.openPanel();
  }

  private navigateToProductsSearch() {
    const query = this.searchTerm().trim();

    if (!query) {
      this.router.navigate(['/products']);
      return;
    }

    this.router.navigate(['/products'], { queryParams: { q: query } });
  }
}
