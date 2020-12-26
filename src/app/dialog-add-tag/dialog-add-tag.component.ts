import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tag } from '@classes/tag';
import { Profile } from '@classes/profile';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SingletonService } from '@services/singleton.service';
import { TagApiService } from '@services/tag-api.service';
import { Observable } from 'rxjs';
import { map, startWith, first, take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dialog-add-tag',
  styleUrls: ['./dialog-add-tag.component.less'],
  templateUrl: './dialog-add-tag.component.html',
})
export class DialogAddTagComponent implements OnInit {
  public faTimes = faTimes;
  public faSave = faSave;

  private profileId: string;
  private tags: Tag[];
  public options: string[] = [];
  public filteredOptions: Observable<string[]>;
  public tagInput = new FormControl();

  private tagName = '';

  @ViewChild(MatAutocomplete) public autoComplete: MatAutocomplete;

  constructor(
    private tagService: TagApiService,
    private dialogRef: MatDialogRef<DialogAddTagComponent>,
    private singleton: SingletonService,
  ) {
  }

  public ngOnInit(): void {
    forkJoin([
      this.singleton.profile$.pipe(first(m => !!m)),
      this.singleton.tags$.pipe(take(1)),
    ]).subscribe((results) => {
      const profile: Profile = results[0] as Profile;
      this.profileId = profile ?._id ?? '';

      const tags: Tag[] = results[1] as Tag[];
      if (!!tags) {
        this.tags = tags;
      } else {
        this.tagService.getTags(this.profileId).pipe(take(1))
          .subscribe((loaded) => {
            this.tags = loaded;
            this.options = this.tags.map((a) => a.name).sort();
            this.singleton.notify('Tags loaded...');
          });
      }
    });

    this.filteredOptions = this.tagInput.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filter(value)),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) => option.toLowerCase().startsWith(filterValue));
  }

  public onKeyEnter(): void {
    if (!this.autoComplete.isOpen) {
      this.close(true);
    }
  }

  public close(isAccept: boolean = false): void {
    if (isAccept) {
      if (!this.tagName) {
        this.tagName = this.tagInput.value.trim().toUpperCase();
      }

      if (this.tagName) {
        const tag = this.tags.find((m) => m.name === this.tagName);
        if (!!tag) {
          this.dialogRef.close(tag);
        } else {
          this.tagService.createTag({ name: this.tagName, profile: [this.profileId] })
            .pipe(take(1)).subscribe((result) => {
              if (!!result) {
                this.dialogRef.close(result);
              } else {
                this.singleton.notify('Failed to add tag');
              }
            });
        }
      }
    } else {
      this.dialogRef.close();
    }
  }
}
