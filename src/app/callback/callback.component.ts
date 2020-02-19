import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';


@Component({
	selector: 'app-callback',
	templateUrl: './callback.component.html',
	styleUrls: ['./callback.component.less']
})
export class CallbackComponent implements OnInit {

	constructor(private auth: AuthService) { }

	ngOnInit() {
		this.auth.handleAuthCallback();
	}

}
