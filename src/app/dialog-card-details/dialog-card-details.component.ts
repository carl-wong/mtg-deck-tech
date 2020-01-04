import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CardReference } from '../classes/card-reference';


@Component({
	selector: 'app-dialog-card-details',
	templateUrl: './dialog-card-details.component.html',
	styleUrls: ['./dialog-card-details.component.less']
})
export class DialogCardDetailsComponent implements OnInit {
	private _card: CardReference;

	shownIndex: number;
	imageUris: string[] = [];

	constructor(
		private dialogRef: MatDialogRef<DialogCardDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) data: CardReference) {
		this._card = data;
	}

	ngOnInit() {
		if (this._card.OracleCard.card_faces) {
			this._card.OracleCard.card_faces.forEach(face => {
				if (face.image_uris &&
					face.image_uris.normal) {
					this.imageUris.push(face.image_uris.normal);
				}
			});
		}

		if (this._card.OracleCard.image_uris &&
			this._card.OracleCard.image_uris.normal) {
			this.imageUris.push(this._card.OracleCard.image_uris.normal);
		}

		if (this.imageUris.length > 0) {
			this.shownIndex = 0;
		}
	}

	changeShown() {
		this.shownIndex = (this.shownIndex + 1) % this.imageUris.length;
	}

	close() {
		this.dialogRef.close();
	}
}
