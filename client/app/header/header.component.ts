import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { ServerPath } from '../globals';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  constructor(private http: HttpClient,
        private cookieService: CookieService,
        private router: Router) { }

  public cart: any;
  public totalPrice: number;
  public showCart: boolean;
  public search: string;
  public windowWidth: number;
  public showNav: boolean;

  setShowCart() {
    var cart:any = this.cookieService.get('cart');
    if (cart && !this.showCart) {
      this.showCart = true;
    } else {
      this.showCart = false;
    }
  }
  catalogSearch() {
    var navigationExtras: NavigationExtras = {
      queryParams: {}
    };
    navigationExtras.queryParams.search = this.search;
    this.router.navigate(['/catalog'], navigationExtras);
  }
  getCart() {
    var cart:any = this.cookieService.get('cart');
    var data = {id:[]};

    if (!cart) return;

    cart = JSON.parse(cart);
    cart.goods.forEach(good => {
      data.id.push(+good.id);
    });
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/cartGoods', {params:params}).subscribe((data:any) => {
      this.cart = data;
      this.cart.forEach(good => {
        cart.goods.forEach(elem => {
          if (good.id == elem.id) {
            good.count = elem.count;
          }
          if (good.saleprice && good.salewsprice) {
            good.price = good.saleprice;
            good.wsprice = good.salewsprice;
          }
        });
      });
      this.countTotalPrice();
    }, error => {
      console.log(error);
    });
  }
  countTotalPrice() {
    this.totalPrice = 0;
    this.cart.forEach(good => {
      if (good.count < good.wscount || !good.wscount) {
        this.totalPrice += good.price * good.count;
      } else {
        this.totalPrice += good.wsprice * good.count;
      }
    });
  }
  cartCountChange(id, count) {
    var cart:any = this.cookieService.get('cart');
    cart = JSON.parse(cart);
    cart.goods.forEach(good => {
      if (good.id == id) {
        good.count = count;
      }
    });
    cart = JSON.stringify(cart);
    this.cookieService.set('cart', cart, 60, '/');
    this.countTotalPrice();
  }
  removeGoodFromCart(id) {
    var cart:any = this.cookieService.get('cart');
    cart = JSON.parse(cart);
    cart.goods.forEach((elem, idx, arr) => {
      if (elem.id == id) {
        arr.splice(idx, 1);
      }
    });
    if (cart.goods.length == 0) {
      this.cookieService.delete('cart', '/');
      this.cart = [];
      this.totalPrice = 0;
      this.showCart = false;
    } else {
      cart = JSON.stringify(cart);
      this.cookieService.set('cart', cart, 60, '/');
    }
    this.getCart();
  }
  onResize(e) {
    this.windowWidth = e.target.innerWidth;
  }
  ngOnInit() {
    this.windowWidth = document.documentElement.clientWidth;
    this.getCart();
    window.onload = () => {
      $('.cssload-container').fadeOut();
      $('body').addClass('no-preloader');
    }
  }

}
