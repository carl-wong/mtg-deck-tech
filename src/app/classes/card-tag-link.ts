import { Profile } from '@classes/profile';
import { Tag } from '@classes/tag';

export class CardTagLink {
  public _id: string;
  public oracle_id: string;
  public profile: Profile[];
  public tag: Tag[];
}
