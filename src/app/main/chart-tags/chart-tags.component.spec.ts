import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartTagsComponent } from './chart-tags.component';

describe('ChartTagsComponent', () => {
  let component: ChartTagsComponent;
  let fixture: ComponentFixture<ChartTagsComponent>;

  beforeEach(waitForAsync(() => {
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
