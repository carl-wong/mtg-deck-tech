import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { environment } from '@env';
import { AuthService } from '@services/auth.service';
import { DialogManageTagsComponent } from '../dialog-manage-tags/dialog-manage-tags.component';


@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
	lastUpdated = '';
	buildVersion = '';

	constructor(
		public auth: AuthService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
		this.lastUpdated = environment.timestamp;
		this.buildVersion = environment.version;
	}

	openDialogManageTags() {
		const dConfig = new MatDialogConfig();

		dConfig.autoFocus = false;
		dConfig.disableClose = false;

		dConfig.minWidth = '80vw';

		this.dialog.open(DialogManageTagsComponent, dConfig);
	}
}
