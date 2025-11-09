export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  registrationDate?: Date;
  verificationCode?: string;
  verificationExpires?: Date;
  emailVerified?: number;
  firstLogin?: number;
  groupInviteId?: number;
  groupId?: number;
  languageId?: number;
}

export interface IUserGroups {
  id?: number;
  active?: number;
  groupImagePath?: string;
  relationshipStartDate?: Date;
  createdAt?: Date;
}

export interface IGroupInviteStatus {
  id?: number;
  status: string;
}

export interface IGroupInvite {
  id?: number;
  code: string;
  creator_user_id: number;
  status_id: number;
  expiration: Date;
}

export interface ITripStatus {
  id?: number;
  status: string;
}

export interface ITrips {
  id?: number;
  group_id: number;
  destination: string;
  start_date: Date;
  end_date: Date;
  budget: number;
  description?: string;
  status_id: number;
  created_by: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

// Interface for the current trips implementation
export interface ITrip {
  id?: number;
  city: string;
  start_date: Date | string;
  end_date: Date | string;
  description?: string;
  status: string;
  estimated_budget?: number;
  icon?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ITripWithPhotos extends ITrip {
  photos: string[];
}

export interface ITripPhoto {
  id?: number;
  trip_id: number;
  photo_url: string;
  created_at?: Date;
}

export interface ITripCreateRequest {
  city: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: string;
  budget?: number;
  estimated?: string;
  icon?: string;
}

export interface ITripUpdateRequest extends Partial<ITripCreateRequest> {}

export interface ISuggestions {
  id?: number;
  group_id: number;
  suggestion_name: string;
  interest: boolean;
}

export interface IActivities {
  id?: number;
  group_id: number;
  trip_id?: number;
  date_id?: number;
  event_name?: string;
  date: Date;
  created_by: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

export interface IDates {
  id?: number;
  group_id: number;
  date: Date;
  location?: string;
  description?: string;
  status_id: number;
  created_by?: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

export interface IDateCreateRequest {
  groupId: number;
  date: Date | string;
  location?: string;
  description?: string;
  statusId: number;
  createdBy?: number;
}

export interface IDateUpdateRequest {
  date?: Date | string;
  location?: string;
  description?: string;
  statusId?: number;
  modifiedBy?: number;
}

export interface IMovies {
  id?: number;
  title: string;
  synopsis?: string;
  api_id: string;
  poster_path?: string;
  created_at?: Date;
}

export interface IMovieLists {
  id?: number;
  group_id: number;
  name: string;
  created_at?: Date;
}

export interface IMovieListItems {
  id?: number;
  movie_id: number;
  list_id: number;
  created_by: number;
  created_at?: Date;
}

export interface IFinanceType {
  id?: number;
  type: string;
}

export interface IFinances {
  id?: number;
  group_id: number;
  description: string;
  amount: number;
  type_id: number;
  instalments?: number;
  transaction_date: Date | string;
  created_by: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

export interface IGameStatus {
  id?: number;
  status: string;
}

export interface IGames {
  id?: number;
  group_id: number;
  name: string;
  platform: string;
  status_id: number;
  link?: string;
  comment?: string;
  created_by: number;
  modified_by?: number;
  created_at?: Date;
  modified_at?: Date;
}

export interface IMoods {
  id?: number;
  name: string;
}

export interface IMoodCalendar {
  id?: number;
  user_id: number;
  mood_id: number;
  note?: string;
  share: boolean;
  registration_date?: Date;
}

export interface IStandardResponse {
  message: string;
  code?: string;
  error?: any;
}

export interface ISessionUser {
  id: number;
  email: string;
  group_id?: number;
}

export type CreateUser = Omit<IUser, "id" | "registrationDate">;
export type UpdateUser = Partial<
  Pick<
    IUser,
    | "name"
    | "email"
    | "password"
    | "groupId"
    | "verificationCode"
    | "verificationExpires"
    | "emailVerified"
    | "languageId"
  >
>;

export type CreateGroupInvite = Omit<IGroupInvite, "id">;
export type UpdateGroupInvite = Partial<Pick<IGroupInvite, "status_id">>;

export type CreateUserGroup = Omit<IUserGroups, "id" | "createdAt">;
export type UpdateUserGroup = Partial<
  Pick<IUserGroups, "active" | "groupImagePath" | "relationshipStartDate">
>;

export interface IVerificationCodeData {
  verificationCode: string;
  expiresAt: Date;
}
