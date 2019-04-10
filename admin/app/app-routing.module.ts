import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { AuthComponent } from './auth/auth.component';
import { CategoriesComponent } from './categories/categories.component';
import { CharsComponent } from './chars/chars.component';
import { HomeComponent } from './home/home.component';
import { GoodsComponent } from './goods/goods.component';
import { GoodComponent } from './good/good.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'admin', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'admin/auth', component: AuthComponent },
  { path: 'admin/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'admin/categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'admin/characteristics', component: CharsComponent, canActivate: [AuthGuard] },
  { path: 'admin/goods', component: GoodsComponent, canActivate: [AuthGuard] },
  { path: 'admin/reviews', component: ReviewsComponent, canActivate: [AuthGuard] },
  { path: 'admin/goods/page/:page', component: GoodsComponent, canActivate: [AuthGuard] },
  { path: 'admin/goods/good', component: GoodComponent, canActivate: [AuthGuard] },
  { path: 'admin/goods/good/:id', component: GoodComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/admin', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }