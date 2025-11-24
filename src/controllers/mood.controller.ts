import { Request, Response } from "express";
import { db } from "../db";
import { moodCalendar, moods, users } from "../db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export const getAllMoods = async (req: Request, res: Response) => {
  try {
    const allMoods = await db.select().from(moods);
    return res.json(allMoods);
  } catch (error: any) {
    console.error("Error getting moods:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTodayMood = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [mood] = await db
      .select()
      .from(moodCalendar)
      .where(
        and(
          eq(moodCalendar.userId, userId),
          gte(moodCalendar.createdAt, today),
          lt(moodCalendar.createdAt, tomorrow)
        )
      )
      .limit(1);

    return res.json(mood || null);
  } catch (error: any) {
    console.error("Error getting today's mood:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createMood = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { moodId } = req.body;
    if (!moodId) {
      return res.status(400).json({ message: "Mood ID is required" });
    }

    const [newMood] = await db
      .insert(moodCalendar)
      .values({
        userId,
        moodId,
      })
      .$returningId();

    const [createdMood] = await db
      .select()
      .from(moodCalendar)
      .where(eq(moodCalendar.id, newMood.id));

    return res.status(201).json(createdMood);
  } catch (error: any) {
    console.error("Error creating mood:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMood = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const moodIdParam = parseInt(req.params.id);
    const { moodId } = req.body;

    if (!moodId) {
      return res.status(400).json({ message: "Mood ID is required" });
    }

    const [existingMood] = await db
      .select()
      .from(moodCalendar)
      .where(
        and(eq(moodCalendar.id, moodIdParam), eq(moodCalendar.userId, userId))
      );

    if (!existingMood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    await db
      .update(moodCalendar)
      .set({
        moodId,
        modifiedAt: new Date(),
      })
      .where(eq(moodCalendar.id, moodIdParam));

    const [updatedMood] = await db
      .select()
      .from(moodCalendar)
      .where(eq(moodCalendar.id, moodIdParam));

    return res.json(updatedMood);
  } catch (error: any) {
    console.error("Error updating mood:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMoodsByMonth = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid year or month" });
    }

    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!currentUser || !currentUser.groupId) {
      return res.status(404).json({ message: "User has no group" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(yearNum, monthNum, 1);
    endDate.setHours(0, 0, 0, 0);

    const groupMoods = await db
      .select({
        id: moodCalendar.id,
        userId: moodCalendar.userId,
        moodId: moodCalendar.moodId,
        moodName: moods.name,
        createdAt: moodCalendar.createdAt,
        userName: users.name,
      })
      .from(moodCalendar)
      .innerJoin(users, eq(moodCalendar.userId, users.id))
      .innerJoin(moods, eq(moodCalendar.moodId, moods.id))
      .where(
        and(
          eq(users.groupId, currentUser.groupId),
          gte(moodCalendar.createdAt, startDate),
          lt(moodCalendar.createdAt, endDate)
        )
      );

    return res.json(groupMoods);
  } catch (error: any) {
    console.error("Error getting group moods:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
