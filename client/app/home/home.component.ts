import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { ServerPath } from '../globals';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private cookieService: CookieService) { }

  public popup: any = false;
  public categories: any;
  public goods: any;

  getCategories() {
    this.http.get(ServerPath + '/homeCategories').subscribe(data => {
      this.categories = data;
      this.initCatSlider();
    }, error => {
      console.log(error);
    });
  }
  getGoods() {
    this.http.get(ServerPath + '/homeGoods').subscribe(data => {
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
      this.initGoodsSlider();
    }, error => {
      console.log(error);
    });
  }
  stop(e) {
    e.stopPropagation();
    e.preventDefault();
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
        if (good.count > item.avail) good.count = item.avail;
        inCart = true;
      }
    });
    if (!inCart && count > item.avail) {
      cart.goods.push({id: id, count: item.avail});
    } else if (!inCart && count <= item.avail) {
      cart.goods.push({id: id, count: count});
    }
    cart = JSON.stringify(cart);
    this.cookieService.set('cart', cart, 60, '/');
    item.added = true;
    setTimeout(() => {
      item.added = false;
    }, 200);
  }
  onSubmit(f: NgForm) { 
    var formData = f.value;
    this.http.post(ServerPath + '/callme', formData).subscribe(data => {
      f.reset();
      this.popup = true;
      setTimeout(() => {
        this.popup = false;
      }, 3000);
    }, error => {
      console.log(error);
    });
  }
  initCatSlider() {
    $(document).ready(() => {
      $('.catalog-slider').owlCarousel({
        responsive: {
          0: {
            items: 1
          },
          480: {
            items: 2
          },
          768: {
            items: 3
          },
          1200: {
            items: 4
          }
        },
        margin: 20,
        nav: true,
        autoplayHoverPause: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>']
      });
    });
  }
  initGoodsSlider() {
    $(document).ready(() => {
      $('.added-slider').owlCarousel({
        responsive: {
          0: {
            items: 1
          },
          480: {
            items: 2
          },
          768: {
            items: 3
          },
          1200: {
            items: 4
          }
        },
        margin: 20,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        loop: false
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
    this.getCategories();
    this.getGoods();
    window.onload = () => {
      $('.cssload-container').fadeOut();
      $('body').addClass('no-preloader');
    }
    $('.home-slider').owlCarousel({
      items: 1,
      loop: true,
      mouseDrag: false,
      touchDrag: false,
      dots: true,
      smartSpeed: 1800,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true
    });
    $('.about-slider').owlCarousel({
      items: 1,
      loop: true,
      smartSpeed: 700,
      nav: false,
      dots: true,
      margin: 50,
      autoplay: true,
      autoplayTimeout: 5000
    });

    $(window).scroll(function(){
      scrollAnimate('.s-about-us .text', 'fadeInRight');
      scrollAnimate('.about-slider', 'zoomIn');
      scrollAnimate('.added-slider .item', 'zoomIn');
      scrollAnimate('.catalog-slider .item', 'zoomIn');
      scrollAnimate('.achieve', 'flipInX');
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