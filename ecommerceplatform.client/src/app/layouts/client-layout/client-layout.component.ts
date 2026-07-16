import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartPanelComponent } from '../../features/client/components/shopping-cart/cart-panel/cart-panel.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@Component({
    selector: 'app-client-layout',
    templateUrl: './client-layout.component.html',
    styleUrls: ['./client-layout.component.css'],
    imports: [CommonModule, RouterModule, FooterComponent, NavBarComponent, CartPanelComponent]
})
export class ClientLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  get containerClass(): Record<string, boolean> {
    return {
      'layout-wrapper': true,
      'layout-static': true,
    };
  }
}