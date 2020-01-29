import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Tag } from '../classes/tag';
import { DialogRenameTagComponent, iDialogRenameTag } from '../dialog-rename-tag/dialog-rename-tag.component';
import { MessageLevel, MessagesService } from '../services/messages.service';
import { EventType, iTagsUpdated, NotificationService } from '../services/notification.service';
import { TagApiService } from '../services/tag-api.service';


@Component({
	selector: 'app-dialog-manage-tags',
	templateUrl: './dialog-manage-tags.component.html',
	styleUrls: ['./dialog-manage-tags.component.less']
})
export class DialogManageTagsComponent implements OnInit, OnDestroy {
	private _tagsUpdatedSub: Subscription;

	tags: Tag[] = [];
	displayColumns = ['name', 'count', 'actions'];
	dataSource: MatTableDataSource<Tag>;

	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

	constructor(
		private service: TagApiService,
		private messages: MessagesService,
		private dialog: MatDialog,
		private notify: NotificationService,
		private dialogRef: MatDialogRef<DialogManageTagsComponent>
	) { }

	ngOnInit() {
		this._tagsUpdatedSub = this.notify.isTagsUpdated$.subscribe(event => {
			switch (event.type) {
				case EventType.Init:
					// do nothing
					break;

				case EventType.Update: {
					const tag = this.tags.find(m => m.id == event.Tag.id);
					tag.name = event.Tag.name;
					break;
				}

				case EventType.Insert: {
					this.tags.push(event.Tag);
					break;
				}

				case EventType.Delete: {
					const tagIndex = this.tags.findIndex(m => m.id === event.Tag.id);
					if (tagIndex !== -1) {
						this.tags.splice(tagIndex, 1);
					}
					break;
				}

				case EventType.Merge: {
					// update the count of links for the merged to Tag
					const fromTag = this.tags.find(m => m.id === event.fromId);
					if (fromTag && fromTag.CardTagLinksCount > 0) {
						const toTag = this.tags.find(m => m.id === event.toId);
						if (toTag) {
							toTag.CardTagLinksCount += fromTag.CardTagLinksCount;
						}
					}

					// remove the merged tag
					const tagIndex = this.tags.findIndex(m => m.id == event.fromId);
					if (tagIndex !== -1) {
						this.tags.splice(tagIndex, 1);
					}
					break;
				}

				default:
					this.messages.send('DialogManageTags received unexpected EventType: ' + event.type, MessageLevel.Alert);
					break;
			}

			this._refreshTable();
		});

		this._loadTags();
	}

	ngOnDestroy() {
		this._tagsUpdatedSub.unsubscribe();
	}

	private _refreshTable() {
		this.dataSource = new MatTableDataSource(this.tags);
		this.dataSource.paginator = this.paginator;
	}

	private _loadTags() {
		this.service.getTags().subscribe(tags => {
			this.tags = tags.sort((a, b) => {
				if (a.name > b.name) {
					return 1;
				} else if (b.name > a.name) {
					return -1;
				} else {
					return 0;
				}
			});

			this._refreshTable();
		});
	}

	selectedAction($event, model: Tag) {
		switch ($event.value) {
			case 'rename': {
				const dConfig = new MatDialogConfig();

				dConfig.autoFocus = false;
				dConfig.disableClose = false;

				const data: iDialogRenameTag = {
					model,
					all: this.tags,
				};

				dConfig.data = data;

				this.dialog.open(DialogRenameTagComponent, dConfig);
				break;
			}

			case 'delete': {
				let confirmMsg = `Are you sure you want to delete [${model.name}]?`;

				if (model.CardTagLinksCount > 0) {
					confirmMsg = `There are ${model.CardTagLinksCount} cards linked to this tag. These links will also be removed if you proceed.\n` + confirmMsg;
				}

				if (confirm(confirmMsg)) {
					this.service.deleteTag(model.id).subscribe(result => {
						if (result) {
							if (!result.isSuccess) {
								this.messages.send(`Could not remove [${model.name}].`, MessageLevel.Alert);
							} else {
								const data: iTagsUpdated = {
									type: EventType.Delete,
									Tag: model,
									toId: -1,
									fromId: -1,
								};

								this.notify.tagsUpdated(data);
							}
						}
					});
				}
				break;
			}

			default:
				break;
		}

		$event.source.writeValue(null);
	}

	close() {
		this.dialogRef.close();
	}
}
