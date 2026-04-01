import { Routes } from '@angular/router';
import { Dashboard } from './views/dashboard/dashboard';
import { ProjectDetail } from './views/project-detail/project-detail';
import { Login } from './login/login';
import { Register } from './views/register/register';
import { Profile } from './views/profile/profile';
import { Report } from './views/report/report';
import { CreateProject } from './create-project/create-project';
import { MyTask } from './my-task/my-task';
import { ProjectList } from './project-list/project-list';
import { TaskDetails } from './task-details/task-details';
import { TeamManagement } from './team-management/team-management';

export const routes: Routes = [
    {
        path: '',
        component: Dashboard
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'profile',
        component: Profile
    },
    {
        path: 'report',
        component: Report
    },
    {
        path: 'project-detail',
        component: ProjectDetail
    },
    {
        path: 'create-project',
        component: CreateProject
    },
    {
        path: 'my-task',
        component: MyTask
    },
    {
        path: 'project-list',
        component: ProjectList
    },
    {
        path: 'task-details',
        component: TaskDetails
    },
    {
        path: 'team-management',
        component: TeamManagement
    }
];
