import { Component, ChangeDetectorRef, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../../services/category.service';
import { ICategories } from '../../../../../../interfaces/categories.interface';
import { ISubCategories } from '../../../../../../interfaces/sub-categories.interface';
import { ICategoryOption } from '../../../../../../interfaces/category-option.interface';
import { SubCategoryService } from '../../../../../../services/sub-category.service';
import { SelectChangeEvent } from 'primeng/select';
import { ProductService } from '../../../../../../services/product.service';
import { IProductsSection } from '../../../../../../interfaces/products-section.interface';
import { ISectionProducts } from '../../../../../../interfaces/section-products.interface';
import { ProductsSectionService } from '../../../../../../services/products-section.service';
import { OverlayOptions } from 'primeng/api';

@Component({
  selector: 'app-products-section-popup',
  templateUrl: './products-section-popup.component.html',
  styleUrls: ['./products-section-popup.component.css'],
  standalone: false,
})
export class ProductsSectionPopupComponent implements OnChanges {
  @Input() sectionData: IProductsSection | null = null;

  private readonly defaultBadgeColor = '#6366f1';

  form: FormGroup;
  categoryOptions = signal<ICategoryOption[]>([]);
  subCategoryOptions = signal<ICategoryOption[]>([]);
  productsList = signal<ISectionProducts[]>([]);
  showSubCategorySelect = signal(false);
  submitted = false;
  appendTarget: 'body' = 'body';
  selectOverlayOptions: OverlayOptions = {
    appendTo: 'body',
    autoZIndex: true,
    baseZIndex: 1200,
  };

  private subCategoryList: ISubCategories[] = [];
  private categoryID = 0;
  private isEditMode = false;
  private section: IProductsSection | undefined;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private subCategoryService: SubCategoryService,
    private productsService: ProductService,
    private productsSectionService: ProductsSectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.createForm();
    this.loadRelatedData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionData']) {
      this.initializeSection(this.sectionData);
    }
  }

  saveSection(onComplete: (success: boolean) => void): void {
    this.submitted = true;
    this.form.patchValue({ products: this.getSelectedProducts() });
    if (!this.form.valid) {
      onComplete(false);
      return;
    }
    const formValue = this.form.value;
    const request = this.isEditMode
      ? this.productsSectionService.update(formValue)
      : this.productsSectionService.insert(formValue);
    request.subscribe((result) => {
      if (result > 0) {
        this.resetForm();
        onComplete(true);
        return;
      }
      onComplete(false);
    });
  }

  resetForm(): void {
    this.form.reset(this.getDefaultFormValues());
    this.productsList.set([]);
    this.showSubCategorySelect.set(false);
    this.submitted = false;
    this.isEditMode = false;
    this.section = undefined;
    this.categoryID = 0;
  }

  onCategoryChange(event: SelectChangeEvent): void {
    this.categoryID = event.value;
    this.updateSubCategoryOptions();
    if (!this.showSubCategorySelect()) {
      this.getProducts();
    }
  }

  onSubCategoryChange(event: SelectChangeEvent): void {
    this.getProducts(event.value);
  }

  onSelectShow(): void {
    this.cdr.markForCheck();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched || this.submitted) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    const label = this.getFieldLabel(fieldName);
    if (control?.errors?.['required']) {
      return `${label} is required`;
    }
    return '';
  }

  private initializeSection(section: IProductsSection | null): void {
    this.resetForm();
    if (!section) {
      return;
    }
    this.section = section;
    this.isEditMode = true;
    this.patchFormValues();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      title: ['', [Validators.required]],
      displayOrder: [0],
      categoryID: [null, [Validators.required]],
      subCategoryID: [null],
      badgeText: [''],
      badgeColor: [this.defaultBadgeColor],
      products: ['', [Validators.required]],
    });
  }

  private getDefaultFormValues() {
    return {
      id: null,
      title: '',
      displayOrder: 0,
      categoryID: null,
      subCategoryID: null,
      badgeText: '',
      badgeColor: this.defaultBadgeColor,
      products: '',
    };
  }

  private resolveBadgeColor(color?: string | null): string {
    if (!color || !color.trim()) {
      return this.defaultBadgeColor;
    }
    return color;
  }

  private loadRelatedData(): void {
    this.categoryService.getCategories().subscribe((categories: ICategories[]) => {
      this.applyCategoryOptions(categories ?? []);
    });
    this.subCategoryService.getAll().subscribe((subCategories: ISubCategories[]) => {
      this.subCategoryList = subCategories ?? [];
    });
  }

  private patchFormValues(): void {
    if (!this.section) {
      return;
    }
    this.form.patchValue({
      id: this.section.id,
      title: this.section.title,
      displayOrder: this.section.displayOrder,
      categoryID: this.section.categoryID,
      subCategoryID: this.section.subCategoryID || null,
      badgeText: this.section.badgeText || '',
      badgeColor: this.resolveBadgeColor(this.section.badgeColor),
    });
    this.categoryID = this.section.categoryID ?? 0;
    this.updateSubCategoryOptions();
    if (this.section.subCategoryID && this.section.subCategoryID > 0) {
      this.getProducts(this.section.subCategoryID);
      return;
    }
    this.getProducts();
  }

  private getMainImage(product: ISectionProducts): string | null {
    if (!product.images || product.images.length === 0) {
      return null;
    }
    const mainImage = product.images.find((img) => img.isMain && !img.isDeleted);
    if (!mainImage) {
      const firstValidImage = product.images.find((img) => !img.isDeleted);
      return firstValidImage ? firstValidImage.imageUrl : null;
    }
    return mainImage.imageUrl;
  }

  private getProducts(subCategoryID?: number): void {
    this.productsService.getProductsByCategory(this.categoryID, subCategoryID).subscribe((products: ISectionProducts[]) => {
      const mappedProducts = products.map((product) => {
        const isSelected = this.section?.products?.some((p) => p.id === product.id) || false;
        const mainImageUrl = this.getMainImage(product);
        return {
          ...product,
          mainImageUrl,
          isSelected,
        };
      });
      this.productsList.set(mappedProducts);
    });
  }

  private getSelectedProducts(): ISectionProducts[] {
    const selected: ISectionProducts[] = [];
    for (const product of this.productsList()) {
      if (product.isSelected) {
        selected.push(product);
      }
    }
    return selected;
  }

  private applyCategoryOptions(items: ICategories[]): void {
    const options: ICategoryOption[] = [];
    for (const item of items) {
      options.push({ label: item.name, value: item.id });
    }
    this.categoryOptions.set(options);
  }

  private updateSubCategoryOptions(): void {
    const filtered = this.subCategoryList.filter((item) => item.categoryID === this.categoryID);
    const options: ICategoryOption[] = [];
    for (const item of filtered) {
      options.push({ label: item.englishName, value: item.id });
    }
    this.subCategoryOptions.set(options);
    this.showSubCategorySelect.set(options.length > 0);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      title: 'Title',
      categoryID: 'Category',
    };
    return labels[fieldName] ?? fieldName;
  }
}
