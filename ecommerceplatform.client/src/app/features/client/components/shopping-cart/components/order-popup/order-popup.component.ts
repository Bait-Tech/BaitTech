import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICartState } from '../../../../interfaces/cart-interface';

@Component({
  selector: 'app-order-popup',
  templateUrl: './order-popup.component.html',
  styleUrls: ['./order-popup.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class OrderPopupComponent {
  @Input() cartItems: ICartState[] = [];
  @Output() submitOrder = new EventEmitter<any>();
  @Output() closePopup = new EventEmitter<void>();

  orderForm: FormGroup;
  isSubmitting = false;
  userNameInvalid = false;
  userNameMinLengthInvalid = false;
  locationInvalid = false;
  phoneNumberInvalid = false;
  phoneNumberPatternInvalid = false;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    });
  }

  onSubmit(): void {
    this.refreshValidationFlags();

    if (this.orderForm.valid) {
      this.isSubmitting = true;

      const productsOrderDTO = this.cartItems.map((item) => ({
        productID: item.productID,
        ProductQTY: item.qty,
      }));

      const orderData = {
        ...this.orderForm.value,
        productsOrderDTO,
      };

      this.submitOrder.emit(orderData);
      return;
    }

    this.orderForm.markAllAsTouched();
    this.refreshValidationFlags();
  }

  onClose(): void {
    this.closePopup.emit();
  }

  onUserNameInput(): void {
    this.refreshUserNameValidation();
  }

  onLocationInput(): void {
    this.refreshLocationValidation();
  }

  onPhoneNumberInput(): void {
    this.refreshPhoneValidation();
  }

  private refreshValidationFlags(): void {
    this.refreshUserNameValidation();
    this.refreshLocationValidation();
    this.refreshPhoneValidation();
  }

  private refreshUserNameValidation(): void {
    const control = this.orderForm.controls['userName'];
    this.userNameInvalid = control.touched && control.errors?.['required'] === true;
    this.userNameMinLengthInvalid = control.touched && control.errors?.['minlength'] === true;
  }

  private refreshLocationValidation(): void {
    const control = this.orderForm.controls['location'];
    this.locationInvalid = control.touched && control.errors?.['required'] === true;
  }

  private refreshPhoneValidation(): void {
    const control = this.orderForm.controls['phoneNumber'];
    this.phoneNumberInvalid = control.touched && control.errors?.['required'] === true;
    this.phoneNumberPatternInvalid = control.touched && control.errors?.['pattern'] === true;
  }
}
