import groupsRepository from "../repository/groups.repository.js";
import errorHelper from "../helper/error.helper.js";

export async function get(req, res) {
  const { id } = req.session.user;

  let group;
  try {
    group = await groupsRepository.get(id);
  } catch (error) {
    return res
      .status(500)
      .send(
        errorHelper.buildStandardResponse(
          "Error while fetching group.",
          "error-db-get-groups",
          error
        )
      );
  }

  if (!group) {
    return res
      .status(409)
      .send(
        errorHelper.buildStandardResponse(
          "Group not found.",
          "group-not-found",
          error
        )
      );
  }

  res.json(group);
}
