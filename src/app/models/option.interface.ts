/* option interface represents a unique purchase option of 1 particular art piece.
* Each purchase "option" has its own price, and a corresponding photo (imageUrl) of
* that purchase "option," whether it be framed, unframed, etc...
* If I was ever to sell different sizes of the same art piece, a single instance of
* the option interface would represent a single dimension.
*/
export interface Option {
  subtitle: string;
  price: number;
  imageUrl: string;
}
