import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CardReference } from '../classes/card-reference';


@Component({
	selector: 'app-dialog-card-details',
	templateUrl: './dialog-card-details.component.html',
	styleUrls: ['./dialog-card-details.component.less']
})
export class DialogCardDetailsComponent implements OnInit {
	model: CardReference;
	shownIndex: number;
	imageUris: string[] = [];

	constructor(
		private dialogRef: MatDialogRef<DialogCardDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) data: CardReference) {
		this.model = data;
	}

	ngOnInit() {
		if (this.model.OracleCard.image_uris) {
			this.imageUris = this.model.OracleCard.image_uris.split(',');
		}

		if (this.imageUris.length > 0) {
			this.shownIndex = 0;
		}
	}

	changeShown() {
		if (this.imageUris.length > 0) {
			this.shownIndex = (this.shownIndex + 1) % this.imageUris.length;
		}
	}

	@HostListener('document:keypress', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		switch (event.code) {
			case 'Space':
				if (this.imageUris.length > 1) {
					this.changeShown();
				} else {
					this.close();
				}
				break;
			case 'Enter':
				this.close();
				break;
			default:
				break;
		}
	}

	close() {
		this.dialogRef.close();
	}
}
