import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class MessagesService {
	messages: [string, string][] = [];

	constructor() { }

	add(text: string, level: string = 'info') {
		if (level === 'warn') {
			alert(text);
		}
		
		this.messages.push([level, text]);
	}

	clear() {
		this.messages = [];
	}
}