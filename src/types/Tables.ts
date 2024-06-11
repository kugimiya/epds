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
