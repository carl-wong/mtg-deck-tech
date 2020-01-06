import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Tag } from '../classes/tag';
import { DialogRenameTagComponent, iDialogRenameTag } from '../dialog-rename-tag/dialog-rename-tag.component';
import { LocalApiService } from '../services/local-api.service';
import { NotificationService } from '../services/notification.service';


@Component({
	selector: 'app-dialog-manage-tags',
	templateUrl: './dialog-manage-tags.component.html',
	styleUrls: ['./dialog-manage-tags.component.less']
})
export class DialogManageTagsComponent implements OnInit, OnDestroy {
	tags: Tag[];
	displayColumns = ['name', 'actions'];
	dataSource: MatTableDataSource<Tag>;

	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

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
			this.tags = tags.sort((a, b) => {
				if (a.name > b.name) {
					return 1;
				} else if (b.name > a.name) {
					return -1;
				} else {
					return 0;
				}
			});

			this.dataSource = new MatTableDataSource(this.tags);
			this.dataSource.paginator = this.paginator;
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
