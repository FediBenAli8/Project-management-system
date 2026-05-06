import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
import { ReportService } from '../../services/report.service'
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

@Component({
  selector: 'app-perf-comp',
  imports: [ChartComponent, NgApexchartsModule],
  standalone: true,
  templateUrl: './perf-comp.html',
  styleUrl: './perf-comp.css',
})
export class PerfComp implements OnInit {
  private isBrowser: boolean;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID)
    platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  users: string[] = [];
  countTasks: number[] = [];
  weights: number[] = [];
  chartOptions: Partial<ChartOptions> = {};
  taskDoneChartOptions: Partial<ChartOptions> = {};

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    this.reportService.getTeamPerformance().subscribe((res: any) => {
      this.users = res.map((item: any) => item.user_name);
      this.countTasks = res.map((item: any) => item.task_count);
      this.weights = res.map((item: any) => item.weight_percentage);
      console.log(this.users);
      console.log(this.countTasks);
      console.log(this.weights);

      const chartOptions: Partial<ChartOptions> = {
        series: [{ name: 'Task Count', data: this.countTasks }],
        chart: { type: 'bar', height: 350, toolbar: { show: false } },
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: 'end',
            horizontal: true,
          }
        },
        xaxis: { categories: this.users },
        yaxis: { labels: { formatter: (value: any) => value } },
        title: { text: 'Task Distribution by User' },
        subtitle: { text: 'Task Count by User' },
        dataLabels: { enabled: true, style: { colors: ['#000000'] } },
        fill: { colors: ['#3ba4c4ff'] },
        legend: { show: true },
        grid: { borderColor: '#f5f5f5', row: { colors: ['transparent'] } },
      };

      const taskDoneChartOptions: Partial<ChartOptions> = {
        series: this.countTasks,
        chart: { type: 'donut', height: 350 },
        labels: this.users,
        title: { text: 'Tasks Done by User' },
        subtitle: { text: 'Completed workload amount' },
        dataLabels: {
          enabled: true,
          formatter: (_value: number, options: any) => {
            return `${options.w.config.series[options.seriesIndex]} tasks`;
          },
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
        },
        plotOptions: {
          pie: {
            donut: {
              size: '62%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total Tasks',
                  formatter: () => `${this.countTasks.reduce((sum, count) => sum + count, 0)}`,
                },
              },
            },
          },
        },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        tooltip: {
          y: {
            formatter: (value: number) => `${value} tasks`,
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: { height: 320 },
              legend: { position: 'bottom' },
            },
          },
        ],
      };

      requestAnimationFrame(() => {
        this.chartOptions = chartOptions;
        this.taskDoneChartOptions = taskDoneChartOptions;
        this.cdr.detectChanges();
      });
    });
  }


}
