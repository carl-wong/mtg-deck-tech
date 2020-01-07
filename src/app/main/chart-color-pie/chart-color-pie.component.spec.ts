import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartColorPieComponent } from './chart-color-pie.component';

describe('ChartColorPieComponent', () => {
  let component: ChartColorPieComponent;
  let fixture: ComponentFixture<ChartColorPieComponent>;

  beforeEach(async(() => {
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
