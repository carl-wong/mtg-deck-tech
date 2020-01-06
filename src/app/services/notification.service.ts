import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tag } from '../classes/tag';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private _isTagsUpdated = new BehaviorSubject<iTagsUpdated>({
		type: NotificationType.Init,
		Tag: null,
		fromId: -1,
		toId: -1,
	});

	isTagsUpdated$ = this._isTagsUpdated.asObservable();

	constructor() { }

	tagsUpdated(event: iTagsUpdated) {
		this._isTagsUpdated.next(event);
	}

	getProfileId(): number {
		return parseInt(sessionStorage.getItem('ProfileId'));
	}
}

export enum NotificationType {
	Init,
	Insert,
	Delete,
	Update,
	Merge,
}

export interface iTagsUpdated {
	type: NotificationType;
	Tag: Tag;

	fromId: number;// for Merge
	toId: number;// for Merge
}
