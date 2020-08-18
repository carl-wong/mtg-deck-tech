import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Tag } from '@classes/tag';
import { SingletonService } from '@services/singleton.service';
import { TagApiService } from '@services/tag-api.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-dialog-add-tag',
  templateUrl: './dialog-add-tag.component.html',
  styleUrls: ['./dialog-add-tag.component.less']
})
export class DialogAddTagComponent implements OnInit {
  faTimes = faTimes;
  faSave = faSave;

  private profileId: string | undefined;
  private tags: Tag[];
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  tagInput = new FormControl();

  private tagName = '';

  @ViewChild(MatAutocomplete) autoComplete: MatAutocomplete;

  constructor(
    private service: TagApiService,
    private dialogRef: MatDialogRef<DialogAddTagComponent>,
    private singleton: SingletonService,
  ) {
  }

  ngOnInit() {
    this.singleton.profile$.pipe(take(1)).subscribe((profile) => this.profileId = profile?._id);

    this.singleton.tags$.pipe(take(1)).subscribe((tags) => {
      this.tags = tags;
      this.options = this.tags.map(a => a.name).sort();
    });

    this.filteredOptions = this.tagInput.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().startsWith(filterValue));
  }

  onKeyEnter() {
    if (!this.autoComplete.isOpen) {
      this.close(true);
    }
  }

  close(isAccept: boolean = false) {
    if (isAccept) {
      if (!this.tagName) {
        this.tagName = this.tagInput.value.trim().toUpperCase();
      }

      if (this.tagName) {
        const tag = this.tags.find(m => m.name === this.tagName);
        if (!!tag) {
          this.dialogRef.close(tag);
        } else {
          this.service.createTag({ name: this.tagName, profile: [this.profileId] })
            .pipe(take(1)).subscribe((result) => {
              if (!!result) {
                this.singleton.setTags(this.tags.concat(result));
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
