import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { MainComponent } from './main/main.component';

export const AppRoutes: Routes = [
	{ path: 'main', component: MainComponent, canActivate: [AuthGuard] },
	{ path: '**', redirectTo: '/main' },
];
