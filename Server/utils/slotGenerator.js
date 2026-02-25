const Holiday = require("../models/Holiday");

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

module.exports = async function generateSlots(
  weekStartDate,
  timeSlots,
  includeSaturday
) {
  const startDate = new Date(weekStartDate);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const holidays = await Holiday.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // Convert holiday dates to day-of-week indices
  // Monday=0 ... Saturday=5
  const holidayDayIndices = holidays.map((h) => {
    const d = new Date(h.date);
    const jsDay = d.getDay(); // 0=Sun,1=Mon,...6=Sat
    return jsDay === 0 ? -1 : jsDay - 1; // Mon=0,...Sat=5, Sun=-1
  });

  const slots = [];

  DAYS.forEach((day, dayIndex) => {
    if (!includeSaturday && day === "Saturday") return;

    if (holidayDayIndices.includes(dayIndex)) return;

    timeSlots.forEach((slot, slotIdx) => {
      if (slot.isLunch) return;

      // Saturday: only morning slots (first 3 non-lunch)
      if (day === "Saturday") {
        const nonLunchIndex = timeSlots
          .filter((s) => !s.isLunch)
          .findIndex(
            (s) => s.start === slot.start && s.end === slot.end
          );
        if (nonLunchIndex >= 3) return;
      }

      slots.push({
        day,
        slotIndex: slotIdx,
        startTime: slot.start,
        endTime: slot.end,
      });
    });
  });

  return slots;
};