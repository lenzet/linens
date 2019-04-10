import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { ServerPath } from '../globals';
declare var $:any;

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {

  constructor(private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private cookieService: CookieService) { }

  public preloader: boolean = true;
  public goods: any = [];
  public sale: boolean;
  public wholesale: boolean;
  public category: number;
  public search: string;
  public from: string;
  public to: string;
  public stringFilters: string;
  public page: string;
  public goodsElse: boolean;

  getGoods() {
    window.scroll(0, 0);
    this.preloader = true;
    var data:any = {};
    data.sale = this.sale || '';
    data.wholesale = this.wholesale || '';
    data.category = this.category || '';
    data.search = this.search || '';
    data.from = this.from || '';
    data.to = this.to || '';
    data.filters = [];
    data.page = this.page || '';
    if (this.stringFilters) {
      var filters:any = this.stringFilters.split('and');
      filters.forEach(elem => {
        var push:any = {};
        var parsed = elem.split('-');
        push.id_char = parsed[0];
        push.values = parsed[1].split(',');
        data.filters.push(push);
      });
    }
    data.filters = data.filters || '';
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/goods', {params: data}).subscribe(data => {
      var result:any = data;
      result.goods.forEach(good => {
        good.img = [];
        result.images.forEach((img, idx) => {
          if (good.id == img.id_good && !img.cover) {
            good.img.push(img);
          }
          if (good.id == img.id_good && img.cover) {
            good.cover = {};
            good.cover.src = img.id + img.img;
            good.cover.left = img.position_pc + '%';
          }
        });
      });
      this.goods = result.goods;
      this.preloader = false;
      this.goodsElse = result.goodsElse;
      this.initFancy();
    }, error => {
      console.log(error);
    });
  }
  getPage(page) {
    this.goods = [];
    var navigationExtras: NavigationExtras = {
      queryParams: {}
    };
    var path = '/catalog';

    if (this.category) navigationExtras.queryParams.category = this.category;
    if (this.search) navigationExtras.queryParams.search = this.search;
    if (this.from) navigationExtras.queryParams.from = this.from;
    if (this.to) navigationExtras.queryParams.to = this.to;
    if (this.sale) navigationExtras.queryParams.sale = this.sale;
    if (this.wholesale) navigationExtras.queryParams.wholesale = this.wholesale;
    if (this.stringFilters) navigationExtras.queryParams.stringFilters = this.stringFilters;
    navigationExtras.queryParams.page = page;

    this.router.navigate([path], navigationExtras);
  }
  putGoodInCart(id, count = 1, item?) {
    var cart:any = this.cookieService.get('cart');
    var emptyCart = {
      goods: []
    };
    var inCart: boolean;

    cart = cart ? JSON.parse(cart) : emptyCart;
    cart.goods.forEach(good => {
      if (good.id == id) {
        good.count += count;
        inCart = true;
      }
    });
    if (!inCart) cart.goods.push({id: id, count: count});
    cart = JSON.stringify(cart);
    this.cookieService.set('cart', cart);
    item.added = true;
    setTimeout(() => {
      item.added = false;
    }, 200);
  }
  stop(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  ngOnInit() {
    this.goods = [];
    this.route.queryParams.subscribe(params => {
      this.category = +params.category;
      this.search = params.search;
      this.from = params.from;
      this.to = params.to;
      this.stringFilters = params.filters;
      this.sale = params.sale || false;
      this.wholesale = params.wholesale || false;
      this.page = params.page || 1;
      this.getGoods();
    });
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
    $('body').css('overflow-y', 'auto');
  }
  initFancy() {
    $(document).ready(() => {
      $('.fancybox').fancybox({
        loop: true,
        buttons: ['close'],
        clickContent: function(current, event) {
          return current.type === 'image' ? 'next' : false;
        },
        i18n : {
          'en' : {
            CLOSE       : 'Закрыть',
            NEXT        : 'Вперед',
            PREV        : 'Назад',
            ERROR       : 'Произошла ошибка! <br/> Попробуйте позднее.',
            PLAY_START  : 'Слайдшоу',
            PLAY_STOP   : 'Остановить',
            FULL_SCREEN : 'На весь экран',
            THUMBS      : 'Миниатюры'
          }
        }
      });
    });
  }

}