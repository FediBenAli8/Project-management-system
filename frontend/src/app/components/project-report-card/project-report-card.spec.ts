import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReportCard } from './project-report-card';

describe('ProjectReportCard', () => {
  let component: ProjectReportCard;
  let fixture: ComponentFixture<ProjectReportCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReportCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectReportCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
