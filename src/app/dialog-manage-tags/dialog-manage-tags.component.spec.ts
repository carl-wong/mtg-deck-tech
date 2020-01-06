import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogManageTagsComponent } from './dialog-manage-tags.component';

describe('DialogManageTagsComponent', () => {
  let component: DialogManageTagsComponent;
  let fixture: ComponentFixture<DialogManageTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogManageTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogManageTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
