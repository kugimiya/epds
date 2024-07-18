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

const main = async () => {
  logger.info("Starting syncer...");

  const { start_listen } = await create_api_server(
    Number(process.env.API_LISTEN_PORT) || API_DEFAULT_LISTEN_PORT,
    process.env.API_LISTEN_HOST || API_DEFAULT_LISTEN_HOST,
    process.env.DATABASE_URL || ""
  );
  const { tick, update_all } = await create_update_tick(SCHEOBLE_API, process.env.DATABASE_URL || "");
  let current_tick = 0;

  if (!process.argv.includes('--no-sync')) {
    logger.info('Before first tick we should fetch all!');
    measure_time("fetch_all", "start");
    await update_all();
    logger.info(`Fetch ended with ${measure_time("fetch_all", "end")}ms`)
  } else {
    logger.info('--no-sync flag provided, skip fetch-all-stage')
  }

  start_listen();

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
};

main();
