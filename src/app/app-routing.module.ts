import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { CallbackComponent } from './callback/callback.component';
import { MainComponent } from './main/main.component';


const routes: Routes = [
	{ path: '', component: MainComponent, canActivate: [AuthGuard] },
	{ path: 'callback', component: CallbackComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
