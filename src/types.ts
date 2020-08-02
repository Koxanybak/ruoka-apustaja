export interface ProductEntry {
  id: number;
  name: string;
  price: number;
  pricePerUnit: number | null;
  unit: string | null;
  imgSrc: string;
  storeID: number;
  link: string;
}

export interface StoreEntry {
  id: number;
  name: string;
  city: string;
  searching?: boolean;
}

export interface ProductSearch {
  desc: string[];
  amount?: number;
  unit?: string;
}

export interface SLSearch {
  storeID: number;
  productSearches: Array<ProductSearch>;
}

export interface ShoppingList {
  [key: string]: number | ProductEntry[];
}

export interface LoginBody {
  username: string;
  password: string;
}

export type NewUserEntry = LoginBody

export interface UserEntry {
  id: number;
  username: string;
  pwHash?: string;
}

export interface ProductCheck {
  searching: boolean;
  has_products: boolean;
}