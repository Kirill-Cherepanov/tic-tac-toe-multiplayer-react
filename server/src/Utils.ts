export function deleteFromArray<T>(arr: T[], deleteEl: T): T[] {
  return arr.filter((element) => element !== deleteEl);
}
