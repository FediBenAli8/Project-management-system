import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuleUploader } from './fule-uploader';

describe('FuleUploader', () => {
  let component: FuleUploader;
  let fixture: ComponentFixture<FuleUploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuleUploader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuleUploader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
