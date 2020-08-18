import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile } from '@classes/profile';
import { Tag } from '@classes/tag';
import { environment } from '@env';
import { ProfileApiService } from '@services/profile-api.service';
import { TagApiService } from '@services/tag-api.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SingletonService {

  constructor(
    private snackBar: MatSnackBar,
    private servProfiles: ProfileApiService,
    private servTags: TagApiService,
  ) { }

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private auth0Subject = new BehaviorSubject<string | undefined>(undefined);
  public auth0$ = this.auth0Subject.asObservable();

  private profileSubject = new BehaviorSubject<Profile | undefined>(undefined);
  public profile$ = this.profileSubject.asObservable();

  private tagsSubject = new BehaviorSubject<Tag[]>([]);
  public tags$ = this.tagsSubject.asObservable();

  public setProfile(model: Profile): void {
    this.profileSubject.next(model);
  }

  public setTags(model: Tag[]): void {
    this.tagsSubject.next(model);
  }

  public setIsLoading(value: boolean): void {
    this.isLoadingSubject.next(value);
  }

  public setAuth0(auth0: string): void {
    // update profile by auth0 user_id
    this.servProfiles.getByAuth0(auth0).pipe(take(1))
    .subscribe((profiles) => {
      if (!environment.production) {
        console.log('fetched profile by auth0');
        console.log(profiles);
      }

      this.setProfile(profiles?.[0].user?.[0]);

      // get tags of the profile
      if (!!profiles?.[0]) {
        this.servTags.getTags(profiles[0]._id).pipe(take(1))
        .subscribe((tags) => {
          if (!environment.production) {
            console.log('fetched profile tags by auth0');
            console.log(tags);
          }

          this.setTags(tags);
        });
      }
    });

    this.auth0Subject.next(auth0);
  }

  public notify(message: string, action: string = 'Dismiss'): void {
      this.snackBar.open(message, action, {
        duration: 3000
      });
  }
}
