import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile } from '@classes/profile';
import { Tag } from '@classes/tag';
import { ProfileApiService } from '@services/profile-api.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SingletonService {

  constructor(
    private snackBar: MatSnackBar,
    private servProfiles: ProfileApiService,
  ) { }

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private auth0Subject = new BehaviorSubject<string | undefined>(undefined);
  public auth0$ = this.auth0Subject.asObservable();

  private profileSubject = new BehaviorSubject<Profile | undefined>(undefined);
  public profile$ = this.profileSubject.asObservable();

  private tagsSubject = new BehaviorSubject<any>(undefined);
  public tags$ = this.tagsSubject.asObservable();

  private requireReloadDeckSubject = new BehaviorSubject<boolean>(false);
  public requireReloadDeck$ = this.requireReloadDeckSubject.asObservable();

  public setRequireReloadDeck(model: boolean): void {
    this.requireReloadDeckSubject.next(model);
  }

  public setProfile(model: Profile): void {
    this.profileSubject.next(model);
  }

  public setTags(model: Tag[]): void {
    this.tagsSubject.next(model);
  }

  public addTag(model: Tag): void {
    const current = this.tagsSubject.value;
    current.push(model);

    this.tagsSubject.next(current);
  }

  public setIsLoading(value: boolean): void {
    this.isLoadingSubject.next(value);
  }

  public setAuth0(auth0: string): void {
    // update profile by auth0 user_id
    this.servProfiles.getByAuth0(auth0).pipe(take(1))
      .subscribe((profile) => {
        if (!!profile) {
          this.setProfile(profile);
        } else {
          this.setProfile(undefined);
          alert('Profile could not be found, please contact support');
        }
      });

    this.auth0Subject.next(auth0);
  }

  public notify(message: string, action: string = 'Dismiss'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }
}
