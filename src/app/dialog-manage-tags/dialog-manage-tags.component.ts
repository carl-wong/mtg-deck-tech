import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Tag } from '@classes/tag';
import { CardTagLinkApiService } from '@services/card-tag-link-api.service';
import { SingletonService } from '@services/singleton.service';
import { TagApiService } from '@services/tag-api.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogRenameTagComponent, IDialogRenameTag } from '../dialog-rename-tag/dialog-rename-tag.component';

@Component({
  selector: 'app-dialog-manage-tags',
  templateUrl: './dialog-manage-tags.component.html',
  styleUrls: ['./dialog-manage-tags.component.less']
})
export class DialogManageTagsComponent implements OnInit, OnDestroy {

  constructor(
    private tagService: TagApiService,
    private cardTagLinkService: CardTagLinkApiService,
    private dialog: MatDialog,
    private singleton: SingletonService,
    private dialogRef: MatDialogRef<DialogManageTagsComponent>
  ) { }
  private sub: Subscription;

  tags: Tag[] = [];
  displayColumns = ['name', 'count', 'actions'];
  dataSource: MatTableDataSource<Tag>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.sub = this.singleton.tags$.subscribe((tags) => {
      this.tags = tags;
      this._refreshTable();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private _refreshTable() {
    this.dataSource = new MatTableDataSource(this.tags);
    this.dataSource.paginator = this.paginator;
  }

  selectedAction($event: MatSelectChange, model: Tag) {
    switch ($event.value) {
      case 'rename': {
        const dConfig = new MatDialogConfig();

        dConfig.autoFocus = false;
        dConfig.disableClose = false;

        const data: IDialogRenameTag = {
          model
        };

        dConfig.data = data;

        this.dialog.open(DialogRenameTagComponent, dConfig);
        break;
      }

      case 'delete': {
        let confirmMsg = `Are you sure you want to delete [${model.name}]?`;

        this.cardTagLinkService.getByTagId(model._id).pipe(take(1))
          .subscribe((links) => {
            if (links?.length > 0) {
              confirmMsg = `There are ${links.length} cards linked to this tag.` +
                'These links will also be removed if you proceed.\n' +
                confirmMsg;
            }

            if (confirm(confirmMsg)) {
              this.tagService.deleteTag(model._id).pipe(take(1))
                .subscribe(result => {
                  if (!!result) {
                    if (links?.length > 0) {
                      this.cardTagLinkService.deleteCardTagLinks(links.map(m => m._id))
                        .pipe(take(1))
                        .subscribe();
                    }

                    this.singleton.setTags(this.tags.filter(m => m._id !== model._id));
                  } else {
                    this.singleton.notify(`Could not remove [${model.name}].`);
                  }
                });
            }
          });
        break;
      }
    }

    $event.source.writeValue(null);
  }

  close() {
    this.dialogRef.close();
  }
}
