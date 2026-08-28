import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Single-user mode: exactly one profile document, addressed by a fixed key.
 * Swapping to multi-user later means indexing on an ownerId instead — the
 * rest of the data model is already per-user shaped.
 */
export const SINGLE_USER_KEY = "solo";

const ProfileSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SINGLE_USER_KEY },
    displayName: { type: String, default: "Candidate" },
    /** Earliest day the user wants counted; used to bound analytics. */
    startedOn: { type: String, default: null },
    /** Cached unlock dates so a badge keeps the day it was first earned. */
    achievementUnlocks: {
      type: Map,
      of: String,
      default: () => new Map<string, string>(),
    },
  },
  { timestamps: true, collection: "profiles" },
);

export type ProfileDocument = InferSchemaType<typeof ProfileSchema>;

export const ProfileModel: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument>) ??
  mongoose.model<ProfileDocument>("Profile", ProfileSchema);
