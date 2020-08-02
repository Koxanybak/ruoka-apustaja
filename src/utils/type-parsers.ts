/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreEntry, ProductEntry, ProductSearch, SLSearch, LoginBody, UserEntry, ProductCheck } from "../types"

// checkers
const isString = (object: any): object is string => {
  return typeof object === "string" || object instanceof String
}
const isNull = (object: any): object is null => {
  return object === null
}
const isNumber = (object: any): object is number => {
  return typeof object === "number" || object instanceof Number
}
const isUndef = (object: any): object is undefined => {
  return object === undefined
}
const isBoolean = (object: any): object is boolean => {
  return typeof object === "boolean"
}

// type parsers
const parseString = (object: any, atrName: string): string => {
  if (!object || !isString(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseStringNull = (object: any, atrName: string): string | null => {
  if (!isNull(object) && !isString(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseStringUndef = (object: any, atrName: string): string | undefined => {
  if (!isUndef(object) && !isString(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseNumber = (object: any, atrName: string): number => {
  if (!object || !isNumber(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseNumberNull = (object: any, atrName: string): number | null => {
  if (!isNull(object) && !isNumber(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseNumberUndef = (object: any, atrName: string): number | undefined => {
  if (!isUndef(object) && !isNumber(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}
export const parseBoolean = (object: any, atrName: string): boolean => {
  if (!isBoolean(object)) {
    throw new TypeError(`Incorrect or missing ${atrName}`)
  }
  return object
}

// interface parsers
export const parseStoreEntry = (object: any): StoreEntry => {
  return {
    id: parseNumber(object.id, "id"),
    name: parseString(object.name, "name"),
    city: parseString(object.city, "city"),
  }
}
export const parseProductEntry = (object: any): ProductEntry => {
  return {
    id: parseNumber(object.id, "id"),
    name: parseString(object.name, "name"),
    price: parseNumber(object.price, "price"),
    imgSrc: parseString(object.imgSrc, "imgSrc"),
    storeID: parseNumber(object.storeID, "storeID"),
    pricePerUnit: parseNumberNull(object.pricePerUnit, "pricePerUnit"),
    unit: parseStringNull(object.unit, "unit"),
    link: parseString(object.link, "link"),
  }
}
export const parseProductSearch = (object: any): ProductSearch => {
  const descStr = parseString(object.desc, "desc")
  const splitDesc = descStr.split(" ")
  return {
    desc: splitDesc,
    amount: parseNumberUndef(object.amount, "amount"),
    unit: parseStringUndef(object.unit, "unit"),
  }
}
export const parseSLSearch = (object: any): SLSearch => {
  return {
    storeID: parseNumber(object.storeID, "storeID"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    productSearches: <ProductSearch[]>object.productSearches.map((ps: any) => parseProductSearch(ps)),
  }
}
export const parseLoginBody = (object: any): LoginBody => {
  return {
    username: parseString(object.username, "username"),
    password: parseString(object.password, "password")
  }
}
export const parseUserEntry = (object: any): UserEntry => {
  return {
    id: parseNumber(object.id, "id"),
    username: parseString(object.username, "username"),
    pwHash: parseString(object.pwHash, "pwHash")
  }
}
export const parseProductCheck = (object: any): ProductCheck => {
  return {
    searching: parseBoolean(object.searching, "searching"),
    has_products: parseBoolean(object.has_products, "has_products"),
  }
}