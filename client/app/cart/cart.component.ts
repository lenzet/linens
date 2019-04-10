import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';
import { Router } from "@angular/router";

import { ServerPath } from '../globals';
declare var $: any;


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {

  constructor(private http: HttpClient,
        private cookieService: CookieService,
        private router: Router) { }

  public preloader: boolean = true;
  public popup: boolean = false;
  public categories: any;
  public cart: any = [];
  public totalPrice: number;

  getCart() {
    var cart:any = this.cookieService.get('cart');
    var data = {id:[]};

    if (!cart) {
      this.preloader = false;
      return;
    }
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
      this.preloader = false;
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
    } else {
      cart = JSON.stringify(cart);
      this.cookieService.set('cart', cart, 60, '/');
    }
    this.getCart();
  }
  onSubmit(f: NgForm) { 
    var formData = f.value;
    var html = '<table cellspacing="0" style="text-align:center">';
    html += '<tr>';
    html += '<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">Товар</td>';
    html += '<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">Цена</td>';
    html += '<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">Количество</td>';
    html += '<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">Итого</td>';
    html += '</tr>';
    this.cart.forEach(elem => {
      html += '<tr>'
      html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px"><a href="http://localhost:4201/catalog/${elem.id}" target="_blank">${elem.name}</a></td>`;
      if (elem.wscount && elem.count < elem.wscount || !elem.wscount) {
        html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${elem.price}р.</td>`;
      } else if (elem.wscount && elem.count >= elem.wscount) {
        html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${elem.wsprice}р.</td>`;
      }
      html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${elem.count}</td>`;
      if (elem.wscount && elem.count < elem.wscount || !elem.wscount) {
        html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${elem.price * elem.count}р.</td>`;
      } else if (elem.wscount && elem.count >= elem.wscount) {
        html += `<td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${elem.wsprice * elem.count}р.</td>`;
      }
      html += '</tr>';
    });
    html += `<tr><td style="border: none; padding: 10px 20px" colspan="2"></td>
         <td style="border: #d2d2d2 solid 1px; padding: 10px 20px">Всего:</td>
         <td style="border: #d2d2d2 solid 1px; padding: 10px 20px">${this.totalPrice}р.</td></tr>`;
    html += '</table>';
    formData.html = html;
    this.http.post(ServerPath + '/checkout', formData).subscribe(data => {
      this.cookieService.delete('cart', '/');
      f.reset();
      this.cart = [];
      this.popup = true;
      setTimeout(() => {
        this.popup = false;
      }, 3000);
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
    window.scroll(0,0);
    this.getCart();
  }

}