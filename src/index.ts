import { create_update_tick } from "./core/create_update_tick";
import { DELAY_AFTER_UPDATE_TICK, SCHEOBLE_API } from "./utils/config";
import { logger } from "./utils/logger";
import { measure_time } from "./utils/measure_time";
import { sleep } from "./utils/sleep";

const main = async () => {
  logger.info("Starting syncer...");

  const { tick } = await create_update_tick(SCHEOBLE_API, process.env.DATABASE_URL || "");
  let current_tick = 0;

  while (true) {
    logger.info(`Start tick #${current_tick}`);
    measure_time("upd_tick", "start");
    await tick();
    const time_taken = measure_time("upd_tick", "end");

    logger.info(`Update tick #${current_tick} complete with ${time_taken}ms`);
    logger.info(`Sleeping ${DELAY_AFTER_UPDATE_TICK}ms before next tick`);
    current_tick += 1;
    await sleep(DELAY_AFTER_UPDATE_TICK);
  }
};

main();
