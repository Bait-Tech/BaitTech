import { Pipe, PipeTransform } from '@angular/core';
import { formatJodCurrency } from '../utils/format-jod-currency.util';

@Pipe({
  name: 'jodCurrency',
  standalone: false,
})
export class JodCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatJodCurrency(value);
  }
}
