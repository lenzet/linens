import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { ServerPath } from '../globals';
declare var $: any;

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html'
})
export class PageComponent implements OnInit {

  constructor(private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router) { }

  public goods: any;
  public goodId: number;
  public windowWidth: number;
  public title: string;
  public mainClass: string;
  public categories: any;
  public sale: boolean;
  public wholesale: boolean;
  public category: number;
  public search: string;
  public from: string;
  public to: string;
  public filters: any;
  public stringFilters: string;
  public goodsElse: boolean;
  public showPageNav: boolean;

  changeShowPageNav(value) {
    this.showPageNav = value;
    if (value) {
      $('body').css('overflow-y', 'hidden');
    } else {
      $('body').css('overflow-y', 'auto');
    }
  }
  getCategories() {
    this.http.get(ServerPath + '/categories').subscribe(data => {
      this.categories = data;
    }, error => {
      console.log(error);
    });
  }
  getFilters() {
    this.http.get(ServerPath + '/filters').subscribe(data => {
      var result:any = data;
      result.filters.forEach(filter => {
        filter.values = [];
        result.values.forEach(value => {
          if (filter.id == value.id_characteristics) {
            filter.values.push(value);
          }
        });
      });
      this.filters = result.filters;
    }, error => {
      console.log(error);
    });
  }
  applyFilters() {
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

    var stringFilters = '';
    this.filters.forEach(filter => {
      var push = '';
      filter.values.forEach(value => {
        if (value.checked && !push) {
          push = filter.id + '-' + value.id + ',';
        } else if (value.checked && push) {
          push += value.id + ',';
        }
      });
      push = push.slice(0, -1);
      if (push) stringFilters += push + 'and';
    });
    stringFilters = stringFilters.slice(0, -3);
    if (stringFilters) navigationExtras.queryParams.filters = stringFilters;
    this.router.navigate([path], navigationExtras);
  }
  getGoods() {
    this.http.get(ServerPath + '/popularGoods').subscribe(data => {
      this.goods = data;
    }, error => {
      console.log(error);
    });
  }
  stop(e) {
    e.stopPropagation();
  }
  onResize(e) {
    this.windowWidth = e.target.innerWidth;
    if (this.windowWidth >= 992) {
      $('body').css('overflow-y', 'auto');
      this.showPageNav = false;
    }
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.category = +params.category;
      this.search = params.search;
      this.from = params.from;
      this.to = params.to;
      this.stringFilters = params.filters;
      this.sale = params.sale || false;
      this.wholesale = params.wholesale || false;
    });
    this.route.paramMap.subscribe((params:any) => {
      this.goodId = params.params.id;
    });
    this.getCategories();
    this.getFilters();
    this.getGoods();
    switch (this.router.url) {
      case '/catalog':
        this.title = 'Каталог товаров';
        this.mainClass = 's-catalog-main';
        break;
      case '/reviews':
        this.title = 'Отзывы клиентов';
        this.mainClass = 's-reviews';
        break;
      case '/cart':
        this.title = 'Корзина';
        this.mainClass = 's-cart';
        break;
      default:
        this.title = 'Каталог товаров';
        this.mainClass = 's-catalog-main';
        break;
    }
    this.windowWidth = document.documentElement.clientWidth;
  }

}