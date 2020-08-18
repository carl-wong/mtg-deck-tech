import { CardTagLink } from './card-tag-link';
import { MinOracleCard } from './min-oracle-card';

export class CardReference {
  public count: number;
  public name: string;
  public OracleCard: MinOracleCard;

  public links: CardTagLink[];
}
