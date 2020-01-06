import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../services/messages.service';

@Component({
	selector: 'app-messages',
	templateUrl: './messages.component.html',
	styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit {
	displayColumns = ['level', 'message'];

	constructor(
		public service: MessagesService
	) { }

	ngOnInit() {
	}

	clear() {
		this.service.clear();
	}
}
