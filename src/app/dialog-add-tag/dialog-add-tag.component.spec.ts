import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddTagComponent } from './dialog-add-tag.component';

describe('DialogAddTagComponent', () => {
  let component: DialogAddTagComponent;
  let fixture: ComponentFixture<DialogAddTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAddTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
