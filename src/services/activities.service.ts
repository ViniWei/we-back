import { ActivitiesRepository } from "../repository/activities.repository";
import { IActivities } from "../types/database";

export class ActivitiesService {
  private activitiesRepository: ActivitiesRepository;

  constructor() {
    this.activitiesRepository = new ActivitiesRepository();
  }

  async createActivity(
    activityData: Omit<IActivities, "id" | "created_at" | "modified_at">
  ): Promise<IActivities> {
    const activity = await this.activitiesRepository.create(activityData);
    return activity;
  }

  async getActivityById(id: number): Promise<IActivities | null> {
    return (await this.activitiesRepository.getFirstByField("id", id)) ?? null;
  }

  async getActivitiesByGroupId(groupId: number): Promise<IActivities[]> {
    return await this.activitiesRepository.findByGroupId(groupId);
  }

  async getActivitiesByTripId(tripId: number): Promise<IActivities[]> {
    return await this.activitiesRepository.findByTripId(tripId);
  }

  async getActivitiesByDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Promise<IActivities[]> {
    return await this.activitiesRepository.findByDateRange(
      groupId,
      startDate,
      endDate
    );
  }

  async updateActivity(
    id: number,
    data: Partial<IActivities>
  ): Promise<IActivities | null> {
    return await this.activitiesRepository.update(id, data);
  }

  async deleteActivity(id: number): Promise<boolean> {
    try {
      await this.activitiesRepository.deleteAllByField("id", id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getActivitiesByGroupAndDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Promise<IActivities[]> {
    const allActivities = await this.activitiesRepository.findByGroupId(
      groupId
    );
    return allActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  async getUpcomingActivities(
    groupId: number,
    days: number = 7
  ): Promise<IActivities[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.getActivitiesByGroupAndDateRange(
      groupId,
      startDate,
      endDate
    );
  }
}
