import { Component, OnInit } from '@angular/core';
import { CompanyService } from './shared/services/company.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit {
  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.companyService.load();
  }
}
