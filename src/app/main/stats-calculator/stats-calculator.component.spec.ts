import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCalculatorComponent } from './stats-calculator.component';

describe('StatsCalculatorComponent', () => {
  let component: StatsCalculatorComponent;
  let fixture: ComponentFixture<StatsCalculatorComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ StatsCalculatorComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(StatsCalculatorComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
