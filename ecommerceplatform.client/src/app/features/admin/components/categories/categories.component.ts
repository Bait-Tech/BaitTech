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
        this.categories.set(data ?? []);
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

  saveCategory() {
    this.submitted = true;
    if (!this.category.name?.trim()) {
      return;
    }
    this.saving.set(true);
    if (this.category.id) {
      this.categoryService.updateCategory(this.category).subscribe({
        next: () => this.onSaveSuccess('Category updated'),
        error: () => this.onSaveError('Failed to update category'),
      });
      return;
    }
    this.categoryService.createCategory(this.category).subscribe({
      next: () => this.onSaveSuccess('Category created'),
      error: () => this.onSaveError('Failed to create category'),
    });
  }

  private onSaveSuccess(detail: string): void {
    this.saving.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail,
      life: 3000,
    });
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
      this.category.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private resetPanel(): void {
    this.submitted = false;
    this.category = { id: 0, name: '' };
  }
}
