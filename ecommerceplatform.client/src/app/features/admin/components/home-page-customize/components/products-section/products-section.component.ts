import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { ProductsSectionPopupComponent } from './components/products-section-popup/products-section-popup.component';
import { ProductsSectionService } from '../../../../services/products-section.service';
import { IProductsSection } from '../../../../interfaces/products-section.interface';

@Component({
  selector: 'app-products-section',
  templateUrl: './products-section.component.html',
  styleUrls: ['./products-section.component.css'],
  standalone: false,
})
export class ProductsSectionComponent implements OnInit {
  productSections = signal<IProductsSection[]>([]);
  loading = signal(true);
  sectionPanelVisible = signal(false);
  panelTitle = signal('');
  panelSubtitle = signal('');
  panelIcon = signal('pi pi-plus');
  saveButtonLabel = signal('Create Section');
  selectedSection = signal<IProductsSection | null>(null);

  @ViewChild(ProductsSectionPopupComponent) sectionPopup?: ProductsSectionPopupComponent;

  constructor(private productsSectionService: ProductsSectionService) {}

  ngOnInit() {
    this.loadProductSections();
  }

  loadProductSections() {
    this.loading.set(true);
    this.productsSectionService.getAll().subscribe({
      next: (sections) => {
        this.productSections.set(sections ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  addNewSection() {
    this.selectedSection.set(null);
    this.panelTitle.set('New Section');
    this.panelSubtitle.set('Configure a home page products section');
    this.panelIcon.set('pi pi-plus');
    this.saveButtonLabel.set('Create Section');
    this.sectionPanelVisible.set(true);
  }

  editSection(section: IProductsSection) {
    this.selectedSection.set(section);
    this.panelTitle.set('Edit Section');
    this.panelSubtitle.set('Update section content and products');
    this.panelIcon.set('pi pi-pencil');
    this.saveButtonLabel.set('Save Changes');
    this.sectionPanelVisible.set(true);
  }

  deleteSection(id: number) {
    this.productsSectionService.delete(id).subscribe((result) => {
      if (result) {
        this.loadProductSections();
      }
    });
  }

  onPanelVisibleChange(visible: boolean): void {
    this.sectionPanelVisible.set(visible);
    if (!visible) {
      this.selectedSection.set(null);
      this.sectionPopup?.resetForm();
    }
  }

  hideSectionPanel(): void {
    this.sectionPanelVisible.set(false);
    this.selectedSection.set(null);
    this.sectionPopup?.resetForm();
  }

  saveSectionPanel(): void {
    this.sectionPopup?.saveSection((success) => {
      if (!success) {
        return;
      }
      this.hideSectionPanel();
      this.loadProductSections();
    });
  }
}
