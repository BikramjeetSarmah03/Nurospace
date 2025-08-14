import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createEnum<T extends readonly string[]>(values: T) {
  return {
    values,
    object: Object.fromEntries(values.map((v) => [v, v])) as {
      [K in T[number]]: K;
    },
    type: null as unknown as T[number],
  };
}
