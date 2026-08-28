import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * One document per calendar day.
 *
 * A document store fits this domain unusually well: a day is a bounded,
 * self-contained aggregate that is always read and written whole, and the
 * "every day starts fresh" rule means days never reference one another.
 */

const TaskEntrySchema = new Schema(
  {
    taskId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    value: { type: Number, default: 0 },
  },
  { _id: false },
);

const CoreSubjectSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    topics: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    value: { type: Number, default: 0 },
  },
  { _id: false },
);

const NotesSchema = new Schema(
  {
    wentWell: { type: String, default: "", maxlength: 4000 },
    needsImprovement: { type: String, default: "", maxlength: 4000 },
    tomorrowFocus: { type: String, default: "", maxlength: 4000 },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const DayLogSchema = new Schema(
  {
    /** Local calendar day, "YYYY-MM-DD". */
    date: { type: String, required: true, unique: true, index: true },
    tasks: { type: [TaskEntrySchema], default: [] },
    coreSubject: { type: CoreSubjectSchema, required: true },
    notes: { type: NotesSchema, default: () => ({}) },
    /** Denormalised so analytics and the calendar never recompute history. */
    score: { type: Number, default: 0, index: true },
    xpEarned: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "day_logs" },
);

export type DayLogDocument = InferSchemaType<typeof DayLogSchema>;

export const DayLogModel: Model<DayLogDocument> =
  (mongoose.models.DayLog as Model<DayLogDocument>) ??
  mongoose.model<DayLogDocument>("DayLog", DayLogSchema);
