import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { PageComponent } from './page/page.component';
import { CatalogComponent } from './catalog/catalog.component';
import { GoodComponent } from './good/good.component';
import { CartComponent } from './cart/cart.component';
import { ReviewsComponent } from './reviews/reviews.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'catalog', component: PageComponent, children: [
    {path: '', component: CatalogComponent},
    {path: ':id', component: GoodComponent}
  ]},
  {path: 'reviews', component: PageComponent, children: [{path: '', component: ReviewsComponent}]},
  {path: 'cart', component: PageComponent, children: [{path: '', component: CartComponent}]},
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }