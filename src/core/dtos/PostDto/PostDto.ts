import { parse } from "@textlint/markdown-to-ast";
import { TablePosts } from "../../../types/Tables";
import { PostMedia } from "./types";
import { find_pissykaka_images, find_youtube_links } from "./utils";

export class PostDto {
  public id: number;
  public board_tag: string;
  public parent_id?: number;
  public poster: string;
  public poster_verified: boolean;
  public post_subject: string;
  public post_message: string;
  public created_at: number;
  public replies_total?: number;
  public replies?: PostDto[];
  public media?: PostMedia[];

  constructor(db_post: TablePosts & { replies?: TablePosts[], replies_total?: number }) {
    this.id = db_post.id;
    this.board_tag = db_post.tag;
    this.poster = db_post.poster;
    this.poster_verified = db_post.is_verify;
    this.post_subject = db_post.subject.trim();
    this.post_message = db_post.message.trim();
    this.created_at = db_post.timestamp;
    this.replies = db_post.replies?.map((reply) => new PostDto(reply));
    this.replies_total = db_post.replies_total;

    if (db_post.parent_id) {
      this.parent_id = db_post.parent_id;
    }

    this.extract_media_from_message();
  }

  private extract_media_from_message() {
    let trunked_post_message = '';
    const skip_ranges: [start: number, end: number][] = [];
    const ast = parse(this.post_message);

    const pissykaka_images = find_pissykaka_images(ast);
    const youtube_links = find_youtube_links(ast);

    const all_medias = [...pissykaka_images, ...youtube_links];
    if (all_medias) {
      this.media = [];
      all_medias.forEach((item) => {
        this.media?.push(item[0]);
        skip_ranges.push(item[1]);
      });
    }

    if (skip_ranges) {
      for (let i = 0; i < this.post_message.length; i++) {
        // check, is i in any skip range?
        const not_in_range = skip_ranges.every(([start, end]) => !(i >= start && i <= end));
        if (not_in_range) {
          trunked_post_message = `${trunked_post_message}${this.post_message[i]}`;
        }
      }

      this.post_message = trunked_post_message.trim();
    }
  }
}
