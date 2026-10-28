// src/server/branches.ts
import { asc, eq } from "drizzle-orm";
import { db as database } from "~/server/db";
import { branches } from "~/server/db/schema";
import type { OpeningHours } from "~/lib/opening-hours";
import type { DeliveryAppLinks } from "~/lib/schemas";

/*
 * A restaurant's location, contact and hours live on its branches
 * (schema.ts). Until restaurants can have several, everything reads and
 * writes the main branch: the first by order.
 */

export interface BranchLocation {
  address: string | null;
  city: string | null;
  country: string | null;
  phoneNumber: string | null;
  mapUrl: string | null;
  deliveryApps: unknown;
  timeZone: string | null;
  openingHours: OpeningHours | null;
}

export const LOCATION_COLUMNS = {
  address: true,
  city: true,
  country: true,
  phoneNumber: true,
  mapUrl: true,
  deliveryApps: true,
  timeZone: true,
  openingHours: true,
} satisfies Record<keyof BranchLocation, true>;

export const EMPTY_LOCATION: BranchLocation = {
  address: null,
  city: null,
  country: null,
  phoneNumber: null,
  mapUrl: null,
  deliveryApps: null,
  timeZone: null,
  openingHours: null,
};

const MAIN_FIRST = [asc(branches.order), asc(branches.createdAt)];

/** For a restaurants query's `with`: the main branch's location. */
export const MAIN_BRANCH = {
  branches: { columns: LOCATION_COLUMNS, orderBy: MAIN_FIRST, limit: 1 },
};

/** The restaurant row with its main branch's location on it. */
export function withMainBranch<T extends { branches: Partial<BranchLocation>[] }>(
  row: T,
): Omit<T, "branches"> & BranchLocation {
  const { branches: found, ...restaurant } = row;
  return { ...restaurant, ...EMPTY_LOCATION, ...found[0] };
}

type Db = typeof database;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Saves location fields on the restaurant's main branch, making the branch
 * first if the restaurant has none.
 */
export async function saveMainBranch(
  tx: Db | Tx,
  restaurantId: string,
  location: Partial<BranchLocation>,
) {
  const main = await tx.query.branches.findFirst({
    where: eq(branches.restaurantId, restaurantId),
    orderBy: MAIN_FIRST,
    columns: { id: true },
  });
  if (main) {
    await tx
      .update(branches)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(branches.id, main.id));
  } else {
    await tx.insert(branches).values({ ...location, restaurantId, slug: "main" });
  }
}

/** A branch as the Branches settings card edits it. */
export interface BranchDetails extends BranchLocation {
  id: string;
  name: string | null;
  slug: string;
  deliveryApps: DeliveryAppLinks | null;
}

/** Every branch of a restaurant, main branch first. */
export async function getBranchesForEdit(restaurantId: string): Promise<BranchDetails[]> {
  const rows = await database.query.branches.findMany({
    where: eq(branches.restaurantId, restaurantId),
    orderBy: MAIN_FIRST,
    columns: { id: true, name: true, slug: true, ...LOCATION_COLUMNS },
  });
  return rows.map((row) => ({ ...row, deliveryApps: row.deliveryApps as DeliveryAppLinks | null }));
}

/**
 * The branches guests see: the first `maxBranches` (the restaurant's plan
 * limit, null = all). Those beyond it are kept for when the plan allows
 * them again.
 */
export const visibleBranches = <T>(all: T[], maxBranches: number | null) =>
  maxBranches === null ? all : all.slice(0, Math.max(1, maxBranches));
