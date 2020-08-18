import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tag } from '@classes/tag';
import { TagApiService } from '@services/tag-api.service';
import { take } from 'rxjs/operators';
import { SingletonService } from '@services/singleton.service';

export interface IDialogRenameTag {
    model: Tag;
}

@Component({
    selector: 'app-dialog-rename-tag',
    templateUrl: './dialog-rename-tag.component.html',
    styleUrls: ['./dialog-rename-tag.component.less']
})
export class DialogRenameTagComponent implements OnInit {
    public model: Tag;
    private tags: Tag[];

    constructor(
      private singleton: SingletonService,
      private service: TagApiService,
      private dialogRef: MatDialogRef<DialogRenameTagComponent>,
      @Inject(MAT_DIALOG_DATA) data: IDialogRenameTag
    ) {
        this.model = Object.assign(new Tag(), data.model);
    }

    ngOnInit() {
      this.singleton.tags$.pipe(take(1)).subscribe((tags) => {
        this.tags = tags;
      });
    }

    submit() {
        if (this.model.name && this.model.name.trim()) {
            this.model.name = this.model.name.trim().toUpperCase();
            const mergeInto = this.tags.find(m => m.name === this.model.name && m._id !== this.model._id);
            if (!!mergeInto) {
                // request to merge tags
                if (confirm(`Do you wish to merge this tag into [${mergeInto.name}]?`)) {
                  // TODO: create new links for each oracle_id with mergeInto._id
                  // TODO: delete all links for original tag
                  this.dialogRef.close();
                }
            } else {
                this.service.updateTag(this.model).subscribe(result => {
                    if (result) {
                        if (!!result) {
                          this.singleton.setTags(this.tags.filter(m => m._id !== this.model._id));
                          this.dialogRef.close();
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

    close() {
        this.dialogRef.close();
    }
}
