import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';


export enum MessageLevel {
	Init = 'init',
	Info = 'info',
	Warn = 'warn',
	Alert = 'alert',
	Notify = 'notify',
}

export interface iMessage {
	level: string;
	text: string;
	timestamp: string;
}

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	private _addedMessage = new BehaviorSubject<iMessage>({
		level: MessageLevel.Init,
		text: null,
		timestamp: null
	});

	addedMessage$ = this._addedMessage.asObservable();

	constructor(
		private snackBar: MatSnackBar,
	) { }

	send(text: string, level: MessageLevel = MessageLevel.Info) {
		if (level === MessageLevel.Alert) {
			this.snackBar.open(text, 'Dismiss', {
				duration: 3000
			});
		}

		if (level === MessageLevel.Notify) {
			// no need to log Notify-level messages
			this.snackBar.open(text, 'Dismiss', {
				duration: 3000
			});
		} else {
			this._addedMessage.next({ level: level.toString(), text: text, timestamp: moment().format('h:mm:ss A') });
		}
	}
}