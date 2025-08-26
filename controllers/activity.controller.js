import activityService from "../services/activity.service.js";

export async function getAll(req, res) {
  try {
    const activities = await activityService.getAll();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params;
    const activity = await activityService.getById(id);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  try {
    const newActivity = await activityService.create(req.body);
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const updatedActivity = await activityService.update(id, req.body);

    if (!updatedActivity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(updatedActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteById(req, res) {
  try {
    const { id } = req.params;
    const deleted = await activityService.deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
