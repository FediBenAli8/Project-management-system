import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfComp } from './perf-comp';

describe('PerfComp', () => {
  let component: PerfComp;
  let fixture: ComponentFixture<PerfComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfComp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfComp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
