export enum PostMediaType {
  PISSYKAKA_IMAGE = 0,
  YOUTUBE = 1,
}

export type PostMedia = {
  type: PostMediaType;
  media_url: string;
  preview_image_url?: string;
}