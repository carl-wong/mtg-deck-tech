import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTagsComponent } from './chart-tags.component';

describe('ChartTagsComponent', () => {
  let component: ChartTagsComponent;
  let fixture: ComponentFixture<ChartTagsComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ ChartTagsComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(ChartTagsComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
