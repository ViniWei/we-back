import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  date,
  float,
  tinyint,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ===== LOOKUP TABLES =====

export const languages = mysqlTable("language", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 5 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  nativeName: varchar("native_name", { length: 50 }).notNull(),
  flagEmoji: varchar("flag_emoji", { length: 10 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const groupInviteStatuses = mysqlTable("group_invite_status", {
  id: int("id").primaryKey().autoincrement(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const tripStatuses = mysqlTable("trip_status", {
  id: int("id").primaryKey().autoincrement(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const financeTypes = mysqlTable("finance_type", {
  id: int("id").primaryKey().autoincrement(),
  type: varchar("type", { length: 50 }).notNull(),
});

export const gameStatuses = mysqlTable("game_status", {
  id: int("id").primaryKey().autoincrement(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const dateStatuses = mysqlTable("date_status", {
  id: int("id").primaryKey().autoincrement(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const moods = mysqlTable("moods", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
});

// ===== CORE TABLES =====

export const userGroups = mysqlTable("user_groups", {
  id: int("id").primaryKey().autoincrement(),
  active: tinyint("active").default(1),
  groupImagePath: varchar("group_image_path", { length: 500 }),
  relationshipStartDate: datetime("relationship_start_date"),
  createdAt: date("created_at"),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  registrationDate: datetime("registration_date"),
  verificationCode: varchar("verification_code", { length: 100 }),
  verificationExpires: datetime("verification_expires"),
  emailVerified: tinyint("email_verified").default(0),
  firstLogin: tinyint("first_login").default(1),
  groupInviteId: int("group_invite_id"),
  groupId: int("group_id"),
  languageId: int("language_id"),
});

export const groupInvites = mysqlTable("group_invite", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  creatorUserId: int("creator_user_id"),
  statusId: int("status_id"),
  expiration: datetime("expiration"),
  createdAt: datetime("created_at").notNull(),
});

export const trips = mysqlTable("trips", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  destination: varchar("destination", { length: 255 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  budget: float("budget"),
  description: text("description"),
  statusId: int("status_id"),
  createdBy: int("created_by"),
  modifiedBy: int("modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const tripPhotos = mysqlTable("trip_photos", {
  id: int("id").primaryKey().autoincrement(),
  tripId: int("trip_id").notNull(),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suggestions = mysqlTable("suggestions", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  suggestionName: varchar("suggestion_name", { length: 255 }),
  interest: tinyint("interest").default(0),
});

export const activities = mysqlTable("activities", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  tripId: int("trip_id"),
  dateId: int("date_id"),
  eventName: varchar("event_name", { length: 255 }),
  date: datetime("date").notNull(),
  createdBy: int("created_by"),
  modifiedBy: int("modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const dates = mysqlTable("dates", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id").notNull(),
  date: datetime("date").notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  statusId: int("status_id").notNull(),
  createdBy: int("created_by"),
  modifiedBy: int("modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const finances = mysqlTable("finances", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  description: varchar("description", { length: 255 }),
  amount: float("amount"),
  typeId: int("type_id"),
  instalments: int("instalments").default(1),
  transactionDate: date("transaction_date").notNull(),
  createdBy: int("created_by"),
  modifiedBy: int("modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const games = mysqlTable("games", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  name: varchar("name", { length: 255 }),
  platform: varchar("platform", { length: 50 }),
  statusId: int("status_id"),
  link: varchar("link", { length: 255 }),
  comment: text("comment"),
  createdBy: int("created_by"),
  modifiedBy: int("modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const moodCalendar = mysqlTable("mood_calendar", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  moodId: int("mood_id"),
  note: text("note"),
  share: tinyint("share").default(0),
  registrationDate: datetime("registration_date"),
});

export const movies = mysqlTable("movies", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }),
  synopsis: text("synopsis"),
  apiId: varchar("api_id", { length: 100 }),
  posterPath: varchar("poster_path", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const movieLists = mysqlTable("movie_lists", {
  id: int("id").primaryKey().autoincrement(),
  groupId: int("group_id"),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const movieListItems = mysqlTable("movie_list_items", {
  id: int("id").primaryKey().autoincrement(),
  movieId: int("movie_id"),
  listId: int("list_id"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ one, many }) => ({
  group: one(userGroups, {
    fields: [users.groupId],
    references: [userGroups.id],
  }),
  groupInvite: one(groupInvites, {
    fields: [users.groupInviteId],
    references: [groupInvites.id],
  }),
  language: one(languages, {
    fields: [users.languageId],
    references: [languages.id],
  }),
  createdInvites: many(groupInvites),
  createdTrips: many(trips),
  createdActivities: many(activities),
  createdDates: many(dates),
  createdFinances: many(finances),
  createdGames: many(games),
  createdMovieListItems: many(movieListItems),
  moodEntries: many(moodCalendar),
}));

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  users: many(users),
  trips: many(trips),
  suggestions: many(suggestions),
  activities: many(activities),
  dates: many(dates),
  finances: many(finances),
  games: many(games),
  movieLists: many(movieLists),
}));

export const groupInvitesRelations = relations(
  groupInvites,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [groupInvites.creatorUserId],
      references: [users.id],
    }),
    status: one(groupInviteStatuses, {
      fields: [groupInvites.statusId],
      references: [groupInviteStatuses.id],
    }),
    invitedUsers: many(users),
  })
);

export const tripsRelations = relations(trips, ({ one, many }) => ({
  group: one(userGroups, {
    fields: [trips.groupId],
    references: [userGroups.id],
  }),
  status: one(tripStatuses, {
    fields: [trips.statusId],
    references: [tripStatuses.id],
  }),
  creator: one(users, {
    fields: [trips.createdBy],
    references: [users.id],
    relationName: "tripCreator",
  }),
  modifier: one(users, {
    fields: [trips.modifiedBy],
    references: [users.id],
    relationName: "tripModifier",
  }),
  activities: many(activities),
  photos: many(tripPhotos),
}));

export const tripPhotosRelations = relations(tripPhotos, ({ one }) => ({
  trip: one(trips, {
    fields: [tripPhotos.tripId],
    references: [trips.id],
  }),
}));

export const suggestionsRelations = relations(suggestions, ({ one, many }) => ({
  group: one(userGroups, {
    fields: [suggestions.groupId],
    references: [userGroups.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  group: one(userGroups, {
    fields: [activities.groupId],
    references: [userGroups.id],
  }),
  trip: one(trips, {
    fields: [activities.tripId],
    references: [trips.id],
  }),
  date: one(dates, {
    fields: [activities.dateId],
    references: [dates.id],
  }),
  creator: one(users, {
    fields: [activities.createdBy],
    references: [users.id],
    relationName: "activityCreator",
  }),
  modifier: one(users, {
    fields: [activities.modifiedBy],
    references: [users.id],
    relationName: "activityModifier",
  }),
}));

export const datesRelations = relations(dates, ({ one }) => ({
  group: one(userGroups, {
    fields: [dates.groupId],
    references: [userGroups.id],
  }),
  status: one(dateStatuses, {
    fields: [dates.statusId],
    references: [dateStatuses.id],
  }),
  creator: one(users, {
    fields: [dates.createdBy],
    references: [users.id],
    relationName: "dateCreator",
  }),
  modifier: one(users, {
    fields: [dates.modifiedBy],
    references: [users.id],
    relationName: "dateModifier",
  }),
}));

export const financesRelations = relations(finances, ({ one }) => ({
  group: one(userGroups, {
    fields: [finances.groupId],
    references: [userGroups.id],
  }),
  type: one(financeTypes, {
    fields: [finances.typeId],
    references: [financeTypes.id],
  }),
  creator: one(users, {
    fields: [finances.createdBy],
    references: [users.id],
    relationName: "financeCreator",
  }),
  modifier: one(users, {
    fields: [finances.modifiedBy],
    references: [users.id],
    relationName: "financeModifier",
  }),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  group: one(userGroups, {
    fields: [games.groupId],
    references: [userGroups.id],
  }),
  status: one(gameStatuses, {
    fields: [games.statusId],
    references: [gameStatuses.id],
  }),
  creator: one(users, {
    fields: [games.createdBy],
    references: [users.id],
    relationName: "gameCreator",
  }),
  modifier: one(users, {
    fields: [games.modifiedBy],
    references: [users.id],
    relationName: "gameModifier",
  }),
}));

export const moodCalendarRelations = relations(moodCalendar, ({ one }) => ({
  user: one(users, {
    fields: [moodCalendar.userId],
    references: [users.id],
  }),
  mood: one(moods, {
    fields: [moodCalendar.moodId],
    references: [moods.id],
  }),
}));

export const movieListsRelations = relations(movieLists, ({ one, many }) => ({
  group: one(userGroups, {
    fields: [movieLists.groupId],
    references: [userGroups.id],
  }),
  items: many(movieListItems),
}));

export const movieListItemsRelations = relations(movieListItems, ({ one }) => ({
  movie: one(movies, {
    fields: [movieListItems.movieId],
    references: [movies.id],
  }),
  list: one(movieLists, {
    fields: [movieListItems.listId],
    references: [movieLists.id],
  }),
  creator: one(users, {
    fields: [movieListItems.createdBy],
    references: [users.id],
    relationName: "movieListItemCreator",
  }),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  listItems: many(movieListItems),
}));

export const languagesRelations = relations(languages, ({ many }) => ({
  users: many(users),
}));

export const groupInviteStatusesRelations = relations(
  groupInviteStatuses,
  ({ many }) => ({
    invites: many(groupInvites),
  })
);

export const tripStatusesRelations = relations(tripStatuses, ({ many }) => ({
  trips: many(trips),
}));

export const financeTypesRelations = relations(financeTypes, ({ many }) => ({
  finances: many(finances),
}));

export const gameStatusesRelations = relations(gameStatuses, ({ many }) => ({
  games: many(games),
}));

export const moodsRelations = relations(moods, ({ many }) => ({
  moodEntries: many(moodCalendar),
}));

export const dateStatusesRelations = relations(dateStatuses, ({ many }) => ({
  dates: many(dates),
}));
