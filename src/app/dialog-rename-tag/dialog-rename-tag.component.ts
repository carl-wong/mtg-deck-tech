import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Tag } from '../classes/tag';
import { LocalApiService } from '../services/local-api.service';
import { MessageLevel, MessagesService } from '../services/messages.service';
import { EventType, iTagsUpdated, NotificationService } from '../services/notification.service';


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
		private messages: MessagesService,
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
				if (confirm(`Do you wish to merge this tag into [${mergeInto.name}]?`)) {
					this.service.mergeTags(this.model, mergeInto).subscribe(mergeResult => {
						if (mergeResult) {
							if (!mergeResult.isSuccess) {
								this.messages.add(`Failed to merge [${this.model.name}] into [${mergeInto.name}].`, MessageLevel.Alert);
							} else {
								this.messages.add(`Successfully merged [${this.model.name}] into [${mergeInto.name}].`);
								this.service.deleteTag(this.model.id).subscribe(deleteResult => {
									if (deleteResult) {
										if (!deleteResult.isSuccess) {
											this.messages.add(`Failed to remove [${this.model.name}]...`, MessageLevel.Alert);
										} else {
											this.messages.add(`Successfully removed [${this.model.name}].`);
											// only send a single update notification
											// EventType.Merge should handle EventType.Delete functionality too
											const data: iTagsUpdated = {
												type: EventType.Merge,
												Tag: this.model,
												fromId: this.model.id,
												toId: mergeInto.id,
											};

											this.notify.tagsUpdated(data);
											this.dialogRef.close();
										}
									}
								});
							}
						}
					});
				}
			} else {
				this.service.updateTag(this.model).subscribe(result => {
					if (result) {
						if (!result.isSuccess) {
							this.messages.add(`Failed to rename [${this.model.name}].`, MessageLevel.Alert);
						} else {
							const data: iTagsUpdated = {
								type: EventType.Update,
								Tag: this.model,
								fromId: -1,
								toId: -1,
							};
							this.notify.tagsUpdated(data);
							this.dialogRef.close();
						}
					}
				});
			}
		} else {
			this.messages.add('Tag name cannot be empty!', MessageLevel.Alert);
		}
	}

	close() {
		this.dialogRef.close();
	}
}
