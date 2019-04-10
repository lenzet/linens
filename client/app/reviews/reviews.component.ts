import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public preloader: boolean = true;
  public categories: any;
  public reviews: any = [];
  public reviewsElse: boolean;
  public limit = 0;

  getReviews() {
    var data = {limit: this.limit + ''};
    var params = new HttpParams({
      fromObject: data
    });
    this.http.get(ServerPath + '/reviewsList', {params: params}).subscribe((data:any) => {
      this.reviews = this.reviews.concat(data.reviews);
      this.reviewsElse = data.reviewsElse;
      this.limit += 4;
      this.preloader = false;
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
    window.scroll(0, 0);
    this.getReviews();
  }

}