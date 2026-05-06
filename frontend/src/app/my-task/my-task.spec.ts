import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTask } from './my-task';

describe('MyTask', () => {
  let component: MyTask;
  let fixture: ComponentFixture<MyTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
