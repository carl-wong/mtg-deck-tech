import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Profile } from '@classes/profile';
import { environment } from '@env';
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

  private requireReloadDeckSubject = new BehaviorSubject<boolean>(false);
  public requireReloadDeck$ = this.requireReloadDeckSubject.asObservable();

  public setRequireReloadDeck(model: boolean): void {
    this.requireReloadDeckSubject.next(model);
  }

  public setProfile(model: Profile): void {
    this.profileSubject.next(model);
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

      this.setProfile(profiles?.[0]);
    });

    this.auth0Subject.next(auth0);
  }

  public notify(message: string, action: string = 'Dismiss'): void {
      this.snackBar.open(message, action, {
        duration: 3000,
      });
  }
}
