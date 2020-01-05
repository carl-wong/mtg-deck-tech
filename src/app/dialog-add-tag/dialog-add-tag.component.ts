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
	options: string[] = [];
	filteredOptions: Observable<string[]>;
	tagInput = new FormControl();

	private tagName: string = '';

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
		return this.options.filter(option => option.toLowerCase().startsWith(filterValue));
	}

	onOptionSelected($event) {
		this.close(true);
	}

	onKeyEnter() {
		const filteredOptions = this._filter(this.tagInput.value);

		if (filteredOptions.length > 0) {
			this.tagName = filteredOptions[0];
		}

		this.close(true);
	}

	close(isAccept: boolean = false) {
		if (!this.tagName) {
			this.tagName = this.tagInput.value.trim().toUpperCase();
		}

		if (isAccept && this.tagName) {
			const existing = this._tags.find(m => m.name === this.tagName);

			if (existing) {
				this.dialogRef.close(existing.id);
			} else {
				let newTag = new Tag();
				newTag.name = this.tagName;

				this.service.createTag(newTag).subscribe(() => {
					this.service.getTags().subscribe(tags => {
						if (tags) {
							const tag = tags.find(m => m.name === this.tagName);
							if (tag) {
								this.dialogRef.close(tag.id);
							} else {
								alert('Could not create tag');
							}
						}
					});
				});
			}
		}
		else {
			this.dialogRef.close();
		}
	}
}
