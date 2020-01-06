import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogManageTagsComponent } from '../dialog-manage-tags/dialog-manage-tags.component';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

	constructor(
		public auth: AuthService,
		private dialog: MatDialog,
	) { }

	ngOnInit() {
	}

	openDialogManageTags() {
		const dConfig = new MatDialogConfig();

		dConfig.autoFocus = false;
		dConfig.disableClose = false;

		dConfig.minWidth = '80vw';

		this.dialog.open(DialogManageTagsComponent, dConfig);
	}
}
