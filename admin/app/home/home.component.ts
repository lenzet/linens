import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public data: any;
  public options = {
    responsive: true,
    maintainAspectRatio: false
  };
  public visitors = [];

  getVisitors() {
    this.http.get(ServerPath + '/visitors').subscribe((data:any) => {
      this.data =  {
        labels: [],
        datasets: [
          {
            label: "Посетителей",
            data: [],
            backgroundColor: '#1368a2'
          },
          {
            label: "Уникальных посетителей",
            data: [],
            backgroundColor: '#dc254c'
          }
        ]
      };
      this.visitors = data;
      this.visitors.forEach(elem => {
        this.data.labels.push(elem.visitDate);
        this.data.datasets[0].data.push(elem.visitors_count);
        this.data.datasets[1].data.push(elem.unique_visitors);

      });
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
    this.getVisitors();
  }

}