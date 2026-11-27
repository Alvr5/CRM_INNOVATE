function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

const NULLABLE_WHEN_EMPTY = /(Id|At|Date|Until|To)$/;

/**
 * Convierte las claves de un objeto de camelCase a snake_case.
 * Los strings vacíos de columnas UUID/FECHA se envían como NULL porque
 * PostgreSQL rechaza "" en esos tipos. Los campos de texto conservan "".
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    result[camelToSnake(key)] = value === "" && NULLABLE_WHEN_EMPTY.test(key) ? null : value;
  }

  return result;
}

export function fromSnakeCase<T>(obj: Record<string, any>): T {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }

  return result as T;
}
