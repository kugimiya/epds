import { create_db_connection } from "../services/create_db_connection";
import { ResponsePost } from "../types/ResponseThreadsList";
import { logger } from "../utils/logger";
import { measure_time } from "../utils/measure_time";

export const process_posts = async (posts: ResponsePost[], db: Awaited<ReturnType<typeof create_db_connection>>) => {
  measure_time("db check posts", "start");
  let created = 0;
  let updated = 0;
  let checked = 0;

  const process = async (post: ResponsePost) => {
    checked += 1;
    if (await db.posts.is_exist(post)) {
      if (await db.posts.is_need_update(post)) {
        await db.posts.update(post);
        updated += 1;
      }
    } else {
      await db.posts.insert(post);
      created += 1;
    }
  };

  for (let post of posts) {
    await process(post);

    if (post.replies.length) {
      for (let reply of post.replies) {
        await process(reply);
      }
    }
  }

  const post_check_time_taken = measure_time("db check posts", "end");

  logger.debug(
    `"posts" table updated, checked=${checked}, updated=${updated}, created=${created}, time=${post_check_time_taken}ms`,
  );
};
