import { Routes } from '@angular/router';
import { Dashboard } from './views/dashboard/dashboard';
import { ProjectDetail } from './views/project-detail/project-detail';
import { Register } from './views/register/register';

export const routes: Routes = [
    {
        path: '',
        component: Dashboard
    },

    // ✅ Project detail with parameter
    {
        path: 'project-detail',
        component: ProjectDetail
    }

];
