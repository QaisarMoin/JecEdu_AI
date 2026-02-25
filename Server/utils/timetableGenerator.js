module.exports = async function generateTimetable({
  subjects,
  slots,
  timetableWeekId,
  department,
  semester,
  existingEntries = [],
}) {
  const entries = [];
  const facultyBusy = {};
  const semesterBusy = {};

  // Mark existing entries as busy (for cross-semester conflict check)
  existingEntries.forEach((e) => {
    const fKey = `${e.faculty}_${e.day}_${e.slotIndex}`;
    facultyBusy[fKey] = true;
  });

  // Shuffle subjects for randomness
  const shuffled = [...subjects].sort(() => Math.random() - 0.5);

  for (let subjectObj of shuffled) {
    const subject = subjectObj.subject;
    let needed = subjectObj.lecturesNeeded;
    let attempts = 0;
    const maxAttempts = slots.length * 10;

    // Shuffle slots for this subject
    const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);
    let slotPointer = 0;

    while (needed > 0 && attempts < maxAttempts) {
      const slot = shuffledSlots[slotPointer % shuffledSlots.length];
      slotPointer++;
      attempts++;

      const facultyId = subject.faculty._id
        ? subject.faculty._id.toString()
        : subject.faculty.toString();

      const fKey = `${facultyId}_${slot.day}_${slot.slotIndex}`;
      const sKey = `${semester}_${department}_${slot.day}_${slot.slotIndex}`;

      // Check: no double booking for same day for same subject
      const sameDayCount = entries.filter(
        (e) =>
          e.subject.toString() === subject._id.toString() &&
          e.day === slot.day
      ).length;

      // Limit max 2 lectures of same subject per day
      if (sameDayCount >= 2) continue;

      if (!facultyBusy[fKey] && !semesterBusy[sKey]) {
        facultyBusy[fKey] = true;
        semesterBusy[sKey] = true;

        entries.push({
          timetableWeek: timetableWeekId,
          subject: subject._id,
          faculty: facultyId,
          department,
          semester,
          day: slot.day,
          slotIndex: slot.slotIndex,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isManual: false,
        });

        needed--;
      }
    }

    if (needed > 0) {
      console.warn(
        `Could not schedule ${needed} lectures for ${subject.code}`
      );
    }
  }

  return entries;
};