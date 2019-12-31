import { Component, OnInit, Input } from '@angular/core';
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
	tagInput = new FormControl();

	@Input() tagName: string = '';

	constructor(
		private service: LocalApiService,
		private dialogRef: MatDialogRef<DialogAddTagComponent>
	) { }

	ngOnInit() {
		this.service.getTags().subscribe(tags => {
			this._tags = tags;
			this.options = tags.map(a => a.name).sort();
			this.filteredOptions = this.tagInput.valueChanges
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

	onKeyEnter() {
		const value = this.tagInput.value;
		const filteredOptions = this._filter(value);

		if (filteredOptions.length > 0) {
			this.tagName = filteredOptions[0];
		}

		this.close(true);
	}

	close(isAccept: boolean = false) {
		if (this.tagName) {
			this.tagName = this.tagName.trim().toUpperCase();
		}

		if (isAccept && this.tagName) {
			const existing = this._tags.find(m => m.name === this.tagName);

			if (existing) {
				this.dialogRef.close(existing.id);
			} else {
				let newTag = new Tag();
				newTag.name = this.tagName;

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
