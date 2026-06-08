// Russian plural selection.
// forms = [one, few, many]
//   one  -> 1, 21, 31…   (mod10 === 1, except 11)
//   few  -> 2-4, 22-24…  (mod10 in 2..4, except 12-14)
//   many -> 0, 5-20, …
export function pluralRu(n, [one, few, many]) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
