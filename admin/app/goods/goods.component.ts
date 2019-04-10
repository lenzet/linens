import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router } from '@angular/router';

import { ServerPath } from '../globals';

@Component({
  selector: 'app-goods',
  templateUrl: './goods.component.html'
})
export class GoodsComponent implements OnInit {

  constructor(private http: HttpClient,
        private route: ActivatedRoute, 
        private router: Router) { }

  public goods: any;
  public page: number;
  public prevpage: number;
  public nextpage: number;
  public maxpage: number;

  getGoods() {
    var data = {
      limit: '' + (this.page * 15 - 15)
    };
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/admin/goods', {params:params}).subscribe(data => {
      var result:any = data;
      var categories = result.categories;
      this.maxpage = Math.ceil(result.count / 15);
      this.goods = result.goods;
      this.goods.forEach(good => {
        categories.forEach(cat => {
          if (good.id == cat.id_good) {
            if (!good.cats) good.cats = [];
            good.cats.push(cat.name);
          }
        });
      });
      if (this.page > this.maxpage || this.page < 1) this.router.navigate(['admin/goods']);
    }, error => {
      console.log(error);
    });
  }
  changeAvail(id, value) {
    this.http.post(ServerPath + '/admin/goods/changeAvail', {id:id,value:value}).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  changeRate(id, value) {
    this.http.post(ServerPath + '/admin/goods/changeRate', {id:id,value:value}).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  removeGood(id) {
    if (confirm('Вы действительно хотите удалить данный товар?')) {
      this.http.post(ServerPath + '/admin/goods/remove', {id:id}).subscribe(data => {
        this.getGoods();
      }, error => {
        console.log(error);
      });
    }
  }
  ngOnInit() {
    this.route.paramMap.subscribe((params:any) => {
      this.page = params.params.page || 1;
      this.prevpage = Number(this.page) - 1;
      this.nextpage = Number(this.page) + 1;
      this.getGoods();
    });
  }

}