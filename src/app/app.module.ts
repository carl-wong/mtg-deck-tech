import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CallbackComponent } from './callback/callback.component';
import { DialogAddTagComponent } from './dialog-add-tag/dialog-add-tag.component';
import { DialogCardDetailsComponent } from './dialog-card-details/dialog-card-details.component';
import { DialogManageTagsComponent } from './dialog-manage-tags/dialog-manage-tags.component';
import { DialogRenameTagComponent } from './dialog-rename-tag/dialog-rename-tag.component';
import { HeaderComponent } from './header/header.component';
import { ChartCmcComponent } from './main/chart-cmc/chart-cmc.component';
import { ChartColorPieComponent } from './main/chart-color-pie/chart-color-pie.component';
import { MainComponent } from './main/main.component';
import { MessagesComponent } from './messages/messages.component';


@NgModule({
	declarations: [
		AppComponent,
		MainComponent,
		DialogAddTagComponent,
		DialogCardDetailsComponent,
		ChartCmcComponent,
		ChartColorPieComponent,
		HeaderComponent,
		CallbackComponent,
		DialogManageTagsComponent,
		DialogRenameTagComponent,
		MessagesComponent
	],
	entryComponents: [
		DialogAddTagComponent,
		DialogCardDetailsComponent,
		DialogManageTagsComponent,
		DialogRenameTagComponent,
	],
	imports: [
		MDBBootstrapModule.forRoot(),
		AppRoutingModule,
		BrowserAnimationsModule,
		BrowserModule,
		ChartsModule,
		FormsModule,
		HttpClientModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatCardModule,
		MatDialogModule,
		MatExpansionModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatMenuModule,
		MatPaginatorModule,
		MatSelectModule,
		MatSnackBarModule,
		MatTableModule,
		MatToolbarModule,
		MatTooltipModule,
		ReactiveFormsModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
