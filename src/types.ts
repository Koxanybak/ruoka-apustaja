// TODO: fix storeID to store_id etc. or shoppingliststuff wont work
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
  storeID: string;
  productSearches: Array<ProductSearch>;
}

export interface ShoppingListResult {
  [key: string]: ProductEntry[];
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

export interface ItemCheck {
  searching: boolean;
  has_products: boolean;
}

export interface ShoppingList {
  id: number;
  store_id: number;
  name: string;
  user_id: number;
  productList?: Omit<ProductEntry, "storeID">[];
}

export interface TokenUser {
  id: number;
  username: string;
  access_token: string;
}