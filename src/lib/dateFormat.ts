const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "UTC",
});

export function formatDate(value: string | number | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value));
}
