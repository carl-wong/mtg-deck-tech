import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Tag } from '../classes/tag';
import { LocalApiService } from '../services/local-api.service';
import { NotificationService, iTagsUpdated, EventType } from '../services/notification.service';


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

	private tagName = '';

	constructor(
		private service: LocalApiService,
		private dialogRef: MatDialogRef<DialogAddTagComponent>,
		private notify: NotificationService,
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
		if (isAccept) {
			if (!this.tagName) {
				this.tagName = this.tagInput.value.trim().toUpperCase();
			}

			if (this.tagName) {
				let tag = this._tags.find(m => m.name === this.tagName);
				if (tag) {
					this.dialogRef.close(tag);
				} else {
					tag = new Tag();
					tag.name = this.tagName;

					this.service.createTag(tag).subscribe(result => {
						if (result) {
							if (result.id) {
								tag.id = result.id;
								tag.ProfileId = this.notify.getProfileId();

								const data: iTagsUpdated = {
									type: EventType.Insert,
									Tag: tag,
									fromId: -1,
									toId: -1
								};

								this.notify.tagsUpdated(data);
							}

							this.dialogRef.close(tag);
						}
					});
				}
			}
		} else {
			this.dialogRef.close();
		}
	}
}
