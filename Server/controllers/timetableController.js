const TimetableWeek = require("../models/TimetableWeek");
const TimetableEntry = require("../models/TimetableEntry");
const Subject = require("../models/Subject");
const generateSlots = require("../utils/slotGenerator");
const generateTimetable = require("../utils/timetableGenerator");

// POST /api/timetable/generate
exports.generate = async (req, res) => {
  try {
    const {
      semester,
      department,
      weekStartDate,
      timeSlots,
      includeSaturday,
      subjects,
    } = req.body;

    // Validate
    if (
      !semester ||
      !department ||
      !weekStartDate ||
      !timeSlots ||
      !subjects ||
      subjects.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    // Check if timetable already exists for this week/dept/sem
    const existing = await TimetableWeek.findOne({
      department,
      semester,
      weekStartDate: new Date(weekStartDate),
    });

    if (existing) {
      return res.status(400).json({
        message:
          "Timetable already exists for this week. Delete it first or edit it.",
        weekId: existing._id,
      });
    }

    const startDate = new Date(weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (includeSaturday ? 5 : 4));

    const week = await TimetableWeek.create({
      semester,
      department,
      weekStartDate: startDate,
      weekEndDate: endDate,
      timeSlots,
      includeSaturday,
      createdBy: req.user.id,
    });

    // Fetch subject documents
    const subjectDocs = await Subject.find({
      _id: { $in: subjects.map((s) => s.subjectId) },
    }).populate("faculty", "name email");

    const subjectMap = {};
    subjectDocs.forEach((s) => (subjectMap[s._id.toString()] = s));

    const structuredSubjects = subjects.map((s) => ({
      subject: subjectMap[s.subjectId],
      lecturesNeeded: s.lecturesNeeded,
    }));

    // Get slots
    const slots = await generateSlots(
      startDate,
      timeSlots,
      includeSaturday
    );

    // Fetch ALL existing entries for this week across all semesters
    // to prevent faculty conflicts
    const allWeeksThisRange = await TimetableWeek.find({
      department,
      weekStartDate: startDate,
      _id: { $ne: week._id },
    });

    const allWeekIds = allWeeksThisRange.map((w) => w._id);

    const existingEntries = await TimetableEntry.find({
      timetableWeek: { $in: allWeekIds },
    });

    // Generate
    const entries = await generateTimetable({
      subjects: structuredSubjects,
      slots,
      timetableWeekId: week._id,
      department,
      semester,
      existingEntries,
    });

    if (entries.length === 0) {
      await TimetableWeek.findByIdAndDelete(week._id);
      return res.status(400).json({
        message: "Could not generate any entries. Check conflicts.",
      });
    }

    await TimetableEntry.insertMany(entries);

    res.json({
      message: "Timetable generated successfully",
      weekId: week._id,
      entriesCount: entries.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/timetable/week/:weekId
exports.getWeekEntries = async (req, res) => {
  try {
    const weekId = req.params.weekId;

    const week = await TimetableWeek.findById(weekId);
    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    const entries = await TimetableEntry.find({
      timetableWeek: weekId,
    })
      .populate("subject", "name code")
      .populate("faculty", "name email");

    res.json({ week, entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/timetable/weeks?department=CSE&semester=3
exports.getWeeksList = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);

    const weeks = await TimetableWeek.find(filter)
      .sort({ weekStartDate: -1 })
      .populate("createdBy", "name");

    res.json(weeks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/timetable/finalize/:weekId
exports.finalizeWeek = async (req, res) => {
  try {
    const week = await TimetableWeek.findById(req.params.weekId);
    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    week.status = "finalized";
    await week.save();

    res.json({ message: "Timetable finalized successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/timetable/unfinalize/:weekId
exports.unfinalizeWeek = async (req, res) => {
  try {
    const week = await TimetableWeek.findById(req.params.weekId);
    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    week.status = "draft";
    await week.save();

    res.json({ message: "Timetable unfinalized" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/timetable/entry/:entryId
exports.updateEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { subjectId, facultyId, room } = req.body;

    const entry = await TimetableEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const week = await TimetableWeek.findById(entry.timetableWeek);

    // Check faculty conflict
    if (facultyId) {
      const conflict = await TimetableEntry.findOne({
        _id: { $ne: entryId },
        faculty: facultyId,
        day: entry.day,
        slotIndex: entry.slotIndex,
        timetableWeek: {
          $in: await TimetableWeek.find({
            weekStartDate: week.weekStartDate,
          }).distinct("_id"),
        },
      });

      if (conflict) {
        return res.status(400).json({
          message: "Faculty has a conflict at this time slot",
        });
      }
    }

    if (subjectId) entry.subject = subjectId;
    if (facultyId) entry.faculty = facultyId;
    if (room !== undefined) entry.room = room;
    entry.isManual = true;

    await entry.save();

    const updated = await TimetableEntry.findById(entryId)
      .populate("subject", "name code")
      .populate("faculty", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/timetable/entry/:entryId
exports.deleteEntry = async (req, res) => {
  try {
    await TimetableEntry.findByIdAndDelete(req.params.entryId);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/timetable/entry
exports.addEntry = async (req, res) => {
  try {
    const {
      weekId,
      subjectId,
      facultyId,
      day,
      slotIndex,
      room,
    } = req.body;

    const week = await TimetableWeek.findById(weekId);
    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    // Check slot conflict for same semester
    const slotConflict = await TimetableEntry.findOne({
      timetableWeek: weekId,
      day,
      slotIndex,
    });

    if (slotConflict) {
      return res.status(400).json({
        message: "This slot is already occupied",
      });
    }

    // Check faculty conflict across all weeks with same start date
    const sameWeeks = await TimetableWeek.find({
      weekStartDate: week.weekStartDate,
    }).distinct("_id");

    const facultyConflict = await TimetableEntry.findOne({
      timetableWeek: { $in: sameWeeks },
      faculty: facultyId,
      day,
      slotIndex,
    });

    if (facultyConflict) {
      return res.status(400).json({
        message: "Faculty has a conflict at this time slot",
      });
    }

    const timeSlot = week.timeSlots[slotIndex];

    const entry = await TimetableEntry.create({
      timetableWeek: weekId,
      subject: subjectId,
      faculty: facultyId,
      department: week.department,
      semester: week.semester,
      day,
      slotIndex,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      room: room || "",
      isManual: true,
    });

    const populated = await TimetableEntry.findById(entry._id)
      .populate("subject", "name code")
      .populate("faculty", "name email");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/timetable/clone/:weekId
exports.cloneWeek = async (req, res) => {
  try {
    const { newWeekStartDate } = req.body;
    const sourceWeek = await TimetableWeek.findById(req.params.weekId);

    if (!sourceWeek) {
      return res.status(404).json({ message: "Source week not found" });
    }

    const startDate = new Date(newWeekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(
      endDate.getDate() + (sourceWeek.includeSaturday ? 5 : 4)
    );

    // Check duplicate
    const exists = await TimetableWeek.findOne({
      department: sourceWeek.department,
      semester: sourceWeek.semester,
      weekStartDate: startDate,
    });

    if (exists) {
      return res.status(400).json({
        message: "Timetable already exists for target week",
      });
    }

    const newWeek = await TimetableWeek.create({
      department: sourceWeek.department,
      semester: sourceWeek.semester,
      weekStartDate: startDate,
      weekEndDate: endDate,
      timeSlots: sourceWeek.timeSlots,
      includeSaturday: sourceWeek.includeSaturday,
      status: "draft",
      clonedFrom: sourceWeek._id,
      createdBy: req.user.id,
    });

    const sourceEntries = await TimetableEntry.find({
      timetableWeek: sourceWeek._id,
    });

    const newEntries = sourceEntries.map((e) => ({
      timetableWeek: newWeek._id,
      subject: e.subject,
      faculty: e.faculty,
      department: e.department,
      semester: e.semester,
      day: e.day,
      slotIndex: e.slotIndex,
      startTime: e.startTime,
      endTime: e.endTime,
      room: e.room,
      isManual: e.isManual,
    }));

    await TimetableEntry.insertMany(newEntries);

    res.json({
      message: "Timetable cloned successfully",
      weekId: newWeek._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/timetable/week/:weekId
exports.deleteWeek = async (req, res) => {
  try {
    await TimetableEntry.deleteMany({
      timetableWeek: req.params.weekId,
    });
    await TimetableWeek.findByIdAndDelete(req.params.weekId);

    res.json({ message: "Week and all entries deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/timetable/faculty/:facultyId
exports.getFacultyTimetable = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { weekStartDate } = req.query;

    const filter = { faculty: facultyId };

    if (weekStartDate) {
      const weeks = await TimetableWeek.find({
        weekStartDate: new Date(weekStartDate),
        status: "finalized",
      }).distinct("_id");

      filter.timetableWeek = { $in: weeks };
    } else {
      // Get latest finalized weeks
      const weeks = await TimetableWeek.find({
        status: "finalized",
      })
        .sort({ weekStartDate: -1 })
        .limit(10)
        .distinct("_id");

      filter.timetableWeek = { $in: weeks };
    }

    const entries = await TimetableEntry.find(filter)
      .populate("subject", "name code")
      .populate("faculty", "name email")
      .populate("timetableWeek", "weekStartDate semester department");

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/timetable/student
exports.getStudentTimetable = async (req, res) => {
  try {
    const { department, semester, weekStartDate } = req.query;

    if (!department || !semester) {
      return res
        .status(400)
        .json({ message: "Department and semester required" });
    }

    let weekFilter = {
      department,
      semester: parseInt(semester),
      status: "finalized",
    };

    if (weekStartDate) {
      weekFilter.weekStartDate = new Date(weekStartDate);
    }

    const weeks = await TimetableWeek.find(weekFilter).sort({
      weekStartDate: -1,
    });

    if (weeks.length === 0) {
      return res.json({ week: null, entries: [] });
    }

    const latestWeek = weeks[0];

    const entries = await TimetableEntry.find({
      timetableWeek: latestWeek._id,
    })
      .populate("subject", "name code")
      .populate("faculty", "name email");

    res.json({ week: latestWeek, entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/timetable/conflicts/:weekId
exports.checkConflicts = async (req, res) => {
  try {
    const week = await TimetableWeek.findById(req.params.weekId);
    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    const sameWeeks = await TimetableWeek.find({
      weekStartDate: week.weekStartDate,
    }).distinct("_id");

    const allEntries = await TimetableEntry.find({
      timetableWeek: { $in: sameWeeks },
    })
      .populate("subject", "name code")
      .populate("faculty", "name")
      .populate("timetableWeek", "semester department");

    const conflicts = [];

    for (let i = 0; i < allEntries.length; i++) {
      for (let j = i + 1; j < allEntries.length; j++) {
        const a = allEntries[i];
        const b = allEntries[j];

        if (
          a.faculty._id.toString() === b.faculty._id.toString() &&
          a.day === b.day &&
          a.slotIndex === b.slotIndex
        ) {
          conflicts.push({
            faculty: a.faculty.name,
            day: a.day,
            slotIndex: a.slotIndex,
            entry1: {
              subject: a.subject.code,
              semester: a.timetableWeek.semester,
              department: a.timetableWeek.department,
            },
            entry2: {
              subject: b.subject.code,
              semester: b.timetableWeek.semester,
              department: b.timetableWeek.department,
            },
          });
        }
      }
    }

    res.json({ conflicts, count: conflicts.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};