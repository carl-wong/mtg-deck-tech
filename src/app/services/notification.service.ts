import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private _isTagsUpdated = new BehaviorSubject<boolean>(false);
	isTagsUpdated$ = this._isTagsUpdated.asObservable();

	constructor() { }

	tagsUpdated() {
		this._isTagsUpdated.next(true);
	}
}
