import { Component, ChangeDetectorRef, OnInit, signal } from '@angular/core';

import { IProductImage } from '../../interfaces/product-image.interface';

import { IProducts } from '../../interfaces/products.interface';

import { ICategories } from '../../interfaces/categories.interface';

import { ICategoryOption } from '../../interfaces/category-option.interface';

import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MessageService, OverlayOptions } from 'primeng/api';

import { CategoryService } from '../../services/category.service';

import { ProductService } from '../../services/product.service';



@Component({

  selector: 'app-product',

  templateUrl: './products.component.html',

  styleUrls: ['./products.component.css'],

  standalone:false,

})

export class ProductsComponent implements OnInit {

  products = signal<IProducts[]>([]);

  categories = signal<ICategories[]>([]);

  categoryOptions = signal<ICategoryOption[]>([]);

  appendTarget: 'body' = 'body';

  categoryOverlayOptions: OverlayOptions = {
    appendTo: 'body',
    autoZIndex: true,
    baseZIndex: 1200,
  };

  selectedProducts: IProducts[] = [];

  productPanelVisible = signal(false);
  panelTitle = signal('');
  panelSubtitle = signal('');
  panelIcon = signal('pi pi-plus');
  saveButtonLabel = signal('Create Product');
  saving = signal(false);
  visibleImageCount = signal(0);
  imageUrlInput = signal('');

  deletePanelVisible = signal(false);

  submitted: boolean = false;

  initialLoading = signal(true);

  tableLoading = signal(false);

  totalRecords = signal(0);
  tableFirst = signal(0);
  readonly pageSize = 10;

  productForm: FormGroup;

  constructor(

    private fb: FormBuilder,

    private productService: ProductService,

    private categoryService: CategoryService,

    private messageService: MessageService,

    private cdr: ChangeDetectorRef

  ) {

    this.productForm = this.createForm();

  }



  ngOnInit() {

    this.loadCategories();

    this.fetchProducts(0);

  }



  createForm(): FormGroup {

    return this.fb.group({

      id: [null],

      name: ['', [Validators.required]],

      code: ['', [Validators.required]],

      description: ['', [Validators.required]],

      categoryID: [null, [Validators.required]],

      price: [0, [Validators.required, Validators.min(0)]],

      discountPrice: [0, [Validators.min(0)]],

      stockQuantity: [null, [Validators.min(0)]],

      images: this.fb.array([]),

    });

  }



  get imagesFormArray() {

    return this.productForm.get('images') as FormArray;

  }



  createImageFormGroup(image: IProductImage) {

    return this.fb.group({

      id: [image.id],

      imageUrl: [image.imageUrl],

      isMain: [image.isMain],

      isDeleted: [image.isDeleted],

      imageFile: [image.imageFile],

    });

  }



  loadProducts(event?: { first?: number | null }): void {
    const first = event?.first ?? this.tableFirst();
    this.fetchProducts(first);
  }

  private fetchProducts(first: number): void {
    if (!this.initialLoading()) {
      this.tableLoading.set(true);
    }

    const normalizedFirst = this.normalizeFirst(first);
    this.tableFirst.set(normalizedFirst);

    this.productService.getPagedProducts(normalizedFirst, this.pageSize).subscribe({
      next: (response) => {
        const totalCount = response.totalCount ?? 0;
        this.products.set(response.items ?? []);
        this.totalRecords.set(totalCount);

        const adjustedFirst = this.resolveAdjustedFirst(totalCount);
        if (adjustedFirst != null) {
          this.tableFirst.set(adjustedFirst);
          this.fetchProducts(adjustedFirst);
          return;
        }

        this.initialLoading.set(false);
        this.tableLoading.set(false);
      },

      error: () => {

        this.messageService.add({

          severity: 'error',

          summary: 'Error',

          detail: 'Failed to load products',

          life: 3000,

        });

        this.initialLoading.set(false);

        this.tableLoading.set(false);

      },

    });

  }



  loadCategories() {

    this.categoryService.getCategories().subscribe({

      next: (data) => {

        const items = data ?? [];

        this.categories.set(items);

        this.applyCategoryOptions(items);

      },

      error: () => {

        this.messageService.add({

          severity: 'error',

          summary: 'Error',

          detail: 'Failed to load categories',

          life: 3000,

        });

      },

    });

  }



  openNew() {

    this.productForm.reset();

    this.imagesFormArray.clear();

    this.submitted = false;

    this.visibleImageCount.set(0);
    this.imageUrlInput.set('');

    this.panelTitle.set('New Product');

    this.panelSubtitle.set('Add a new product to your store');

    this.panelIcon.set('pi pi-plus');

    this.saveButtonLabel.set('Create Product');

    this.loadCategories();

    this.productPanelVisible.set(true);

  }



  deleteSelectedProducts() {

    this.deletePanelVisible.set(true);

  }



  editProduct(product: IProducts) {

    this.productForm.patchValue({

      ...product,

    });



    this.imagesFormArray.clear();



    product.images?.forEach((image) => {

      this.imagesFormArray.push(this.createImageFormGroup(image));

    });



    this.panelTitle.set('Edit Product');

    this.panelSubtitle.set('Update product details and inventory');

    this.panelIcon.set('pi pi-pencil');

    this.saveButtonLabel.set('Save Changes');

    this.updateVisibleImageCount();

    this.loadCategories();

    this.productPanelVisible.set(true);

  }



  onCategorySelectShow(): void {

    this.cdr.markForCheck();

  }



  onPanelVisibleChange(visible: boolean): void {

    this.productPanelVisible.set(visible);

    if (!visible) {

      this.resetPanel();

    }

  }



  onDeletePanelVisibleChange(visible: boolean): void {

    this.deletePanelVisible.set(visible);

  }



  removeImage(index: number) {

    const imageControl = this.imagesFormArray.at(index);

    if (imageControl.get('id')?.value) {

      imageControl.patchValue({ isDeleted: true });



      if (imageControl.get('isMain')?.value) {

        const firstNonDeleted = this.imagesFormArray.controls.find(

          (control) => !control.get('isDeleted')?.value

        );

        if (firstNonDeleted) {

          firstNonDeleted.patchValue({ isMain: true });

        }

      }

    } else {

      this.imagesFormArray.removeAt(index);



      if (this.imagesFormArray.length > 0 && !this.hasMainImage()) {

        this.imagesFormArray.at(0).patchValue({ isMain: true });

      }

    }

    this.updateVisibleImageCount();

  }



  setMainImage(index: number) {

    this.imagesFormArray.controls.forEach((control) => {

      control.patchValue({ isMain: false });

    });

    this.imagesFormArray.at(index).patchValue({ isMain: true });

  }



  hasMainImage(): boolean {

    return this.imagesFormArray.controls.some(

      (control) =>

        !control.get('isDeleted')?.value && control.get('isMain')?.value

    );

  }



  confirmDeleteSelected() {

    this.deletePanelVisible.set(false);

    this.productService

      .deleteProducts(this.selectedProducts.map((p) => p.id!))

      .subscribe({

        next: () => {

          this.messageService.add({

            severity: 'success',

            summary: 'Successful',

            detail: 'Products deleted',

            life: 3000,

          });

          this.selectedProducts = [];

          this.reloadCurrentPage();

        },

        error: () => {

          this.messageService.add({

            severity: 'error',

            summary: 'Error',

            detail: 'Failed to delete products',

            life: 3000,

          });

        },

      });

  }



  hidePanel(): void {

    this.productPanelVisible.set(false);

    this.resetPanel();

  }



  private resetPanel(): void {

    this.submitted = false;

    this.productForm.reset();

    this.imagesFormArray.clear();

    this.visibleImageCount.set(0);
    this.imageUrlInput.set('');

  }



  saveProduct() {

    this.submitted = true;



    if (!this.productForm.valid) {

      return;

    }



    this.saving.set(true);

    const productData = this.normalizeProductForm(this.productForm.value);



    if (productData.id) {

      this.productService.updateProduct(productData).subscribe({

        next: () => {

          this.messageService.add({

            severity: 'success',

            summary: 'Successful',

            detail: 'Product updated',

            life: 3000,

          });

          this.saving.set(false);

          this.reloadCurrentPage();

          this.hidePanel();

        },

        error: () => {

          this.saving.set(false);

          this.messageService.add({

            severity: 'error',

            summary: 'Error',

            detail: 'Failed to update product',

            life: 3000,

          });

        },

      });

    } else {

      this.productService.createProduct(productData).subscribe({

        next: () => {

          this.messageService.add({

            severity: 'success',

            summary: 'Successful',

            detail: 'Product created',

            life: 3000,

          });

          this.saving.set(false);

          this.reloadFromFirstPage();

          this.hidePanel();

        },

        error: () => {

          this.saving.set(false);

          this.messageService.add({

            severity: 'error',

            summary: 'Error',

            detail: 'Failed to create product',

            life: 3000,

          });

        },

      });

    }

  }



  onImageInputChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {

      return;

    }



    this.addImageFiles(Array.from(input.files));

    input.value = '';

  }



  onImageUrlInputChange(value: string): void {
    this.imageUrlInput.set(value);
  }

  addImageFromUrl(): void {
    const trimmedUrl = this.imageUrlInput().trim();

    if (!trimmedUrl) {
      return;
    }

    const newImage: IProductImage = {
      imageUrl: trimmedUrl,
      isMain: this.imagesFormArray.length === 0,
      isDeleted: false,
    };

    this.imagesFormArray.push(this.createImageFormGroup(newImage));
    this.imageUrlInput.set('');
    this.updateVisibleImageCount();
  }



  private addImageFiles(files: File[]): void {

    for (const file of files) {

      const previewUrl = URL.createObjectURL(file);



      const newImage: IProductImage = {

        imageUrl: previewUrl,

        isMain: this.imagesFormArray.length === 0,

        isDeleted: false,

        imageFile: file,

      };



      this.imagesFormArray.push(this.createImageFormGroup(newImage));

    }



    this.updateVisibleImageCount();

  }



  private updateVisibleImageCount(): void {

    let count = 0;

    for (const control of this.imagesFormArray.controls) {

      if (!control.get('isDeleted')?.value) {

        count++;

      }

    }

    this.visibleImageCount.set(count);

  }



  private applyCategoryOptions(items: ICategories[]): void {

    const options: ICategoryOption[] = [];

    for (const item of items) {

      options.push({

        label: item.name,

        value: item.id,

      });

    }

    this.categoryOptions.set(options);

  }



  getMainImageUrl(product: IProducts): string {

    return product.images?.find((img) => img.isMain)?.imageUrl || '';

  }



  getCategoryName(categoryId: number): string {

    return this.categories().find((c) => c.id === categoryId)?.name || '';

  }



  isFieldInvalid(fieldName: string): boolean {

    const field = this.productForm.get(fieldName);

    return field

      ? field.invalid && (field.dirty || field.touched || this.submitted)

      : false;

  }



  getFieldError(fieldName: string): string {

    const control = this.productForm.get(fieldName);

    const label = this.getFieldLabel(fieldName);

    if (control?.errors) {

      if (control.errors['required']) return `${label} is required`;

      if (control.errors['min'])

        return `${label} must be greater than or equal to ${control.errors['min'].min}`;

    }

    return '';

  }



  private getFieldLabel(fieldName: string): string {

    const labels: Record<string, string> = {

      name: 'Product Name',

      code: 'Product Code',

      description: 'Description',

      categoryID: 'Category',

      stockQuantity: 'Stock Quantity',

      price: 'Regular Price',

      discountPrice: 'Discount Price',

    };

    return labels[fieldName] ?? fieldName;

  }

  private normalizeProductForm(value: IProducts): IProducts {
    const stockQuantity = value.stockQuantity;

    return {
      ...value,
      stockQuantity:
        stockQuantity === null || stockQuantity === undefined ? null : stockQuantity,
    };
  }

  private reloadCurrentPage(): void {
    this.fetchProducts(this.tableFirst());
  }

  private reloadFromFirstPage(): void {
    this.fetchProducts(0);
  }

  private normalizeFirst(first: number): number {
    if (!Number.isFinite(first) || first < 0) {
      return 0;
    }

    return Math.floor(first);
  }

  private resolveAdjustedFirst(totalCount: number): number | null {
    if (totalCount <= 0) {
      return this.tableFirst() === 0 ? null : 0;
    }

    const maxFirst = Math.floor((totalCount - 1) / this.pageSize) * this.pageSize;
    if (this.tableFirst() > maxFirst) {
      return maxFirst;
    }

    return null;
  }

}


