import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tag } from '@classes/tag';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SingletonService } from '@services/singleton.service';
import { TagApiService } from '@services/tag-api.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { first, take } from 'rxjs/operators';

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
    this.singleton.setIsLoading(true);
    this.singleton.profile$.pipe(first((m) => !!m)).subscribe((profile) => {
      this.profileId = profile?._id ?? '';
      this.tagService.getTags(this.profileId).pipe(take(1)).subscribe((tags) => {
        this.tags = tags;
        this.options = this.tags.map((a) => a.name).sort();
        this.singleton.setIsLoading(false);
      });
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
