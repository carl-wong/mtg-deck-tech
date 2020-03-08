import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { environment } from '@env';
import { AuthService } from '@services/auth.service';
import { DialogManageTagsComponent } from '../dialog-manage-tags/dialog-manage-tags.component';
import { faTags, faUserCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';


@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
	faTags = faTags;
	faUserCircle = faUserCircle;
	faSignOutAlt = faSignOutAlt;

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
