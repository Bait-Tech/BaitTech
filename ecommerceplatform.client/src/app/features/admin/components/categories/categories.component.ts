import { Component, OnInit, signal } from '@angular/core';
import { ICategories } from '../../interfaces/categories.interface';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: false,
})
export class CategoriesComponent implements OnInit {
  categories = signal<ICategories[]>([]);
  loading = signal(true);
  category: ICategories = { id: 0, name: '' };
  selectedCategories: ICategories[] = [];
  categoryPanelVisible = signal(false);
  deletePanelVisible = signal(false);
  panelTitle = signal('');
  panelSubtitle = signal('');
  panelIcon = signal('pi pi-plus');
  saveButtonLabel = signal('Create Category');
  saving = signal(false);
  imagePreview = signal('');
  tableFirst = signal(0);
  readonly pageSize = 10;
  submitted = false;

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        const items = data ?? [];
        this.categories.set(items);
        this.applyTableFirst(items.length);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
          life: 3000,
        });
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.category = { id: 0, name: '' };
    this.imagePreview.set('');
    this.submitted = false;
    this.panelTitle.set('New Category');
    this.panelSubtitle.set('Add a new product category');
    this.panelIcon.set('pi pi-plus');
    this.saveButtonLabel.set('Create Category');
    this.categoryPanelVisible.set(true);
  }

  deleteSelectedCategories() {
    this.deletePanelVisible.set(true);
  }

  editCategory(category: ICategories) {
    this.category = { ...category };
    this.imagePreview.set(category.imageUrl ?? '');
    this.submitted = false;
    this.panelTitle.set('Edit Category');
    this.panelSubtitle.set('Update category name and image');
    this.panelIcon.set('pi pi-pencil');
    this.saveButtonLabel.set('Save Changes');
    this.categoryPanelVisible.set(true);
  }

  onPanelVisibleChange(visible: boolean): void {
    this.categoryPanelVisible.set(visible);
    if (!visible) {
      this.resetPanel();
    }
  }

  onDeletePanelVisibleChange(visible: boolean): void {
    this.deletePanelVisible.set(visible);
  }

  onTablePage(event: { first?: number | null }): void {
    this.tableFirst.set(this.normalizeFirst(event.first));
  }

  confirmDeleteSelected() {
    this.deletePanelVisible.set(false);
    this.categoryService
      .deleteCategories(this.selectedCategories.map((c) => c.id))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Categories deleted',
            life: 3000,
          });
          this.selectedCategories = [];
          this.loadCategories();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete categories',
            life: 3000,
          });
        },
      });
  }

  hidePanel(): void {
    this.categoryPanelVisible.set(false);
    this.resetPanel();
  }

  onImageInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) {
      return;
    }
    const file = input.files[0];
    this.category.imageFile = file;
    this.readImagePreview(file);
    input.value = '';
  }

  onImageUrlInput(value: string): void {
    const trimmedUrl = value.trim();
    this.category.imageUrl = trimmedUrl;
    this.category.imageFile = undefined;
    this.imagePreview.set(trimmedUrl);
  }

  saveCategory() {
    this.submitted = true;
    if (!this.category.name?.trim()) {
      return;
    }
    this.saving.set(true);
    const isEditing = this.category.id > 0;
    if (isEditing) {
      this.categoryService.updateCategory(this.category).subscribe({
        next: () => this.onSaveSuccess('Category updated', true),
        error: () => this.onSaveError('Failed to update category'),
      });
      return;
    }
    this.categoryService.createCategory(this.category).subscribe({
      next: () => this.onSaveSuccess('Category created', false),
      error: () => this.onSaveError('Failed to create category'),
    });
  }

  private onSaveSuccess(detail: string, isEditing: boolean): void {
    this.saving.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail,
      life: 3000,
    });
    if (!isEditing) {
      this.tableFirst.set(0);
    }
    this.loadCategories();
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
      this.category.imageUrl = preview;
      this.imagePreview.set(preview);
    };
    reader.readAsDataURL(file);
  }

  private resetPanel(): void {
    this.submitted = false;
    this.category = { id: 0, name: '' };
    this.imagePreview.set('');
  }

  private normalizeFirst(first: number | null | undefined): number {
    if (first == null || !Number.isFinite(first) || first < 0) {
      return 0;
    }

    return Math.floor(first);
  }

  private applyTableFirst(totalCount: number): void {
    if (totalCount <= 0) {
      this.tableFirst.set(0);
      return;
    }

    const maxFirst = Math.floor((totalCount - 1) / this.pageSize) * this.pageSize;
    if (this.tableFirst() > maxFirst) {
      this.tableFirst.set(maxFirst);
    }
  }
}
