import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { iMessage, MessageLevel, MessagesService } from '@services/messages.service';
import { Subscription } from 'rxjs';


@Component({
	selector: 'app-messages',
	templateUrl: './messages.component.html',
	styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit, OnDestroy {
	displayColumns = ['level', 'timestamp', 'text'];
	dataSource: MatTableDataSource<iMessage>;

	private _addedMessage: Subscription;
	private _messages: iMessage[] = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;

	constructor(
		private service: MessagesService,
	) {
	}

	ngOnInit() {
		this._addedMessage = this.service.addedMessage$.subscribe(message => {
			if (message.level !== MessageLevel.Init) {
				this._messages.push(message);
				this._refreshTable();
			}
		});
	}

	ngOnDestroy() {
		this._addedMessage.unsubscribe();
	}

	private _refreshTable() {
		this.dataSource = new MatTableDataSource(this._messages);
		this.dataSource.paginator = this.paginator;
	}

	clear() {
		this._messages = [];
		this._refreshTable();
	}
}
