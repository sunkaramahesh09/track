/**
 * Seeds ~10 weeks of plausible history so the dashboard, analytics and
 * calendar have something to show on a fresh install.
 *
 *   node scripts/seed.mjs           # seed 70 days
 *   node scripts/seed.mjs 120       # seed 120 days
 *   node scripts/seed.mjs --wipe    # clear all data instead
 */
import mongoose from "mongoose";
import { readFileSync } from "node:fs";

const envFile = ".env.local";
let uri = process.env.MONGODB_URI;
try {
  const match = readFileSync(envFile, "utf8").match(/^MONGODB_URI="?([^"\n]+)"?/m);
  if (match && !uri) uri = match[1];
} catch {
  /* .env.local is optional */
}
uri ??= "mongodb://127.0.0.1:27017/placement-os";

// `base` is the completion probability on a perfectly disciplined day; the
// per-day `mood` multiplier below is what creates the variation.
const TASKS = [
  { id: "dsa", weight: 25, xp: 30, target: 180, base: 0.93 },
  { id: "internship", weight: 15, xp: 20, target: 120, base: 0.95 },
  { id: "english", weight: 10, xp: 15, target: 60, base: 0.82 },
  { id: "sql", weight: 10, xp: 12, target: 2, base: 0.9 },
  { id: "workout", weight: 10, xp: 10, target: 45, base: 0.86 },
  { id: "resume", weight: 10, xp: 12, target: 60, base: 0.72 },
  { id: "interview", weight: 5, xp: 8, target: 30, base: 0.8 },
  { id: "reading", weight: 5, xp: 8, target: 30, base: 0.83 },
];

const CORE = {
  1: { key: "cn", label: "Computer Networks", topics: ["Computer Networks (CN)"] },
  2: { key: "oops", label: "OOPS", topics: ["Object Oriented Programming"] },
  3: { key: "os", label: "Operating Systems", topics: ["Operating Systems (OS)"] },
  4: { key: "dbms", label: "DBMS", topics: ["Database Management Systems"] },
  5: { key: "cn-oops-revision", label: "CN + OOPS Revision", topics: ["CN Revision", "OOPS Revision"] },
  6: { key: "os-dbms-revision", label: "OS + DBMS Revision", topics: ["OS Revision", "DBMS Revision"] },
  0: { key: "weekly-review", label: "Weekly Review", topics: ["Weekly Review"] },
};

const NOTES = [
  ["Two graph problems solved without hints.", "Started 90 minutes late.", "Sliding window, first thing."],
  ["Shipped the pagination fix at work.", "Skipped the workout again.", "Gym before opening the laptop."],
  ["Spoke English for the full hour on a call.", "SQL windows still shaky.", "Rank/dense_rank drills."],
  ["Finished the DBMS revision sheet.", "Phone ate the evening.", "Phone in another room after 8pm."],
];

const dayKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Deterministic PRNG so re-seeding produces the same history.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const schema = new mongoose.Schema({}, { strict: false, collection: "day_logs" });
const DayLog = mongoose.models.SeedDayLog ?? mongoose.model("SeedDayLog", schema);

async function main() {
  const wipe = process.argv.includes("--wipe");
  const days = Number(process.argv[2]) || 70;

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to ${uri}`);

  if (wipe) {
    const { deletedCount } = await DayLog.deleteMany({});
    await mongoose.connection.collection("profiles").deleteMany({});
    console.log(`Wiped ${deletedCount} day logs and the profile.`);
    await mongoose.disconnect();
    return;
  }

  const rand = mulberry32(20260828);
  const today = new Date();
  const docs = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = dayKey(date);
    const dow = date.getDay();

    // Discipline improves across the window, so the trend lines slope up and
    // the recent weeks carry a believable streak.
    const ramp = 0.66 + (1 - offset / days) * 0.34;
    const weekendPenalty = dow === 0 || dow === 6 ? 0.88 : 1;
    // Occasional off-day, so streaks break and every tier gets represented.
    const slump = rand() < 0.07 ? 0.4 : 1;
    const mood = ramp * weekendPenalty * slump;

    const tasks = TASKS.map((task) => {
      const completed = rand() < task.base * mood;
      const hour = 6 + Math.floor(rand() * 15);
      const minute = Math.floor(rand() * 60);
      const stamp = new Date(date);
      stamp.setHours(hour, minute, 0, 0);
      return {
        taskId: task.id,
        completed,
        completedAt: completed ? stamp : null,
        value: completed ? task.target : 0,
      };
    });

    const plan = CORE[dow];
    const coreCompleted = rand() < 0.88 * mood;
    const coreStamp = new Date(date);
    coreStamp.setHours(20, Math.floor(rand() * 60), 0, 0);

    const score =
      tasks.reduce(
        (sum, entry, i) => sum + (entry.completed ? TASKS[i].weight : 0),
        0,
      ) + (coreCompleted ? 10 : 0);

    const xpEarned =
      tasks.reduce(
        (sum, entry, i) => sum + (entry.completed ? TASKS[i].xp : 0),
        0,
      ) + (coreCompleted ? 15 : 0);

    const completedCount =
      tasks.filter((t) => t.completed).length + (coreCompleted ? 1 : 0);

    const note = NOTES[Math.floor(rand() * NOTES.length)];
    const hasNotes = rand() < 0.35;

    docs.push({
      updateOne: {
        filter: { date: key },
        update: {
          $set: {
            date: key,
            tasks,
            coreSubject: {
              key: plan.key,
              label: plan.label,
              topics: plan.topics,
              completed: coreCompleted,
              completedAt: coreCompleted ? coreStamp : null,
              value: coreCompleted ? 60 : 0,
            },
            notes: hasNotes
              ? {
                  wentWell: note[0],
                  needsImprovement: note[1],
                  tomorrowFocus: note[2],
                  updatedAt: date,
                }
              : {
                  wentWell: "",
                  needsImprovement: "",
                  tomorrowFocus: "",
                  updatedAt: null,
                },
            score,
            xpEarned,
            completedCount,
            createdAt: date,
            updatedAt: date,
          },
        },
        upsert: true,
      },
    });
  }

  const result = await DayLog.bulkWrite(docs);
  const total = await DayLog.countDocuments();
  console.log(
    `Seeded ${docs.length} days (${result.upsertedCount} new, ${result.modifiedCount} updated). Collection now holds ${total} days.`,
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
