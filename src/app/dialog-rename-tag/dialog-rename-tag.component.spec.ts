import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DialogRenameTagComponent } from './dialog-rename-tag.component';

describe('DialogRenameTagComponent', () => {
  let component: DialogRenameTagComponent;
  let fixture: ComponentFixture<DialogRenameTagComponent>;

  beforeEach(waitForAsync(() => {
	TestBed.configureTestingModule({
		declarations: [ DialogRenameTagComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(DialogRenameTagComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
