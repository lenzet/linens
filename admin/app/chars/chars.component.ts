import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

import { ServerPath } from '../globals';

@Component({
  selector: 'app-chars',
  templateUrl: './chars.component.html'
})
export class CharsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public charValueArr: Array<string> = [];
  public chars: any;
  public val: string;

  addCharValue(val) {
    this.charValueArr.push(val);
  }
  addChar(f: NgForm) {
    var formData = f.value;
    formData.values = this.charValueArr;
    if (formData.values.length < 2) {
      alert('Введите хотя бы 2 значения характеристики!')
    } else {
      this.http.post(ServerPath + '/admin/addChar', formData).subscribe(data => {
        f.reset();
        this.charValueArr = [];
        this.getChars();
      }, error => {
        console.log(error);
      });
    }
  }
  addValue(f: NgForm) {
    var formData = f.value;
    this.http.post(ServerPath + '/admin/addCharValue', formData).subscribe(data => {
      this.getChars();
    }, error => {
      console.log(error);
    });
  }
  getChars() {
    this.http.get(ServerPath + '/admin/chars').subscribe(data => {
      this.chars = data;
      this.http.get(ServerPath + '/admin/chars/values').subscribe(data => {
        var values: any = data;
        this.chars.forEach((char, idx) => {
          char.num = idx + 1;
          char.values = [];
          values.forEach((value) => {
            if (char.id == value.id_characteristics) {
              char.values.push({
                id:value.id,
                value:value.value
              });
            }
          });
        });
      }, error => {
        console.log(error);
      });
    }, error => {
      console.log(error);
    });
  }
  moveChar(num, way) {
    var i = num - 1;
    var clickedChar = {
      id: this.chars[i].id,
      name: this.chars[i].name,
      type: this.chars[i].type,
      filter: this.chars[i].filter ? 1 : 0
    };
    if (way == 'up') {
      i--;
    } else if (way == 'down') {
      i++;
    }
    var replaceChar = {
      id: this.chars[i].id,
      name: this.chars[i].name,
      type: this.chars[i].type,
      filter: this.chars[i].filter ? 1 : 0
    };
    var data = {
      clickedChar: clickedChar,
      replaceChar: replaceChar
    }
    this.http.post(ServerPath + '/admin/moveChar', data).subscribe(data => {
      this.getChars();
    }, error => {
      console.log(error);
    });
  }
  changeType(id, type) {
    var data = {id:id, type:type};
    this.http.post(ServerPath + '/admin/changeCharType', data).subscribe(data => {

    }, error => {
      console.log(error);
    });
  }
  changeFilter(id, filter) {
    var data = {id:id, filter:filter};
    this.http.post(ServerPath + '/admin/changeCharFilter', data).subscribe(data => {

    }, error => {
      console.log(error);
    });
  }
  editName(f: NgForm) {
    var formData = f.value;
    this.http.post(ServerPath + '/admin/editCharName', formData).subscribe(data => {

    }, error => {
      console.log(error);
    });
  }
  removeChar(id) {
    var data = {id:id};
    if (confirm('Вы действительно хотите удалить данную характеристику?')) {
      this.http.post(ServerPath + '/admin/removeChar', data).subscribe(data => {
        this.getChars();
      }, error => {
        console.log(error);
      });
    }
  }
  editValue(f: NgForm) {
    var formData = f.value;
    this.http.post(ServerPath + '/admin/editCharValue', formData).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  removeValue(id) {
    var data = {id:id};
    if (confirm('Вы действительно хотите удалить данное значение?')) {
      this.http.post(ServerPath + '/admin/removeCharValue', data).subscribe(data => {
        this.getChars();
      }, error => {
        console.log(error);
      });
    }
  }
  ngOnInit(){
    this.getChars();
  }

}