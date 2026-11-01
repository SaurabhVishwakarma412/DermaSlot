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

export default getAppointmentSlots;
