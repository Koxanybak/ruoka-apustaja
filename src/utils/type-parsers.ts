/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StoreEntry, ProductEntry } from "../types"

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

// type parsers
const parseString = (object: any, atrName: string): string => {
  if (!object || !isString(object)) {
    throw new Error(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseStringNull = (object: any, atrName: string): string | null => {
  if (!isNull(object) && !isString(object)) {
    throw new Error(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseNumber = (object: any, atrName: string): number => {
  if (!object || !isNumber(object)) {
    throw new Error(`Incorrect or missing ${atrName}`)
  }
  return object
}
const parseNumberNull = (object: any, atrName: string): number | null => {
  if (!isNull(object) && !isNumber(object)) {
    throw new Error(`Incorrect or missing ${atrName}`)
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
    store: parseString(object.store, "store"),
    pricePerUnit: parseNumberNull(object.pricePerUnit, "pricePerUnit"),
    unit: parseStringNull(object.unit, "unit"),
  }
}