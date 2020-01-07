import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

export enum MessageLevel {
	Info = 'info',
	Warn = 'warn',
	Alert = 'alert',
}

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	messages: [string, string][] = [];

	constructor(
		private snackBar: MatSnackBar,
	) { }

	add(text: string, level: MessageLevel = MessageLevel.Info) {
		if (level === MessageLevel.Alert) {
			this.snackBar.open(text, 'Dismiss', {
				duration: 3000
			});
		}

		this.messages.push([level.toString(), text]);
	}

	clear() {
		this.messages = [];
	}
}