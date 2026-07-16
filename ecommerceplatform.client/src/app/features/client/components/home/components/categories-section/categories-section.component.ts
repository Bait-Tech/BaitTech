import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { ICategories } from '../../../../../admin/interfaces/categories.interface';

@Component({
  selector: 'app-categories-section',
  templateUrl: './categories-section.component.html',
  styleUrls: ['./categories-section.component.css'],
  standalone: false,
})
export class CategoriesSectionComponent {
  categories = input<ICategories[]>([]);

  constructor(private router: Router) {}

  onCategoryClick(categoryId: number) {
    this.router.navigate(['/sub-categories', categoryId]);
  }

  onSeeAllClick() {
    this.router.navigate(['/categories']);
  }
}
