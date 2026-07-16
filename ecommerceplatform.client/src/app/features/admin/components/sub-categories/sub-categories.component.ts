import { Component, ChangeDetectorRef, OnInit, signal } from '@angular/core';
import { ISubCategories } from '../../interfaces/sub-categories.interface';
import { ICategories } from '../../interfaces/categories.interface';
import { ICategoryOption } from '../../interfaces/category-option.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IPaginationParams } from '../../../../shared/interfaces/pagination-params.interface';
import { SubCategoryService } from '../../services/sub-category.service';
import { CategoryService } from '../../services/category.service';
import { MessageService, OverlayOptions } from 'primeng/api';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.component.html',
  styleUrls: ['./sub-categories.component.css'],
  standalone: false,
})
export class SubCategoriesComponent implements OnInit {
  subCategories = signal<ISubCategories[]>([]);
  categories = signal<ICategories[]>([]);
  categoryOptions = signal<ICategoryOption[]>([]);
  selectedSubCategories: ISubCategories[] = [];
  subCategoryPanelVisible = signal(false);
  deletePanelVisible = signal(false);
  panelTitle = signal('');
  panelSubtitle = signal('');
  panelIcon = signal('pi pi-plus');
  saveButtonLabel = signal('Create Sub Category');
  saving = signal(false);
  imagePreview = signal('');
  submitted = false;
  initialLoading = signal(true);
  tableLoading = signal(false);
  totalRecords = signal(0);
  subCategoryForm: FormGroup;
  appendTarget: 'body' = 'body';
  categoryOverlayOptions: OverlayOptions = {
    appendTo: 'body',
    autoZIndex: true,
    baseZIndex: 1200,
  };

  constructor(
    private fb: FormBuilder,
    private subCategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.subCategoryForm = this.fb.group({
      id: [null],
      englishName: ['', [Validators.required]],
      categoryID: [null, [Validators.required]],
      imageUrl: [''],
      imageFile: [null],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const items = categories ?? [];
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

  openNew(): void {
    this.subCategoryForm.reset();
    this.imagePreview.set('');
    this.submitted = false;
    this.panelTitle.set('New Sub Category');
    this.panelSubtitle.set('Add a new sub category');
    this.panelIcon.set('pi pi-plus');
    this.saveButtonLabel.set('Create Sub Category');
    this.loadCategories();
    this.subCategoryPanelVisible.set(true);
  }

  deleteSelectedCategories(): void {
    this.deletePanelVisible.set(true);
  }

  loadSubCategories(event?: any): void {
    if (!this.initialLoading()) {
      this.tableLoading.set(true);
    }
    const first = event?.first ?? 0;
    const rows = event?.rows ?? 10;
    const params: IPaginationParams = {
      pageNumber: Math.floor(first / rows) + 1,
      pageSize: rows,
    };
    this.subCategoryService.getAllPaged(params).subscribe({
      next: (response) => {
        this.subCategories.set(response.items ?? []);
        this.totalRecords.set(response.totalCount ?? 0);
        this.initialLoading.set(false);
        this.tableLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sub categories',
          life: 3000,
        });
        this.initialLoading.set(false);
        this.tableLoading.set(false);
      },
    });
  }

  editCategory(category: ISubCategories): void {
    this.subCategoryForm.patchValue({
      id: category.id,
      englishName: category.englishName,
      categoryID: category.categoryID,
      imageUrl: category.imageUrl,
    });
    this.imagePreview.set(category.imageUrl ?? '');
    this.submitted = false;
    this.panelTitle.set('Edit Sub Category');
    this.panelSubtitle.set('Update sub category details');
    this.panelIcon.set('pi pi-pencil');
    this.saveButtonLabel.set('Save Changes');
    this.loadCategories();
    this.subCategoryPanelVisible.set(true);
  }

  onPanelVisibleChange(visible: boolean): void {
    this.subCategoryPanelVisible.set(visible);
    if (!visible) {
      this.resetPanel();
    }
  }

  onDeletePanelVisibleChange(visible: boolean): void {
    this.deletePanelVisible.set(visible);
  }

  onCategorySelectShow(): void {
    this.cdr.markForCheck();
  }

  hidePanel(): void {
    this.subCategoryPanelVisible.set(false);
    this.resetPanel();
  }

  onImageInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      return;
    }
    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please upload a valid image file (JPG, PNG)',
        life: 3000,
      });
      input.value = '';
      return;
    }
    this.subCategoryForm.patchValue({ imageFile: file });
    this.readImagePreview(file);
    input.value = '';
  }

  saveCategory(): void {
    this.submitted = true;
    if (this.subCategoryForm.invalid) {
      return;
    }
    this.saving.set(true);
    const formValue = this.subCategoryForm.value;
    const isEditing = formValue.id != null;
    const imageFile = this.subCategoryForm.get('imageFile')?.value;
    if (isEditing) {
      this.subCategoryService.updateWithImage(formValue.id, formValue, imageFile).subscribe({
        next: () => this.onSaveSuccess('Sub category updated'),
        error: () => this.onSaveError('Failed to update sub category'),
      });
      return;
    }
    const subCategoryData = {
      englishName: formValue.englishName,
      arabicName: formValue.englishName,
      categoryID: formValue.categoryID,
    };
    this.subCategoryService.createWithImage(subCategoryData, imageFile).subscribe({
      next: () => this.onSaveSuccess('Sub category created'),
      error: () => this.onSaveError('Failed to create sub category'),
    });
  }

  confirmDeleteSelected(): void {
    this.deletePanelVisible.set(false);
    const selectedIds = this.selectedSubCategories.map((c) => c.id);
    this.subCategoryService.deleteList(selectedIds).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Sub categories deleted',
          life: 3000,
        });
        this.selectedSubCategories = [];
        this.loadSubCategories();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete sub categories',
          life: 3000,
        });
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subCategoryForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched || this.submitted) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.subCategoryForm.get(fieldName);
    const label = this.getFieldLabel(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return `${label} is required`;
      if (control.errors['min']) return `${label} must be greater than or equal to ${control.errors['min'].min}`;
    }
    return '';
  }

  private onSaveSuccess(detail: string): void {
    this.saving.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail,
      life: 3000,
    });
    this.loadSubCategories();
    this.hidePanel();
  }

  private onSaveError(detail: string): void {
    this.saving.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
      life: 3000,
    });
  }

  private readImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      this.imagePreview.set(preview);
      this.subCategoryForm.patchValue({ imageUrl: preview });
    };
    reader.readAsDataURL(file);
  }

  private applyCategoryOptions(items: ICategories[]): void {
    const options: ICategoryOption[] = [];
    for (const item of items) {
      options.push({ label: item.name, value: item.id });
    }
    this.categoryOptions.set(options);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      englishName: 'English Name',
      categoryID: 'Category',
    };
    return labels[fieldName] ?? fieldName;
  }

  private resetPanel(): void {
    this.submitted = false;
    this.subCategoryForm.reset();
    this.imagePreview.set('');
  }
}
