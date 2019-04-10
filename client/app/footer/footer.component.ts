import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public categories: any;

  getCategories() {
    this.http.get(ServerPath + '/categories').subscribe(data => {
      this.categories = data;
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
    this.getCategories();
  }

}
