import axios from "axios";
import type { ApiTemplate } from "../types/ApiTemplate";
import type { ResponseBoardsList } from "../types/ResponseBoardsList";
import type { ResponseThreadsList } from "../types/ResponseThreadsList";
import { ResponseThreadPostsList } from "../types/ResponseThreadPostsList";
import { FETCH_ENTITIES_FROM_API_BASE_LIMIT } from "../utils/config";

export type CPS_Params = {
  base_url: string;
};

export const create_pissychan_service = (params: CPS_Params) => {
  const request = axios.create({
    baseURL: params.base_url,
  });

  const getBoardsList = async () => {
    const response = await request.get<ApiTemplate<ResponseBoardsList>>("v2/board?exclude_tags[]=", {
      params: { limit: FETCH_ENTITIES_FROM_API_BASE_LIMIT },
    });
    return response.data.payload.boards;
  };

  const getThreadsList = async (params: { tag: string }) => {
    const response = await request.get<ApiTemplate<ResponseThreadsList>>(`/v2/board/${params.tag}`, {
      params: { limit: FETCH_ENTITIES_FROM_API_BASE_LIMIT },
    });
    return response.data.payload.posts;
  };

  const getThreadPostsList = async (params: { thread_id: number }) => {
    const response = await request.get<ApiTemplate<ResponseThreadPostsList>>(`/post/${params.thread_id}`);
    return response.data.payload.thread_data;
  };

  return { getBoardsList, getThreadsList, getThreadPostsList };
};
