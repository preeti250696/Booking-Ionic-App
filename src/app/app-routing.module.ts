import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path:'',
    redirectTo:'places',
    pathMatch: 'full'
  },
  {
    path:'places',
    loadChildren: './places/places.module#PlacesPageModule', canLoad: [AuthGuard]
  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
  { path: 'bookings', loadChildren: './bookings/bookings.module#BookingsPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
