import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Tag } from '../classes/tag';
import { LocalApiService } from '../services/local-api.service';


@Component({
	selector: 'app-dialog-add-tag',
	templateUrl: './dialog-add-tag.component.html',
	styleUrls: ['./dialog-add-tag.component.less']
})
export class DialogAddTagComponent implements OnInit {
	private _tags: Tag[];
	options: string[];
	filteredOptions: Observable<string[]>;
	myControl = new FormControl();

	constructor(
		private service: LocalApiService,
		private dialogRef: MatDialogRef<DialogAddTagComponent>
	) { }

	ngOnInit() {
		this.service.getTags().subscribe(tags => {
			this._tags = tags;
			this.options = tags.map(a => a.name);
			this.filteredOptions = this.myControl.valueChanges
				.pipe(
					startWith(''),
					map(value => this._filter(value))
				);
		});
	}

	private _filter(value: string): string[] {
		const filterValue = value.toLowerCase();
		return this.options.filter(option => option.toLowerCase().includes(filterValue));
	}

	close(isAccept: boolean = false) {
		console.log(this.myControl.value);

		let value = this.myControl.value;
		if (value) {
			value = value.trim().toUpperCase();
		}

		if (isAccept && value) {
			const existing = this._tags.find(m => m.name === value);

			if (existing) {
				this.dialogRef.close(existing.id);
			} else {
				let newTag = new Tag();
				newTag.name = value;

				this.service.createTag(newTag).subscribe(res => {
					if (res) {
						this.dialogRef.close(res.id);
					} else {
						alert('Could not create tag');
					}
				});
			}
		}
		else {
			this.dialogRef.close();
		}
	}
}
