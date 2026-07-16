import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubCategoryService } from '../../../admin/services/sub-category.service';
import { CategoryService } from '../../../admin/services/category.service';
import { ISubCategories } from '../../../admin/interfaces/sub-categories.interface';
import { Subject, takeUntil } from 'rxjs';

const DEFAULT_SUB_CATEGORY_IMAGE = '/assets/images/seed/tech-2.jpg';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.component.html',
  styleUrls: ['./sub-categories.component.css'],
  standalone: false,
})
export class SubCategoriesComponent implements OnInit, OnDestroy {
  subCategoriesList = signal<ISubCategories[]>([]);
  searchTerm = signal('');
  loading = signal(true);
  loadError = signal(false);
  categoryId = signal(0);
  categoryName = signal('');

  pageTitle = computed(() => {
    const name = this.categoryName().trim();
    if (name) {
      return `${name} Sub Categories`;
    }

    return 'Sub Categories';
  });

  pageSubtitle = computed(() => {
    const name = this.categoryName().trim();
    if (name) {
      return `Browse sub categories under ${name}`;
    }

    return 'Browse all product sub categories';
  });

  showBackLink = computed(() => this.categoryId() > 0);

  filteredSubCategories = computed(() => {
    return this.filterSubCategories(this.subCategoriesList(), this.searchTerm());
  });

  showEmptyState = computed(() => {
    return !this.loading() && !this.loadError() && this.filteredSubCategories().length === 0;
  });

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private subCategoriesService: SubCategoryService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      this.searchTerm.set('');

      if (id) {
        const categoryId = +id;
        this.categoryId.set(categoryId);
        this.loadCategoryName(categoryId);
        this.loadSubCategoriesByCategory(categoryId);
        return;
      }

      this.categoryId.set(0);
      this.categoryName.set('');
      this.loadAllSubCategories();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
  }

  goToProducts(subCategoryId: number) {
    if (subCategoryId <= 0) {
      return;
    }

    this.router.navigate(['/products', subCategoryId]);
  }

  goBackToCategories() {
    this.router.navigate(['/categories']);
  }

  retryLoad() {
    if (this.categoryId() > 0) {
      this.loadSubCategoriesByCategory(this.categoryId());
      return;
    }

    this.loadAllSubCategories();
  }

  private loadCategoryName(categoryId: number) {
    this.categoryService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.categoryName.set(category.name?.trim() ?? '');
      },
      error: () => {
        this.categoryName.set('');
      },
    });
  }

  private loadSubCategoriesByCategory(categoryId: number) {
    this.loading.set(true);
    this.loadError.set(false);

    this.subCategoriesService.getByCategoryID(categoryId).subscribe({
      next: (result) => {
        this.subCategoriesList.set(this.mapSubCategories(result));
        this.loading.set(false);
      },
      error: () => {
        this.subCategoriesList.set([]);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadAllSubCategories() {
    this.loading.set(true);
    this.loadError.set(false);

    this.subCategoriesService.getAll().subscribe({
      next: (result) => {
        this.subCategoriesList.set(this.mapSubCategories(result));
        this.loading.set(false);
      },
      error: () => {
        this.subCategoriesList.set([]);
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  private mapSubCategories(subCategories: ISubCategories[]): ISubCategories[] {
    const mapped: ISubCategories[] = [];

    for (const subCategory of subCategories) {
      mapped.push({
        ...subCategory,
        imageUrl: this.resolveSubCategoryImage(subCategory.imageUrl),
      });
    }

    return mapped;
  }

  private filterSubCategories(
    subCategories: ISubCategories[],
    searchTerm: string
  ): ISubCategories[] {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return subCategories;
    }

    const filtered: ISubCategories[] = [];

    for (const subCategory of subCategories) {
      if (subCategory.englishName.toLowerCase().includes(term)) {
        filtered.push(subCategory);
      }
    }

    return filtered;
  }

  private resolveSubCategoryImage(imageUrl?: string): string {
    if (imageUrl && imageUrl.trim()) {
      return imageUrl.trim();
    }

    return DEFAULT_SUB_CATEGORY_IMAGE;
  }
}
