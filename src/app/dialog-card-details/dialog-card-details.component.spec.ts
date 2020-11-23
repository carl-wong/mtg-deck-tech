import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogCardDetailsComponent } from './dialog-card-details.component';

describe('DialogCardDetailsComponent', () => {
  let component: DialogCardDetailsComponent;
  let fixture: ComponentFixture<DialogCardDetailsComponent>;

  beforeEach(waitForAsync(() => {
	TestBed.configureTestingModule({
		declarations: [ DialogCardDetailsComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(DialogCardDetailsComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
