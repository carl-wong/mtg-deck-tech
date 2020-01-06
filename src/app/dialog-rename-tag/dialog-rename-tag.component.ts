import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { Tag } from '../classes/tag';
import { LocalApiService } from '../services/local-api.service';
import { NotificationService } from '../services/notification.service';



export interface iDialogRenameTag {
	model: Tag;
	all: Tag[];
}

@Component({
	selector: 'app-dialog-rename-tag',
	templateUrl: './dialog-rename-tag.component.html',
	styleUrls: ['./dialog-rename-tag.component.less']
})
export class DialogRenameTagComponent implements OnInit {
	model: Tag;
	private _all: Tag[];

	constructor(
		private service: LocalApiService,
		private notify: NotificationService,
		private dialogRef: MatDialogRef<DialogRenameTagComponent>,
		@Inject(MAT_DIALOG_DATA) data: iDialogRenameTag
	) {
		this.model = Object.assign(new Tag(), data.model);
		this._all = data.all;
	}

	ngOnInit() {
	}

	submit() {
		if (this.model.name && this.model.name.trim()) {
			this.model.name = this.model.name.trim().toUpperCase();
			const mergeInto = this._all.find(m => m.name === this.model.name && m.id !== this.model.id);
			if (mergeInto) {
				// request to merge tags
				if (confirm(`Do you wish to merge this tag into "${mergeInto.name}"?`)) {
					this.service.mergeTags(this.model, mergeInto).subscribe(() => {
						this.service.deleteTag(this.model.id).subscribe(() => {
							this.notify.tagsUpdated();
							this.dialogRef.close();
						});
					});
				}
			} else {
				this.service.updateTag(this.model).subscribe(() => {
					this.notify.tagsUpdated();
					this.dialogRef.close();
				});
			}
		} else {
			alert('Tag name cannot be empty!');
		}
	}

	close() {
		this.dialogRef.close();
	}
}
