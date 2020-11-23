import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartColorPieComponent } from './chart-color-pie.component';

describe('ChartColorPieComponent', () => {
  let component: ChartColorPieComponent;
  let fixture: ComponentFixture<ChartColorPieComponent>;

  beforeEach(waitForAsync(() => {
	TestBed.configureTestingModule({
		declarations: [ ChartColorPieComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(ChartColorPieComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
