import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CardReference } from '../classes/card-reference';


@Component({
	selector: 'app-dialog-card-details',
	templateUrl: './dialog-card-details.component.html',
	styleUrls: ['./dialog-card-details.component.less']
})
export class DialogCardDetailsComponent implements OnInit {
	model: CardReference;
	oracle_text: string;

	constructor(
		private dialogRef: MatDialogRef<DialogCardDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) data: CardReference) {
		this.model = data;
		// this.oracle_text = data.OracleCard.oracle_text.trim();
	}

	ngOnInit() {
	}

	close() {
		this.dialogRef.close();
	}
}
