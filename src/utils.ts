export function iso8601Now(): string {
  let now = new Date(Date.now());

  let year = now.getFullYear().toString().padStart(4, "0");
  let month = (now.getMonth() + 1).toString().padStart(2, "0");
  let day = now.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
