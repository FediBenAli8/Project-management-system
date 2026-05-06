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
import { SubmitSubtask } from './submit-subtask/submit-subtask';
import { Reviews } from './views/reviews/reviews';
import { memberOnlyGuard } from './guards/member-only.guard';

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
        path: 'reviews',
        component: Reviews
    },
    {
        path: 'project-detail/:id',
        component: ProjectDetail
    },
    {
        path: 'create-project',
        component: CreateProject
    },
    {
        path: 'my-task',
        component: MyTask,
        canActivate: [memberOnlyGuard]
    },
    {
        path: 'submit-subtask/:id',
        component: SubmitSubtask,
        canActivate: [memberOnlyGuard]
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
