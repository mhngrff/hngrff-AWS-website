import { Option } from './option.interface';

/* image interface represents an entry in the image-data.json.
* the name of this file should really be "Art piece" or something like that,
* actual images are contained in the OPTIONS array, which is a separate interface
*/
export interface Image {
  id: string;
  title: string;
  description: string;
  currency: string;
  zoomImage?: string;
  thumbnail: string;
  options?: Option[];
}
