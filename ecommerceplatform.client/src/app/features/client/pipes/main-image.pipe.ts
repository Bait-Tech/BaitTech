import { Pipe, PipeTransform } from '@angular/core';
import { IProductImage } from '../../admin/interfaces/product-image.interface';

@Pipe({
    name: 'mainImage',
    standalone: false
})
export class MainImagePipe implements PipeTransform {
  transform(images: IProductImage[] | undefined): string {
    if (!images || images.length === 0) {
      return 'assets/placeholder.png';
    }
    let mainImage = images.find(img => img.isMain);

    if(!mainImage){
        mainImage = images[0];
    }
    return mainImage ? mainImage.imageUrl : 'assets/placeholder.png';
  }
}