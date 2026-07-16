import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JodCurrencyPipe } from './pipes/jod-currency.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [JodCurrencyPipe],
  exports: [JodCurrencyPipe],
})
export class SharedModule {}
