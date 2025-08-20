import { getCurrentDateTime } from "./tool/analysis/currentDateTool";

console.log("=== Testing Current Date Tool ===");
const result = getCurrentDateTime();

console.log("Full result:", result);
console.log("Date:", result.date);
console.log("Time:", result.time);
console.log("Timezone:", result.timezone);
console.log("ISO:", result.iso);
console.log("Year:", result.year);
console.log("Month:", result.month);
console.log("Day:", result.day);

// Verify the date is reasonable (not in the future)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();

console.log("\n=== Verification ===");
console.log("System date:", `${currentMonth}/${currentDay}/${currentYear}`);
console.log("Tool date:", `${result.month}/${result.day}/${result.year}`);

if (
  result.year === currentYear &&
  result.month === currentMonth &&
  result.day === currentDay
) {
  console.log("✅ Date is correct!");
} else {
  console.log("❌ Date is incorrect!");
}
