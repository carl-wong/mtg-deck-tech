import { Injectable } from '@angular/core';
import { Tag } from '@classes/tag';
import { BehaviorSubject } from 'rxjs';


export enum EventType {
	Init,
	Insert,
	Delete,
	Update,
	Merge,
}

export interface iTagsUpdated {
	type: EventType;
	Tag: Tag;

	fromId: number;// for Merge
	toId: number;// for Merge
}

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	private _isTagsUpdated = new BehaviorSubject<iTagsUpdated>({
		type: EventType.Init,
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
