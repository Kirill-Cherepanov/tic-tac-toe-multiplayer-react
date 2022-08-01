export function deleteFromArray<T>(arr: T[], deleteEl: T): void {
  arr = arr.filter((element) => element !== deleteEl);
}
