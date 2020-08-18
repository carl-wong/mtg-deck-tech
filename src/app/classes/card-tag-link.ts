import { Tag } from '@classes/tag';
import { Profile } from '@classes/profile';

export class CardTagLink {
  _id: string;
  oracle_id: string;
  profile: Profile[];
  tag: Tag[];
}
