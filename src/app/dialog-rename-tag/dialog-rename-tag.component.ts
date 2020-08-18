import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tag } from '@classes/tag';
import { CardTagLinkApiService } from '@services/card-tag-link-api.service';
import { SingletonService } from '@services/singleton.service';
import { TagApiService } from '@services/tag-api.service';
import { first, take } from 'rxjs/operators';

export interface IDialogRenameTag {
  model: Tag;
}

@Component({
  selector: 'app-dialog-rename-tag',
  styleUrls: ['./dialog-rename-tag.component.less'],
  templateUrl: './dialog-rename-tag.component.html',
})
export class DialogRenameTagComponent implements OnInit {
  public model: Tag;

  private profileId: string;
  private tags: Tag[];

  constructor(
    private linkService: CardTagLinkApiService,
    private tagService: TagApiService,
    private singleton: SingletonService,
    private service: TagApiService,
    private dialogRef: MatDialogRef<DialogRenameTagComponent>,
    @Inject(MAT_DIALOG_DATA) data: IDialogRenameTag,
  ) {
    this.model = Object.assign(new Tag(), data.model);
  }

  public ngOnInit(): void {
    this.singleton.setIsLoading(true);
    this.singleton.profile$.pipe(first((m) => !!m)).subscribe((profile) => {
      this.profileId = profile?._id ?? '';
      this.tagService.getTags(this.profileId).pipe(take(1)).subscribe((tags) => {
        this.tags = tags;
        this.singleton.setIsLoading(false);
      });
    });
  }

  public submit(): void {
    if (this.model.name && this.model.name.trim()) {
      this.model.name = this.model.name.trim().toUpperCase();
      const mergeInto = this.tags.find((m) => m.name === this.model.name && m._id !== this.model._id);
      if (!!mergeInto) {
        // request to merge tags
        if (confirm(`Do you wish to merge this tag into [${mergeInto.name}]?`)) {
          this.linkService.getByTagId(this.model._id).pipe(take(1)).subscribe((existingLinks) => {
            if (!!existingLinks) {
              // create new links with the same details, but attached to the other tag
              const newLinks: { oracle_id: string, tag: string[], profile: string[] }[] = [];
              existingLinks.forEach((link) => {
                newLinks.push({
                  oracle_id: link.oracle_id,
                  profile: [this.profileId],
                  tag: [mergeInto._id],
                });
              });

              this.linkService.createCardTagLinks(newLinks).pipe(take(1)).subscribe((createdLinks) => {
                if (!!createdLinks) {
                  // remove old links to the old tag
                  this.linkService.deleteCardTagLinks(existingLinks.map((m) => m._id)).pipe(take(1))
                    .subscribe((deletedLinks) => {
                      if (!!deletedLinks) {
                        // remove old tag
                        this.tagService.deleteTag(this.model._id).pipe(take(1)).subscribe((deletedTag) => {
                          if (!!deletedTag) {
                            this.tags = this.tags.filter((m) => m._id !== this.model._id);
                            this.singleton.setRequireReloadDeck(true);
                            this.dialogRef.close(true);
                          } else {
                            this.singleton.notify('Failed to delete old tag');
                          }
                        });
                      } else {
                        this.singleton.notify('Failed to delete old links');
                      }
                    });
                } else {
                  this.singleton.notify('Failed to create new links');
                }
              });
            }
          });
        }
      } else {
        this.service.updateTag(this.model).subscribe((result) => {
          if (result) {
            if (!!result) {
              this.singleton.setRequireReloadDeck(true);
              this.dialogRef.close(true);
            } else {
              this.singleton.notify(`Failed to rename [${this.model.name}].`);
            }
          }
        });
      }
    } else {
      this.singleton.notify('Tag name cannot be empty!');
    }
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}
