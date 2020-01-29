import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Tag } from '@classes/tag';
import { EventType, iTagsUpdated, NotificationService } from '@services/notification.service';
import { TagApiService } from '@services/tag-api.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


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

	@ViewChild(MatAutocomplete, { static: false }) autoComplete: MatAutocomplete;

	constructor(
		private service: TagApiService,
		private dialogRef: MatDialogRef<DialogAddTagComponent>,
		private notify: NotificationService,
		@Inject(MAT_DIALOG_DATA) data: { tags: Tag[] },
	) {
		this._tags = data.tags;
	}

	ngOnInit() {
		this.options = this._tags.map(a => a.name).sort();
		this.filteredOptions = this.tagInput.valueChanges
			.pipe(
				startWith(''),
				map(value => this._filter(value))
			);
	}

	private _filter(value: string): string[] {
		const filterValue = value.toLowerCase();
		return this.options.filter(option => option.toLowerCase().startsWith(filterValue));
	}

	onKeyEnter() {
		if (!this.autoComplete.isOpen) {
			this.close(true);
		}
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
