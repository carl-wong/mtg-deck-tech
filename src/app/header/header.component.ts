import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from '@env';
import { faSignOutAlt, faTags, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { DialogManageTagsComponent } from '../dialog-manage-tags/dialog-manage-tags.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
})
export class HeaderComponent implements OnInit {
  public faTags = faTags;
  public faUserCircle = faUserCircle;
  public faSignOutAlt = faSignOutAlt;

  public lastUpdated = '';
  public buildVersion = '';

  constructor(
    public auth: AuthService,
    private dialog: MatDialog,
  ) { }

  public ngOnInit(): void {
    this.lastUpdated = environment.timestamp;
    this.buildVersion = environment.version;
  }

  public logout(): void {
    this.auth.logout({ returnTo: document.location.origin });
  }

  public openDialogManageTags(): void {
    const dConfig = new MatDialogConfig();

    dConfig.autoFocus = false;
    dConfig.disableClose = false;

    dConfig.minWidth = '80vw';

    this.dialog.open(DialogManageTagsComponent, dConfig);
  }
}
