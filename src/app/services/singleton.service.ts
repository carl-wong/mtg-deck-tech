import { Injectable } from '@angular/core';
import { User } from '@classes/user';
import { environment } from '@env';
import { ProfileApiService } from '@services/profile-api.service';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SingletonService {

  constructor(
    private servProfiles: ProfileApiService,
  ) { }

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private auth0Subject = new BehaviorSubject<string>('');
  public auth0$ = this.auth0Subject.asObservable();

  private userSubject = new BehaviorSubject<User>('');
  public user$ = this.userSubject.asObservable();

  public setIsLoading(value: boolean): void {
    this.isLoadingSubject.next(value);
  }

  public setAuth0(auth0: string): void {
    // update profile by auth0 user_id
    this.servProfiles.getByAuth0(auth0).pipe(take(1))
    .subscribe((result) => {
      if (!environment.production) {
        console.log('fetched profile by auth0');
        console.log(result);
      }

      this.setUser(result?.[0].user?.[0]);
    });

    this.auth0Subject.next(auth0);
  }

  public setUser(model: User): void {
    this.userSubject.next(model);
  }
}
