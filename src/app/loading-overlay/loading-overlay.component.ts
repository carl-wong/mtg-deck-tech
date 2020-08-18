import { Component, OnInit } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { SingletonService } from '@services/singleton.service';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.less']
})
export class LoadingOverlayComponent implements OnInit {
  public isLoading = false;
  faSpinner = faSpinner;

  constructor(private singleton: SingletonService) { }

  ngOnInit(): void {
    this.singleton.isLoading$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

}
