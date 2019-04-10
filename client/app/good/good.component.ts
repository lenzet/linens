import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';

import { ServerPath } from '../globals';
declare var $: any;

interface GoodLayout {
  id?: number,
  name?: string;
  price?: string;
  categories?: Array<any>;
  images?: Array<any>;
}

@Component({
  selector: 'app-good',
  templateUrl: './good.component.html'
})
export class GoodComponent implements OnInit {

  constructor(private http: HttpClient,
          private router: Router,
          private route: ActivatedRoute,
          private cookieService: CookieService) { }

  public good:any = {};
  public cart:any;
  public categories: any;
  public filters: any;

  getGood() {
    var data = {id:this.good.id};
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/good', {params:params}).subscribe((data:any) => {
      this.good = data;
      this.good.count = 1;
      this.good.categories[this.good.categories.length - 1].last = true;
      this.imgSlider();
    }, error => {
      console.log(error);
    });
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
        if (good.count > this.good.avail) good.count = this.good.avail;
        inCart = true;
      }
    });
    if (!inCart && count > this.good.avail) {
      cart.goods.push({id: id, count: this.good.avail});
    } else if (!inCart && count <= this.good.avail) {
      cart.goods.push({id: id, count: count});
    }
    cart = JSON.stringify(cart);
    this.cookieService.set('cart', cart, 60, '/');
    item.added = true;
    setTimeout(() => {
      item.added = false;
    }, 200);
  }
  stop(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  plusRate() {
    this.http.post(ServerPath + '/plusRate', {id:this.good.id}).subscribe((data:any) => {
      
    }, error => {
      console.log(error);
    });
  }
  imgSlider() {
    $(document).ready(() => {
      $('.mini-slider').owlCarousel({
        items: 3,
        margin: 5,
        nav: false,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        autoplay: false
      });
      $('.related-slider').owlCarousel({
        responsive: {
          0: {
            items: 1
          },
          480: {
            items: 1
          },
          500: {
            items: 2
          },
          1200: {
            items: 3
          }
        },
        margin: 20,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        autoplay: true,
        autoplayHoverPause: true,
        autoplayTimeout: 3000
      });
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
  ngOnInit() {
    window.scrollTo(0, 0);
    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    });
    this.route.paramMap.subscribe((params:any) => {
      this.good.id = params.params.id;
      this.getGood();
    });
    $(window).scroll(function(){
      scrollAnimate('.related-slider .item', 'zoomIn');
    });
    function scrollAnimate(selector, animation, px?) {
      var px = px || 100;
      if (document.documentElement.clientWidth >= 768) {
        $(selector).each(function(){
          if (!$(this).hasClass('animateStop')) {
            var pos = $(this).offset().top;
            var topScroll = $(window).scrollTop();
            var height = document.documentElement.clientHeight;
            $(this).css('visibility','hidden');
            if (pos < topScroll + height - px) {
              $(this).css('visibility', 'visible');
              $(this).addClass('animated').addClass(animation).addClass('animateStop');
            }
          }
        });
      } else {
        $(selector).css('visibility','visible');
      }
    }
  }

}
