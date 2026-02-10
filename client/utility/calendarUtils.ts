import { Dimensions } from "react-native";
// --- CONSTANTS ---
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const NUM_COLUMNS = 7;
export const CONTAINER_PADDING = 40;
export const CELL_SIZE = (SCREEN_WIDTH - CONTAINER_PADDING) / NUM_COLUMNS;

// --- HELPER FUNCTIONS ---
// create grid for month
export function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: any[] = [];

  // empty cells
  for (let i = 0; i < startDay; i++) {
    cells.push({ key: `empty-${i}`, empty: true });
  }

  // add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      key: `day-${day}`,
      day,
      dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }

  return cells;
}

// get the Sunday at the start of the week
export function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}