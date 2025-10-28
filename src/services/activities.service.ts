import activitiesRepository from "../repositories/activities.repository";
import { IActivities } from "../types/database";

export class ActivitiesService {
  async createActivity(
    activityData: Omit<IActivities, "id" | "created_at" | "modified_at">
  ): Promise<IActivities> {
    return await activitiesRepository.create(activityData);
  }

  async getActivityById(id: number): Promise<IActivities | null> {
    const result = await activitiesRepository.getById(id);
    return result ?? null;
  }

  async getAllActivities(): Promise<IActivities[]> {
    // ✅ Novo método para retornar todas as atividades
    return await activitiesRepository.getAll();
  }

  async getActivitiesByGroupId(groupId: number): Promise<IActivities[]> {
    return await activitiesRepository.getAllByGroupId(groupId);
  }

  async getActivitiesByTripId(tripId: number): Promise<IActivities[]> {
    return await activitiesRepository.getAllByTripId(tripId);
  }

  async getActivitiesByDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Promise<IActivities[]> {
    const allActivities = await activitiesRepository.getAllByGroupId(groupId);
    return allActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  async updateActivity(
    id: number,
    data: Partial<IActivities>
  ): Promise<IActivities | null> {
    await activitiesRepository.update(id, data);
    return await this.getActivityById(id);
  }

  async deleteActivity(id: number): Promise<boolean> {
    try {
      await activitiesRepository.deleteById(id);
      return true;
    } catch {
      return false;
    }
  }

  async getActivitiesByGroupAndDateRange(
    groupId: number,
    startDate: Date,
    endDate: Date
  ): Promise<IActivities[]> {
    return await this.getActivitiesByDateRange(groupId, startDate, endDate);
  }

  async getUpcomingActivities(groupId: number): Promise<IActivities[]> {
    // ✅ Alterado para pegar todos os eventos futuros (sem limite de dias)
    const now = new Date();
    const allActivities = await activitiesRepository.getAllByGroupId(groupId);

    return allActivities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activityDate >= now;
    });
  }
}
