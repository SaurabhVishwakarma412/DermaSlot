const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

const getAppointmentSlots = () => {
  const slots = [];

  for (const [start, end] of [[9 * 60, 13 * 60], [14 * 60, 18 * 60]]) {
    for (let minutes = start; minutes < end; minutes += 15) {
      slots.push(`${formatTime(minutes)} - ${formatTime(minutes + 15)}`);
    }
  }

  return slots;
};

const parseTime = (time) => {
  const match = time.match(/^(\d{2}):(\d{2}) (AM|PM)$/);
  if (!match) return null;

  const [, hourText, minuteText, period] = match;
  const hour = Number(hourText) % 12 + (period === "PM" ? 12 : 0);
  return hour * 60 + Number(minuteText);
};

const getOccupiedAppointmentSlots = (bookedSlots) => {
  const bookedRanges = bookedSlots
    .filter((slot) => typeof slot === "string")
    .map((slot) => {
      const [startText, endText] = slot.split(" - ");
      const start = parseTime(startText || "");
      const end = parseTime(endText || "");
      return start !== null && end !== null && end > start ? [start, end] : null;
    })
    .filter(Boolean);

  return getAppointmentSlots().filter((slot) => {
    const [startText, endText] = slot.split(" - ");
    const start = parseTime(startText);
    const end = parseTime(endText);
    return bookedRanges.some(([bookedStart, bookedEnd]) => start < bookedEnd && end > bookedStart);
  });
};

module.exports = { getAppointmentSlots, getOccupiedAppointmentSlots };
