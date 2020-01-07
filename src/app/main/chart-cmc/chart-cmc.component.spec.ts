import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartCmcComponent } from './chart-cmc.component';

describe('ChartCmcComponent', () => {
  let component: ChartCmcComponent;
  let fixture: ComponentFixture<ChartCmcComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ ChartCmcComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(ChartCmcComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
