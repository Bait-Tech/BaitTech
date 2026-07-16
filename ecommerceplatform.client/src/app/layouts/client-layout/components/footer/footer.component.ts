import { Component } from '@angular/core';
import { CompanyService } from '../../../../shared/services/company.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true
})
export class FooterComponent {
  constructor(public companyService: CompanyService) {}
}
