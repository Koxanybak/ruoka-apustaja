export interface ProductEntry {
  id: number;
  name: string;
  price: number;
  pricePerUnit: number | null;
  unit: string | null;
  imgSrc: string;
  store: string;
}

export interface StoreEntry {
  id: number;
  name: string;
  city: string;
}