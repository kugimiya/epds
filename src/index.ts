import { create_api_server } from "./core/create_api_server";
import { create_update_tick } from "./core/create_update_tick";
import { API_DEFAULT_LISTEN_HOST, API_DEFAULT_LISTEN_PORT, DELAY_AFTER_UPDATE_TICK, SCHEOBLE_API } from "./utils/config";
import { logger } from "./utils/logger";
import { measure_time } from "./utils/measure_time";
import { sleep } from "./utils/sleep";

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required!');
  process.exit(1);
}

let NO_FULL_SYNC = process.argv.includes('--no-full-sync');
let NO_TICK_SYNC = process.argv.includes('--no-tick-sync');

if (NO_TICK_SYNC) {
  NO_FULL_SYNC = true;
}

const main = async () => {
  logger.info("Starting syncer and API...");

  // API part
  const { start_listen } = await create_api_server(
    Number(process.env.API_LISTEN_PORT) || API_DEFAULT_LISTEN_PORT,
    process.env.API_LISTEN_HOST || API_DEFAULT_LISTEN_HOST,
    process.env.DATABASE_URL || ""
  );
  start_listen();

  // SYNC part
  let current_tick = 0;
  const { tick, update_all } = await create_update_tick(SCHEOBLE_API, process.env.DATABASE_URL || "");

  if (!NO_FULL_SYNC) {
    logger.info('Before first tick we should fetch all!');
    measure_time("fetch_all", "start");
    await update_all();
    logger.info(`Fetch ended with ${measure_time("fetch_all", "end")}ms`);
  } else {
    logger.info('--no-tick-sync or --no-full-sync flag provided, skip full sync');
  }

  if (!NO_TICK_SYNC) {
    while (true) {
      logger.info(`Start tick #${current_tick}`);
      measure_time("upd_tick", "start");
      await tick();
      const time_taken = measure_time("upd_tick", "end");

      logger.info(`Update tick #${current_tick} completed with ${time_taken}ms`);
      logger.info(`Sleeping ${DELAY_AFTER_UPDATE_TICK}ms before next tick`);
      current_tick += 1;
      await sleep(DELAY_AFTER_UPDATE_TICK);
    }
  } else {
    logger.info('--no-sync or flag provided, skip sync tick');
  }
};

main();
