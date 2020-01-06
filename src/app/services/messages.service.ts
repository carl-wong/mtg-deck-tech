import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	messages: [string, string][] = [];

	constructor() { }

	add(text: string, level: string = 'info') {
		console.log(`${level.toUpperCase()}: ${text}`);
		this.messages.push([level, text]);
	}

	clear() {
		this.messages = [];
	}
}