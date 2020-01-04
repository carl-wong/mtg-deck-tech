import { MinOracleCard } from './oracle-card';
import { CardTagLink } from './card-tag-link';


export class CardReference {
	count: number;
	name: string;

	OracleCard: MinOracleCard;
	CardTagLinks: CardTagLink[];

	constructor(values: Object = {}) {
		Object.assign(this, values);
	}
}
