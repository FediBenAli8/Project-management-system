import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPerformanceCard } from './team-performance-card';

describe('TeamPerformanceCard', () => {
  let component: TeamPerformanceCard;
  let fixture: ComponentFixture<TeamPerformanceCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPerformanceCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamPerformanceCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
