export function stringifyValues<T>(data: T): any {
  if (data === null || data === undefined) {
    return "";
  }

  if (Array.isArray(data)) {
    return data.map((item) => stringifyValues(item));
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key in data) {
      result[key] = stringifyValues((data as Record<string, any>)[key]);
    }
    return result;
  }

  return String(data);
}