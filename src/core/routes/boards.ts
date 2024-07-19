import { FastifyInstance, FastifyRequest } from "fastify";
import { create_db_connection } from "../../services/create_db_connection";

export const bind_boards_routes = (fastify: FastifyInstance, db: Awaited<ReturnType<typeof create_db_connection>>) => {
  type ReqBoardsList = FastifyRequest<{ Querystring: { unmod?: string } }>;
  fastify.get('/api/v1/boards', async (request: ReqBoardsList, reply) => {
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
};
