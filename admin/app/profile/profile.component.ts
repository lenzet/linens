import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  public changeShow: boolean = false;
  public changedShow: boolean = false;

  onSubmit(f: NgForm) {
    var formData = f.value;
    if (formData.newPass != formData.confirmPass) {
      alert('Пароли не совпадают!');
      return;
    }
    this.http.post(ServerPath + '/admin/changePass', formData).subscribe((data:any) => {
      if (data && data.text == 'wrong') {
        alert('Неверный пароль!');
      } else {
        f.reset();
        this.changeShow = false;
        this.changedShow = true;
        setTimeout(() => {this.changedShow = false;}, 3000);
      }
    }, error => {
      console.log(error);
    });
  }
  logout() {
    this.http.get(ServerPath + '/admin/logout').subscribe((data:any) => {
      this.router.navigate(['/admin/auth']);
    }, error => {
      console.log(error);
    });
  }
  ngOnInit() {
  }

}
