// src/utils.js
export function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

export function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(Math.ceil(num));
}

export function formatGongsu(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 3,
  }).format(num);
}

export function normalizeMonthText(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace("급여계산_", "");
  const match = cleaned.match(/^(\d{4})-(\d{2})$/);
  if (!match) return cleaned;
  return `${match[1]}-${match[2]}`;
}

export function safeGongsuTotal(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 1000) return 0;
  return num;
}

export function getWeekdayClass(monthText, day) {
  if (!monthText || !day) return "";
  const normalized = normalizeMonthText(monthText);
  const [year, month] = normalized.split("-").map(Number);
  const dayNum = Number(day);
  if (!year || !month || !dayNum) return "";

  const date = new Date(year, month - 1, dayNum);
  const week = date.getDay();
  if (week === 0) return "sun";
  if (week === 6) return "sat";
  return "";
}

export function getDayColor(monthText, day) {
  const weekClass = getWeekdayClass(monthText, day);
  if (weekClass === "sun") return "#d32f2f";
  if (weekClass === "sat") return "#1976d2";
  return "#16324f";
}

export function getCalendarCells(monthText, summaryDays = []) {
  if (!monthText) return [];
  const normalized = normalizeMonthText(monthText);
  const [year, month] = normalized.split("-").map(Number);
  if (!year || !month) return [];

  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);
  const firstDay = firstDate.getDay();
  const daysInMonth = lastDate.getDate();

  const dayMap = {};
  summaryDays.forEach((item) => {
    if (item) dayMap[Number(item.day)] = item.value;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ type: "empty", key: `empty-start-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      type: "day",
      key: `day-${day}`,
      day,
      value: dayMap[day] ?? "",
      weekdayClass: getWeekdayClass(normalized, day),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: "empty", key: `empty-end-${cells.length}` });
  }

  return cells;
}

export function getTodayInfo() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

export function maskPhone8(value = "") {
  if (value.length !== 8) return value;
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

export function formatPayrollTitleMonth(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const cleaned = raw.replace("급여계산_", "");
  const match = cleaned.match(/^(\d{4})-(\d{2})$/);
  if (!match) return raw;
  return `${match[1]}년 ${Number(match[2])}월`;
}

export function formatPayDate(value = "") {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const raw = String(value).trim();
  const match = raw.match(/(\d{4})[.\-/ ](\d{1,2})[.\-/ ](\d{1,2})/);
  if (match) {
    return `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(
      match[3]
    ).padStart(2, "0")}`;
  }

  return raw;
}
