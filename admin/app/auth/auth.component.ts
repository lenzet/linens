import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit(f: NgForm) { 
    var formData = f.value;
    this.http.post(ServerPath + '/admin/login', formData).subscribe(data => {
      this.router.navigate(['admin']);
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
  }

}
