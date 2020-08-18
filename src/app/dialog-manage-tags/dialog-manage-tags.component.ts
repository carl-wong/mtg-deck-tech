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
import { first, take } from 'rxjs/operators';
import { DialogRenameTagComponent, IDialogRenameTag } from '../dialog-rename-tag/dialog-rename-tag.component';

@Component({
  selector: 'app-dialog-manage-tags',
  styleUrls: ['./dialog-manage-tags.component.less'],
  templateUrl: './dialog-manage-tags.component.html',
})
export class DialogManageTagsComponent implements OnInit, OnDestroy {

  constructor(
    private tagService: TagApiService,
    private cardTagLinkService: CardTagLinkApiService,
    private dialog: MatDialog,
    private singleton: SingletonService,
    private dialogRef: MatDialogRef<DialogManageTagsComponent>,
  ) { }
  private sub: Subscription;

  private profileId: string;
  private tags: Tag[] = [];
  public displayColumns = [
    'name',
    // 'count',
    'actions',
  ];
  public dataSource: MatTableDataSource<Tag>;

  @ViewChild(MatPaginator) public paginator: MatPaginator;

  public ngOnInit(): void {
    this.singleton.setIsLoading(true);

    this.singleton.profile$.pipe(first((m) => !!m)).subscribe((profile) => {
      this.profileId = profile?._id ?? '';
      this.tagService.getTags(this.profileId).pipe(take(1))
        .subscribe((tags) => {
          this.tags = tags;
          this.refreshTable();
          this.singleton.setIsLoading(false);
        });
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private refreshTable(): void {
    this.dataSource = new MatTableDataSource(this.tags);
    this.dataSource.paginator = this.paginator;
  }

  public selectedAction($event: MatSelectChange, model: Tag): void {
    switch ($event.value) {
      case 'rename': {
        const dConfig = new MatDialogConfig();

        dConfig.autoFocus = false;
        dConfig.disableClose = false;

        const data: IDialogRenameTag = {
          model,
        };

        dConfig.data = data;

        this.dialog.open(DialogRenameTagComponent, dConfig).afterClosed()
        .subscribe((isChanged) => {
            if (!!isChanged) {
              this.singleton.setIsLoading(true);
              this.tagService.getTags(this.profileId).pipe(take(1))
                .subscribe((tags) => {
                  this.tags = tags;
                  this.refreshTable();
                  this.singleton.setIsLoading(false);
                });
            }
        });
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
                .subscribe((result) => {
                  if (!!result) {
                    if (links?.length > 0) {
                      this.cardTagLinkService.deleteCardTagLinks(links.map((m) => m._id))
                        .pipe(take(1))
                        .subscribe((deletedLinks) => {
                          if (!!deletedLinks) {
                            this.singleton.setRequireReloadDeck(true);
                          }
                        });
                    }
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

  public close(): void {
    this.dialogRef.close();
  }
}
