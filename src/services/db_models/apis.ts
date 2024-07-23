import { Client } from "pg";
import { TableBoards, TablePosts } from "../../types/Tables";
import { parallel_executor } from "../../utils/parallel_executor";
import { DEFAULT_LIMIT, DEFAULT_THREAD_SIZE, FETCH_ENTITIES_MAX_PARALLEL_JOBS } from "../../utils/config";

export const db_model_apis = (client: Client) => {
  const apis = {
    boards: {
      get_all: async (moderated: boolean) => {
        const result = await client.query<TableBoards>({
          text: [
            "SELECT boards.* FROM boards",
            moderated ? "LEFT JOIN moderated ON moderated.board_id = boards.id" : "",
            moderated ? "WHERE moderated.board_id is NULL" : "",
          ].join('\n'),
        });

        return result.rows;
      },
      get_by_tag: async (moderated: boolean, tag: string) => {
        const result = await client.query<TableBoards>({
          text: [
            "SELECT boards.* FROM boards",
            moderated ? "LEFT JOIN moderated ON moderated.board_id = boards.id" : "",
            `WHERE tag=$1 ${moderated ? "and moderated.board_id is NULL" : ""}`,
            ].join('\n'),
          values: [tag]
        });

        return result.rows[0];
      }
    },
    threads: {
      get_by_board_tag: async (moderated: boolean, tag: string, offset = 0, limit = DEFAULT_LIMIT, thread_size = DEFAULT_THREAD_SIZE) => {
        const board = await apis.boards.get_by_tag(moderated, tag);
        const board_id = board.id;

        let result = await client.query<TablePosts>({
          text: [
            "SELECT posts.* FROM posts",
            moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
            `WHERE posts.board_id=$1 and posts.parent_id is NULL ${moderated ? 'and moderated.post_id is NULL' : ''}`,
            "ORDER BY posts.updated_at DESC",
            "LIMIT $2 OFFSET $3",
          ].join('\n'),
          values: [board_id, limit, offset],
        });

        type ResultAsEntries = [number, TablePosts[]];
        const result_with_replies = await parallel_executor<ResultAsEntries, TablePosts>(
          result.rows,
          FETCH_ENTITIES_MAX_PARALLEL_JOBS,
          thread => async () => {
            const sub_result = await client.query<TablePosts>({
              text: [
                "SELECT posts.* FROM posts",
                moderated ? "LEFT JOIN moderated ON moderated.post_id = posts.id" : "",
                `WHERE posts.parent_id=$1 ${moderated ? 'and moderated.post_id is NULL' : ''}`,
                "ORDER BY posts.updated_at DESC",
                "LIMIT $2 OFFSET 0",
              ].join('\n'),
              values: [thread.id, thread_size],
            });

            return [
              thread.id,
              sub_result.rows.reverse(),
            ] as ResultAsEntries;
          }
        );

        const result_normalized = Object.fromEntries(result_with_replies);
        const result_concatenated = result.rows.map((thread) => ({ ...thread, replies: result_normalized[thread.id] || [] }))

        return result_concatenated;
      },
    }
  };

  return apis;
}
