import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComp } from './chat-comp';

describe('ChatComp', () => {
  let component: ChatComp;
  let fixture: ComponentFixture<ChatComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatComp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
