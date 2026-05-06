import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineTrackingCard } from './deadline-tracking-card';

describe('DeadlineTrackingCard', () => {
  let component: DeadlineTrackingCard;
  let fixture: ComponentFixture<DeadlineTrackingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadlineTrackingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeadlineTrackingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
