import { TxtParentNode } from "@textlint/ast-node-types/src/NodeType";
import { PISSYKAKA_HOSTNAME } from "../../../utils/config";
import { PostMedia, PostMediaType } from "./types";

export const find_pissykaka_images = (ast: TxtParentNode) => {
  let founded: [media: PostMedia, [start: number, end: number]][] = [];

  if (!ast.children) {
    return founded;
  }

  ast.children.forEach((node) => {
    // main check
    if (node.type === 'Link') {
      if (node.url.includes(PISSYKAKA_HOSTNAME)) {
        const image_node = node.children.at(0);
        if (image_node?.type === 'Image') {
          if (image_node.url.includes(PISSYKAKA_HOSTNAME)) {
            founded.push([
              { type: PostMediaType.PISSYKAKA_IMAGE, media_url: node.url, preview_image_url: image_node.url },
              [node.range[0], node.range[1]],
            ]);
          }
        }
      }
    } else if ((node as TxtParentNode).children) {
      // recurse it
      founded = [...founded, ...find_pissykaka_images(node as TxtParentNode)];
    }
  });

  return founded;
}

export const find_youtube_links = (ast: TxtParentNode) => {
  let founded: [media: PostMedia, [start: number, end: number]][] = [];

  if (!ast.children) {
    return founded;
  }

  ast.children.forEach((node) => {
    // main check
    if (node.type === 'Link') {
      if (is_youtube_link(node.url)) {
        const video_id = extract_video_id(node.url)
        const preview_image_url = `https://i1.ytimg.com/vi/${video_id}/hqdefault.jpg`;

        founded.push([
          { type: PostMediaType.YOUTUBE, media_url: node.url, preview_image_url },
          [node.range[0], node.range[1]],
        ]);
      }
    } else if ((node as TxtParentNode).children) {
      // recurse it
      founded = [...founded, ...find_youtube_links(node as TxtParentNode)];
    }
  });

  return founded;
}

export const extract_video_id = (url: string) => {
  // case for default link
  if (url.includes('https://www.youtube.com/watch')) {
    const parsed = new URL(url);
    const id = parsed.searchParams.get('v');
    if (id) {
      return id;
    } else {
      throw new Error(`${url} is not a valid URL`);
    }
  }

  // case for shareable link
  if (url.includes('https://youtu.be/')) {
    const parsed = new URL(url);
    const id = parsed.pathname.split('/').at(1);
    if (id) {
      return id;
    } else {
      throw new Error(`${url} is not a valid URL`);
    }
  }

  return '';
}

export const is_youtube_link = (url: string) => {
  return url.includes('https://www.youtube.com/watch') || url.includes('https://youtu.be/');
}
