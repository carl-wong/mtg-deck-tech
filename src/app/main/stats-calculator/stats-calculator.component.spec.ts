import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatsCalculatorComponent } from './stats-calculator.component';

describe('StatsCalculatorComponent', () => {
  let component: StatsCalculatorComponent;
  let fixture: ComponentFixture<StatsCalculatorComponent>;

  beforeEach(waitForAsync(() => {
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
