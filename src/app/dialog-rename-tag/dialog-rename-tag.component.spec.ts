import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRenameTagComponent } from './dialog-rename-tag.component';

describe('DialogRenameTagComponent', () => {
  let component: DialogRenameTagComponent;
  let fixture: ComponentFixture<DialogRenameTagComponent>;

  beforeEach(async(() => {
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
