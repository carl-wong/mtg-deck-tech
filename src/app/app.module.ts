import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { RestDbApiKeyInterceptor } from './interceptors/rest-db-api-key.interceptor';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { ChartCmcComponent } from './main/chart-cmc/chart-cmc.component';
import { ChartColorPieComponent } from './main/chart-color-pie/chart-color-pie.component';
import { ChartTagsComponent } from './main/chart-tags/chart-tags.component';
import { MainComponent } from './main/main.component';
import { StatsCalculatorComponent } from './main/stats-calculator/stats-calculator.component';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    ChartCmcComponent,
    ChartColorPieComponent,
    ChartTagsComponent,
    DialogAddTagComponent,
    DialogCardDetailsComponent,
    DialogManageTagsComponent,
    DialogRenameTagComponent,
    HeaderComponent,
    MainComponent,
    StatsCalculatorComponent,
    LoadingOverlayComponent,
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
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,

    ChartsModule,
    FontAwesomeModule,

    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RestDbApiKeyInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
