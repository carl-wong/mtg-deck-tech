import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { iMessage, MessageLevel, MessagesService } from '@services/messages.service';
import { Subscription } from 'rxjs';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';


@Component({
	selector: 'app-messages',
	templateUrl: './messages.component.html',
	styleUrls: ['./messages.component.less']
})
export class MessagesComponent implements OnInit, OnDestroy {
	faTrashAlt = faTrashAlt;
	
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
		this._addedMessage = this.service.addedMessage$.subscribe((message: iMessage) => {
			if (message.level !== MessageLevel.Init) {
				this._messages.splice(0, 0, message);
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
