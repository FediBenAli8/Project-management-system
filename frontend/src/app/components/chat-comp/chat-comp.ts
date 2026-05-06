import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ReportService } from '../../services/report.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { SubTask } from '../task/task';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};
interface element {
  x: string,
  y: number[]
}


@Component({
  selector: 'app-chat-comp',
  imports: [NgApexchartsModule],
  standalone: true,
  templateUrl: './chat-comp.html',
  styleUrl: './chat-comp.css',
})
export class ChatComp implements OnInit {
  private isBrowser: boolean;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID)
    platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  chartOptions: Partial<ChartOptions> = {};

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.reportService.getSubtasks().subscribe((res: any) => {
      const statusCounts = new Map<string, number>();

      res.forEach((subtask: SubTask) => {
        const status = subtask.status || 'unknown';
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
      });

      const elements: element[] = Array.from(statusCounts.entries()).map(([status, count]) => ({
        x: status,
        y: [0, count],
      }));

      const chartOptions: Partial<ChartOptions> = {
        series: [
          {
            data: elements
          }
        ],
        chart: {
          height: 350,
          type: 'rangeBar',
          zoom: {
            enabled: false
          }
        },
        plotOptions: {
          bar: {
            isDumbbell: true,
            columnWidth: 3,
            dumbbellColors: [['#008FFB']]
          }
        },
        legend: {
          show: true,
          showForSingleSeries: true,
          position: 'top',
          horizontalAlign: 'left',
          customLegendItems: ['Number of tasks']
        },
        fill: {
          type: 'gradient',
          gradient: {
            type: 'vertical',
            gradientToColors: ['#00E396'],
            inverseColors: true,
            stops: [0, 100]
          }
        },
        grid: {
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: false
            }
          }
        },
        xaxis: {
          tickPlacement: 'on'
        }
      };

      requestAnimationFrame(() => {
        this.chartOptions = chartOptions;
        this.cdr.detectChanges();
      });
    });
  }
}
