import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { LoginComponent } from './components/login/login.component';
import { ProductsComponent } from './components/products/products.component';
import { SubCategoriesComponent } from './components/sub-categories/sub-categories.component';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';
import { HomePageCustomizeComponent } from './components/home-page-customize/home-page-customize.component';
import { TooltipModule } from 'primeng/tooltip';
import { HeroSectionComponent } from './components/home-page-customize/components/hero-section/hero-section.component';
import { ProductsSectionComponent } from './components/home-page-customize/components/products-section/products-section.component';
import { ProductsSectionPopupComponent } from './components/home-page-customize/components/products-section/components/products-section-popup/products-section-popup.component';
import { ColorChromeModule } from 'ngx-color/chrome';
import { PendingOrdersComponent } from './components/pending-orders/pending-orders.component';
import { ConfirmedOrdersComponent } from './components/confirmed-orders/confirmed-orders.component';
import { CompanySettingsComponent } from './components/company-settings/company-settings.component';
import { AdminPageHeaderComponent } from './components/shared/admin-page-header/admin-page-header.component';
import { SidePanelComponent } from './components/shared/side-panel/side-panel.component';
import { AdminConfirmPanelComponent } from './components/shared/admin-confirm-panel/admin-confirm-panel.component';
import { SharedModule as AppSharedModule } from '../../shared/shared.module';
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'sub-categories', component: SubCategoriesComponent },
      { path: 'home-page-customize', component: HomePageCustomizeComponent },
      { path: 'pending-orders', component: PendingOrdersComponent },
      { path: 'confirmed-orders', component: ConfirmedOrdersComponent },
      { path: 'company-settings', component: CompanySettingsComponent },
    ],
  },
];
 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    PasswordModule,
    CheckboxModule,
    RippleModule,
    ButtonModule,
    CardModule,
    TableModule,
    SharedModule,
    MenuModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    PanelMenuModule,
    DividerModule,
    MessageModule,
    AvatarModule,
    BadgeModule,
    FileUploadModule,
    TooltipModule,
    ColorChromeModule,
    AdminLayoutComponent,
    AppSharedModule,
  ],
  declarations: [
    DashboardComponent,
    CategoriesComponent,
    LoginComponent,
    ProductsComponent,
    SubCategoriesComponent,
    HomePageCustomizeComponent,
    HeroSectionComponent,
    ProductsSectionComponent, 
    ProductsSectionPopupComponent,
    PendingOrdersComponent,
    ConfirmedOrdersComponent,
    AdminPageHeaderComponent,
    SidePanelComponent,
    AdminConfirmPanelComponent,
    CompanySettingsComponent
  ],
  providers: [MessageService, ConfirmationService],
})
export class AdminModule {}
