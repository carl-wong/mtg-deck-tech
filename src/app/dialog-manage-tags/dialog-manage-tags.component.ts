import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalApiService } from '../services/local-api.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material';
import { Tag } from '../classes/tag';
import { iDialogRenameTag, DialogRenameTagComponent } from '../dialog-rename-tag/dialog-rename-tag.component';
import { NotificationService } from '../services/notification.service';
import { Subscription } from 'rxjs';


@Component({
	selector: 'app-dialog-manage-tags',
	templateUrl: './dialog-manage-tags.component.html',
	styleUrls: ['./dialog-manage-tags.component.less']
})
export class DialogManageTagsComponent implements OnInit, OnDestroy {
	tags: Tag[];
	displayColumns = ['name', 'actions'];

	private _tagsUpdatedSub: Subscription;

	constructor(
		private service: LocalApiService,
		private dialog: MatDialog,
		private notify: NotificationService,
		private dialogRef: MatDialogRef<DialogManageTagsComponent>
	) { }

	ngOnInit() {
		this._tagsUpdatedSub = this.notify.isTagsUpdated$.subscribe(() => {
			this._loadTags();
		});

		this._loadTags();
	}

	ngOnDestroy() {
		this._tagsUpdatedSub.unsubscribe();
	}

	private _loadTags() {
		this.service.getTags().subscribe(tags => {
			this.tags = tags;
		});
	}

	selectedAction($event, model: Tag) {
		switch ($event.value) {
			case 'rename':
				{
					const dConfig = new MatDialogConfig();

					dConfig.autoFocus = false;
					dConfig.disableClose = false;

					const data: iDialogRenameTag = {
						model: model,
						all: this.tags,
					}

					dConfig.data = data;

					this.dialog.open(DialogRenameTagComponent, dConfig);
					break;
				}

			case 'delete':
				{
					this.service.getCardTagLinksByTagId(model.id).subscribe(links => {
						if (links && links.length > 0) {
							alert(`There are ${links.length} cards linked to this tag. Please remove the links or merge this tag with another first.`);
						} else {
							if (confirm(`Do you wish to delete "${model.name}"?`)) {
								this.service.deleteTag(model.id).subscribe(() => {
									this.notify.tagsUpdated();
								});
							}
						}
					});
					break;
				}

			default:
				break;
		}
	}


}
