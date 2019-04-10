import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

import { ServerPath, PathToAssets } from '../globals';
declare var $: any;

interface GoodLayout {
  id: number,
  name: string;
  price: string;
  wscheck?: boolean;
  salecheck?: boolean;
  selectedCats: any;
  wsprice?: string;
  wscount?: number;
  saleprice?: string;
  salewsprice?: string;
  avail: number;
  addedFields?: any;
  descr: string;
  inputImages: any;
  chars: any;
}

@Component({
  selector: 'app-good',
  templateUrl: './good.component.html'
})
export class GoodComponent implements OnInit {

  constructor(private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute) { }

  public categories: any;
  public chars: any;
  public selectedCats = [];
  public catListShow: boolean = false;
  public addedFields = [];
  public selectedFiles: any;
  public inputImages = [];
  public relatedList = [];
  public selectedRelated = [];
  public limit = 0;
  public search = '';
  public goodsElse = false;
  public pathToAssets = PathToAssets;
  public imageClickable: boolean = true;
  public good: GoodLayout = {
    id: undefined,
    name: '',
    price: '',
    wscheck: false,
    salecheck: false,
    selectedCats: [],
    wsprice: '',
    wscount: 10,
    saleprice: '',
    salewsprice: '',
    avail: 1,
    addedFields: [],
    descr: '',
    inputImages: [],
    chars: []
  };
  
  onFileSelected(event) {
    var formFile = new FormData();
    var images;
    this.selectedFiles = <FileList>event.target.files;
    for (var i = 0; i < this.selectedFiles.length; i++) {
      formFile.append('images[]', this.selectedFiles[i], this.selectedFiles[i].name);
    }
    this.http.post(ServerPath + '/admin/addGoodImg', formFile).subscribe(data => {
      images = data;
      images = images.paths;
      images.forEach((elem, idx) => {
        this.good.inputImages.push({img:elem, num:idx})
      });
      this.initFancy();
    }, error => {
      console.log(error);
    });
  }
  checkImg(item) {
    var checked = item.checked;
    this.good.inputImages.forEach((elem) => {
      delete elem.checked;
    });
    if (!checked) item.checked = true;
  }
  removeImg(img) {
    var data = {img:img};
    this.http.post(ServerPath + '/admin/removeGoodImg', data).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
    this.good.inputImages.forEach((elem, idx) => {
      if (elem.img == img) {
        this.good.inputImages.splice(idx, 1);
        this.good.inputImages.forEach((elem, idx) => {
          elem.num = idx;
        });
      }
    });
  }
  moveImg(clicked, move) {
    var clickedImg = {};
    for (var key in this.good.inputImages[clicked]) {
      clickedImg[key] = this.good.inputImages[clicked][key];
    }
    this.good.inputImages[clicked] = this.good.inputImages[move];
    this.good.inputImages[move] = clickedImg;
    this.good.inputImages.forEach((elem, idx) => {
      elem.num = idx;
    });
  }
  imgMouseDown(e, item) {
    var elem = e.path[0];
    var pageX = e.pageX;
    var left = parseInt(elem.style.left, 10);
    var minLeft = 240 - elem.offsetWidth;
    var self = this;
    elem.ondragstart = function() {
      return false;
    };
    document.onmousemove = function(e) {
      self.imageClickable = false;
      move(e);
    }
    elem.onmouseup = elem.onmouseout = function() {
      document.onmousemove = null;
      elem.onmouseup = null;
      setTimeout(()=>{self.imageClickable=true;},1);
    }
    function move(e) {
      var setLeft = (left || 0) + (e.pageX - pageX);
      if (setLeft > minLeft && setLeft < 0) {
        item.leftPx = setLeft;
        item.leftPc = Math.round(setLeft / elem.parentElement.parentElement.offsetWidth * 100);
      }
    }
  }
  imageClick(e) {
    if (!this.imageClickable) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  getCategories() {
    this.http.post(ServerPath + '/admin/getCategories', {}).subscribe(data => {
      this.categories = data;
    }, error => {
      console.log(error);
    });
  }
  selectCat(e, id, name, cat) {
    e.stopPropagation();
    if (!cat.selected) {
      this.good.selectedCats.push({id:id, name:name});
      cat.selected = true;
    } else {
      cat.selected = false;
      this.good.selectedCats.forEach((elem, idx) => {
        if (elem.id == id) {
          this.good.selectedCats.splice(idx, 1);
        }
      });
    }
  }
  removeSelectedCat(e, id) {
    e.stopPropagation();
    this.good.selectedCats.forEach((elem, idx) => {
      if (elem.id == id) {
        this.good.selectedCats.splice(idx, 1);
      }
    });
    this.categories.forEach((elem, idx) => {
      if (elem.id == id) {
        elem.selected = false;
      }
    });
  }
  getChars() {
    this.http.get(ServerPath + '/admin/chars').subscribe(data => {
      this.good.chars = data;
      this.http.get(ServerPath + '/admin/chars/values').subscribe(data => {
        var values:any = data;
        this.good.chars.forEach((char, idx) => {
          char.values = [];
          values.forEach((value) => {
            if (char.id == value.id_characteristics) {
              char.values.push({id:value.id, value:value.value});
            }
          });
        });
        if (this.good.id) {
          this.getGoodValues();
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }
  addField() {
    this.good.addedFields.push({});
  }
  getGoods(clear?, emptySelected?) {
    var data:any = {};
    if (clear) {
      this.relatedList = [];
      this.limit = 0;
    }
    data = {
      id: this.good.id || undefined,
      limit: this.limit,
      search: this.search,
      selected: [],
      emptySelected: emptySelected || false
    };
    this.selectedRelated.forEach(elem => {
      data.selected.push(elem.id);
    });
    this.http.post(ServerPath + '/admin/related', data).subscribe((data:any) => {
      this.relatedList = this.relatedList.concat(data.goods);
      this.selectedRelated = this.selectedRelated[0] ? this.selectedRelated : data.added || [];
      this.goodsElse = data.else;
      this.limit += 10;
    }, error => {
      console.log(error);
    });
  }

  selectRelated() {
    for (var i = 0; i < this.relatedList.length; i++) {
      if (this.relatedList[i].checked) {
        this.selectedRelated.push({
          id: this.relatedList[i].id,
          name: this.relatedList[i].name
        });
        this.relatedList.splice(i, 1);
        i--;
      }
      this.limit = 0;
    }
  }
  unselectRelated() {
    for (var i = 0; i < this.selectedRelated.length; i++) {
      if (this.selectedRelated[i].checked) {
        this.selectedRelated.splice(i, 1);
        i--;
      }
    }
    this.search = '';
    if (this.selectedRelated.length == 0) {
      this.getGoods(true, true);
    } else {
      this.getGoods(true);
    }
  }
  submitGood() {
    var data = {
      id: this.good.id || undefined,
      name: this.good.name,
      categories: [],
      price: this.good.price,
      wscount: this.good.wscheck ? this.good.wscount : '',
      wsprice: this.good.wscheck ? this.good.wsprice : '',
      saleprice: this.good.salecheck ? this.good.saleprice : '',
      salewsprice: this.good.salecheck && this.good.wscheck ? this.good.salewsprice : '',
      avail: this.good.avail,
      chars: [],
      specChars: this.good.addedFields,
      descr: this.good.descr,
      related: [],
      img: []
    };
    this.good.selectedCats.forEach((elem) => {
      data.categories.push(elem.id);
    });
    this.good.chars.forEach((elem) => {
      if (elem.type == 'single') {
        data.chars.push(elem.checkedValue);
      } else if (elem.type == 'few') {
        elem.values.forEach((value) => {
          if (value.checked) {
            data.chars.push(value.id);
          }
        });
      }
    });
    this.good.inputImages.forEach((elem) => {
      interface ImgLayout {
        name: string;
        leftPx?: string;
        leftPc?: string;
        checked?: number;
      }
      var img: ImgLayout = {name: ''};
      img.name = elem.img;
      if (elem.leftPx && elem.leftPc) {
        img.leftPx = elem.leftPx + '';
        img.leftPc = elem.leftPc + '';
      } else {
        img.leftPc = '';
        img.leftPx = '';
      }
      if (elem.checked) {
        img.checked = 1;
      } else {
        img.checked = 0;
      }
      data.img.push(img);
    });
    this.selectedRelated.forEach(elem => {
      data.related.push(elem.id);
    });
    if ( required(this) ) {
      this.http.post(ServerPath + '/admin/submitGood', data).subscribe(data => {
        this.router.navigate(['admin/goods']);
      }, error => {
        console.log(error);
      });
    }
    function required(self) {
      if (!data.name) {
        alert('Введите имя товара!');
        return false;
      } else if (!data.categories[0]) {
        alert('Выберите категорию товара!');
        return false;
      } else if (!data.price) {
        alert('Введите цену товара!');
        return false;
      } else if (self.good.wscheck && !data.wscount) {
        alert('Введите оптовое количество!');
        return false;
      } else if (self.good.wscheck && !data.wsprice) {
        alert('Введите оптовую цену!');
        return false;
      } else if (self.good.salecheck && !data.saleprice) {
        alert('Введите цену со скидкой!');
        return false;
      } else if (self.good.salecheck && self.good.wscheck && !data.salewsprice) {
        alert('Введите оптовую цену со скидкой!');
        return false;
      } else if (!data.descr) {
        alert('Введите описание товара!');
        return false;
      } else if (!data.img[0]) {
        alert('Загрузите хотя бы одно изображение товара!');
        return false;
      }
      var unselected: boolean = false;
      for (var i = 0; i < self.good.chars.length; i++) {
        if (self.good.chars[i].type == 'single' && !self.good.chars[i].checkedValue) {
          alert('Заполните все характеристики!');
          return false;
        } else if (self.good.chars[i].type == 'few') {
          unselected = true;
          for (var k = 0; k < self.good.chars[i].values.length; k++) {
            if (self.good.chars[i].values[k].checked) {
              unselected = false;
            }
          }
          if (unselected) {
            alert('Заполните все характеристики!');
          return false;
          }
        }
      }
      data.specChars.forEach(elem => {
        if ((!elem.name && elem.value) || (elem.name && !elem.value)) {
          alert('Заполните все характеристики!');
          unselected = true;
        }
      });
      if (unselected) return false;
      var checked: boolean;
      data.img.forEach(elem => {
        if (elem.checked && !checked) checked = true;
      });
      if (!checked) {
        alert('Выберите изображение обложки товара!');
        return false;
      }
      return true;
    }
  }

  getGoodValues() {
    var data = {id: '' + this.good.id};
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/admin/goodValues', {}).subscribe(data => {
      var result: any = data;
      var good = result.good[0];
      var values = result.values;
      var images = result.images;
      this.good.selectedCats = result.categories;
      this.categories.forEach(cat => {
        this.good.selectedCats.forEach(selectedCat => {
          if (cat.id == selectedCat.id) {
            cat.selected = true;
          }
        });
      });
      this.good.name = good.name;
      this.good.price = good.price;
      if (good.wscount && good.wsprice) {
        this.good.wscheck = true;
        this.good.wscount = good.wscount;
        this.good.wsprice = good.wsprice;
      }
      if (good.saleprice && good.salewsprice) {
        this.good.salecheck = true;
        this.good.saleprice = good.saleprice;
        this.good.salewsprice = good.salewsprice;
      }
      this.good.avail = good.avail;
      this.good.descr = good.descr;
      this.good.chars.forEach(char => {
        values.forEach(value => {
          if (char.id == value.id_characteristics && char.type == 'single') {
            char.checkedValue = value.id;
          }
          if (char.id == value.id_characteristics && char.type == 'few') {
            char.values.forEach(checkbox => {
              if (checkbox.id == value.id) {
                checkbox.checked = true;
              }
            });
          }
        });
      });
      this.good.addedFields = result.specChars;
      images.forEach(elem => {
        var img = {
          img: elem.img,
          num: elem.num,
          leftPx: elem.position_px,
          leftPc: elem.position_pc,
          checked: elem.cover ? true : false
        };
        this.good.inputImages.push(img);
      });
      this.initFancy();;
    }, error => {
      console.log(error);
    });
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
  ngOnInit() {
    window.scroll(0, 0);
    this.route.paramMap.subscribe(params => {
      var parameter:any = params;
      if (parameter.params.id) {
        this.good.id = parameter.params.id;
      }
    });
    this.getCategories();
    this.getChars();
    this.getGoods();
  }

}