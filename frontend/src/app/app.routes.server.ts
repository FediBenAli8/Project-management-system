import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'profile',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'report',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'project-detail',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'create-project',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'my-task',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'project-list',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'task-details',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'team-management',
    renderMode: RenderMode.Prerender
  }
];
