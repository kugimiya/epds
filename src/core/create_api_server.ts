import create_fastify from "fastify"
import { logger } from "../utils/logger";
import { create_db_connection } from "../services/create_db_connection";
import { bind_boards_routes } from "./routes/boards";

export const create_api_server = async (listen_port: number, listen_host: string, database_url: string) => {
  const db = await create_db_connection(database_url);
  const fastify = create_fastify();

  bind_boards_routes(fastify, db);

  const start_listen = () => fastify.listen({ port: listen_port, host: listen_host }, (err) => {
    if (err) {
      logger.error(err.toString());
    } else {
      logger.info(`Start API server at ${JSON.stringify(fastify.server.address())}`);
    }
  });

  return { start_listen };
}
