export type TableBoards = {
  id: number;
  tag: string;
  name: string;
};

export type TablePosts = {
  id: number;
  board_id: number;
  poster: string;
  subject: string;
  message: string;
  timestamp: number;
  updated_at: number;
  parent_id: number;
  is_verify: boolean;
};

export type TableSettings = {
  id: number;
  name: string;
  value: string;
  type: SettingType;
};

// fixme: add TableEvents

export enum SettingType {
  Number = 0,
  String = 1,
  Boolean = 2,
  DateString = 3,
  DateTimestamp = 4
};
