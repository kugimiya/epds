import { create_db_connection } from "../services/create_db_connection";
import { create_pissychan_service } from "../services/create_pissychan_service";
import { logger } from "../utils/logger";
import { get_full_threads } from "./get_full_threads";
import { process_boards } from "./process_boards";
import { process_posts } from "./process_posts";

export const create_update_tick = async (base_url: string, database_url: string) => {
  const pissychan_service = create_pissychan_service({ base_url });
  const db = await create_db_connection(database_url);

  const tick = async () => {
    logger.info("Get all data...");
    const { full_threads, boards } = await get_full_threads(pissychan_service);

    logger.info("Update database (boards)...");
    await process_boards(boards, db);

    logger.info("Update database (posts)...");
    await process_posts(full_threads, db);
  };

  return { tick };
};
