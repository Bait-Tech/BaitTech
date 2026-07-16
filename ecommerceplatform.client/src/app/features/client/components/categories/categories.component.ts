import { Component, OnInit, computed, signal } from '@angular/core';
import { ICategories } from '../../../admin/interfaces/categories.interface';
import { CategoryService } from '../../../admin/services/category.service';
import { Router } from '@angular/router';

const DEFAULT_CATEGORY_IMAGE = '/assets/images/seed/tech-2.jpg';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: false,
})
export class CategoriesComponent implements OnInit {
  categoriesList = signal<ICategories[]>([]);
  searchTerm = signal('');
  loading = signal(true);
  loadError = signal(false);

  filteredCategories = computed(() => {
    return this.filterCategories(this.categoriesList(), this.searchTerm());
  });

  showEmptyState = computed(() => {
    return !this.loading() && !this.loadError() && this.filteredCategories().length === 0;
  });

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
  }

  goToSubCategories(categoryId: number) {
    if (categoryId <= 0) {
      return;
    }

    this.router.navigate(['/sub-categories', categoryId]);
  }

  retryLoad() {
    this.loadCategories();
  }

  private loadCategories() {
    this.loading.set(true);
    this.loadError.set(false);

    this.categoryService.getCategories().subscribe({
      next: (result) => {
        this.categoriesList.set(this.mapCategories(result));
        this.loading.set(false);
      },
      error: () => {
        this.categoriesList.set([]);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private mapCategories(categories: ICategories[]): ICategories[] {
    const mapped: ICategories[] = [];

    for (const category of categories) {
      mapped.push({
        ...category,
        imageUrl: this.resolveCategoryImage(category.imageUrl),
      });
    }

    return mapped;
  }

  private filterCategories(categories: ICategories[], searchTerm: string): ICategories[] {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return categories;
    }

    const filtered: ICategories[] = [];

    for (const category of categories) {
      if (category.name.toLowerCase().includes(term)) {
        filtered.push(category);
      }
    }

    return filtered;
  }

  private resolveCategoryImage(imageUrl?: string): string {
    if (imageUrl && imageUrl.trim()) {
      return imageUrl.trim();
    }

    return DEFAULT_CATEGORY_IMAGE;
  }
}
