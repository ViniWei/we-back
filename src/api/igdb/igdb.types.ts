export interface IgdbPlatform {
  id?: number;
  name?: string;
  slug?: string;
}

export interface IgdbCover {
  id?: number;
  image_id?: string;
  url?: string;
}

export interface IgdbGameRaw {
  id: number;
  name: string;
  platforms?: IgdbPlatform[];
  cover?: IgdbCover;
}

export interface Game {
  id: number;
  name: string;
  platforms: string[];
  cover_url: string | null;
}
