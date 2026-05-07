import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedStructure } from './suggested-structure';

describe('SuggestedStructure', () => {
  let component: SuggestedStructure;
  let fixture: ComponentFixture<SuggestedStructure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedStructure]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestedStructure);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
