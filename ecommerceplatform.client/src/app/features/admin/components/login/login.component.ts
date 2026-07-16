import { Component, Inject, OnDestroy, OnInit, Renderer2, DOCUMENT } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../shared/services/auth.service';
import { CompanyService } from '../../../../shared/services/company.service';
import { ILogin } from '../../interfaces/login.interface';
import { LayoutService } from '../../../../layouts/services/app.layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone:false,
  styles: [
    `
      :host ::ng-deep .pi-eye,
      :host ::ng-deep .pi-eye-slash {
        transform: scale(1.6);
        margin-right: 1rem;
        color: var(--primary-color) !important;
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public layoutService: LayoutService,
    public companyService: CompanyService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.enableAdminTheme();
  }

  ngOnDestroy() {
    this.disableAdminTheme();
  }

  private enableAdminTheme() {
    this.renderer.addClass(this.document.body, 'admin-theme');
  }

  private disableAdminTheme() {
    this.renderer.removeClass(this.document.body, 'admin-theme');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credentials: ILogin = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.error = 'Invalid username or password';
        this.loading = false;
      },
    });
  }
}
