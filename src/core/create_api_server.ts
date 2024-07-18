import create_fastify, { FastifyRequest } from "fastify"
import { logger } from "../utils/logger";
import { create_db_connection } from "../services/create_db_connection";
import { measure_time } from "../utils/measure_time";

export const create_api_server = async (listen_port: number, listen_host: string, database_url: string) => {
  const db = await create_db_connection(database_url);
  const fastify = create_fastify();

  const start_listen = () => fastify.listen({ port: listen_port, host: listen_host }, (err) => {
    if (err) {
      logger.error(err.toString());
    } else {
      logger.info(`Start API server at ${JSON.stringify(fastify.server.address())}`);
    }
  });

  type RequestBoardsList = FastifyRequest<{ Querystring: { unmod?: string } }>;
  fastify.get('/api/v1/boards', async (request: RequestBoardsList, reply) => {
    if (request.query.unmod === 'true') {
      const boards = await db.apis.boards.get_all_unmoderated();
      reply.send(boards);
    } else {
      reply.status(501);
      reply.send('Not implemented :^)');
    }
  });

  type ReqBoard = FastifyRequest<{ Querystring: { unmod?: string }, Params: { board_tag: string } }>;
  fastify.get('/api/v1/board/:board_tag', async (request: ReqBoard, reply) => {
    if (request.query.unmod === 'true') {
      const data = await db.apis.boards.get_by_tag_unmoderated(request.params.board_tag);
      reply.send(data);
    } else {
      reply.status(501);
      reply.send('Not implemented :^)');
    }
  });

  type ReqBoardThreads = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string }, Params: { board_tag: string } }>;
  fastify.get('/api/v1/board/:board_tag/threads', async (request: ReqBoardThreads, reply) => {
    if (request.query.unmod === 'true') {
      const data = await db.apis.threads.get_by_board_tag_unmoderated(
        request.params.board_tag, Number(request.query.offset) || 0, Number(request.query.limit) || 20
      );
      reply.send(data);
    } else {
      reply.status(501);
      reply.send('Not implemented :^)');
    }
  });

  return { start_listen };
}
