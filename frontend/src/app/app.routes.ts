import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { ChatViewComponent } from './components/chat-view/chat-view.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'upload', component: DocumentUploadComponent, canActivate: [authGuard] },
  { path: 'chat', component: ChatViewComponent, canActivate: [authGuard] },
  { path: 'chat/:documentId', component: ChatViewComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

