export function addBusinessDaysFromDate(dateInput, businessDays) {
  const date = new Date(`${dateInput}T00:00:00`);
  let remaining = Number(businessDays);

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    if (!isWeekend) {
      remaining -= 1;
    }
  }

  return formatDate(date);
}

export function getValidityWindow(dateInput) {
  return {
    valid_from: `${dateInput}T00:00:00`,
    valid_until: `${dateInput}T23:59:59`
  };
}

export function getTodayDateInBogota() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(now);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
