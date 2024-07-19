import { Client } from "pg";
import { TableBoards } from "../../types/Tables";

export const db_model_apis = (client: Client) => {
  const apis = {
    boards: {
      get_all_unmoderated: async () => {
        const result = await client.query<TableBoards>({
          text: "SELECT * FROM boards"
        });

        return result.rows;
      },
      get_by_tag_unmoderated: async (tag: string) => {
        const result = await client.query<TableBoards>({
          text: "SELECT * FROM boards WHERE tag=$1",
          values: [tag]
        });

        return result.rows[0];
      }
    },
    threads: {
      get_by_board_tag_unmoderated: async (tag: string, offset = 0, limit = 20) => {
        const board = await apis.boards.get_by_tag_unmoderated(tag);
        const board_id = board.id;

        const result = await client.query({
          text: [
            "SELECT * FROM posts",
            "WHERE board_id=$1 and parent_id is NULL",
            "ORDER BY updated_at DESC",
            "LIMIT $2 OFFSET $3",
          ].join('\n'),
          values: [board_id, limit, offset],
        });

        return result.rows;
      }
    }
  };

  return apis;
}
