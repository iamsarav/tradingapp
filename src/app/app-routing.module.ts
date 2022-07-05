
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { DefaultComponent } from './default.component';

const routes: Routes = [
  {path: '',
    component: DefaultComponent,
    pathMatch: 'full'
  },
  {
    path: 'deafult',
    component: DefaultComponent
  },
  { path: '**', redirectTo: 'deafult' }
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class AppRoutingModule { }
