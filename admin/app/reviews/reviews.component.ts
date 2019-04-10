import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

import { ServerPath, PathToAssets } from '../globals';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  public pathToAssets = PathToAssets;
  public selectedFile: File = null;
  public image: string;
  public filePath: string;
  public imageLeftPx: string;
  public imageLeftPc: string;
  public labelClickable: boolean = true;
  public reviews: any;

  onFileSelected(event, item?) {
    var formFile = new FormData();
    var name: string;
    var path: string;

    if (<File>event.target.files[0]) {
      this.selectedFile = <File>event.target.files[0];
    } else {
      return;
    }
    if (item) {
      let ext = this.selectedFile.name.substr(this.selectedFile.name.lastIndexOf('.'));
      name = item.id + ext;
      path = ServerPath + '/admin/editReviewImg';
    } else {
      name = this.selectedFile.name;
      path = ServerPath + '/admin/addReviewImg';
    }
    formFile.append('image', this.selectedFile, name);
    this.http.post(path, formFile).subscribe((data:any) => {
      if (!item) {
        this.image = data.img + '?' + new Date().getTime();
        this.filePath = data.path;
        this.imageLeftPx = '0';
      } else {
        item.img += '?' + new Date().getTime();
        item.position_px = '0';
        item.position_pc = '0';
        this.editImagePosition(item);
      }
    }, error => {
      console.log(error);
    });
  }
  imgMouseDown(e, item?) {
    var elem = e.path[0];
    var pageX = e.pageX;
    var left = parseInt(elem.style.left, 10);
    var minLeft = 200 - elem.offsetWidth;
    var self: any = this;
    elem.ondragstart = function() {
      return false;
    };
    document.onmousemove = function(e) {
      self.labelClickable = false;
      move(e);
    }
    elem.onmouseup = elem.onmouseout = function() {
      document.onmousemove = null;
      elem.onmouseup = null;
      if (item) self.editImagePosition(item);
      setTimeout(()=>{self.labelClickable=true;},1);
    }
    function move(e) {
      var setLeft = (left || 0) + (e.pageX - pageX);
      if (setLeft > minLeft && setLeft < 0 && !item) {
        self.imageLeftPx = setLeft;
        self.imageLeftPc = Math.round(setLeft / elem.parentElement.offsetWidth * 100);
      } else if (setLeft > minLeft && setLeft < 0 && item) {
        item.position_px = setLeft;
        item.position_pc = Math.round(setLeft / elem.parentElement.offsetWidth * 100);
      }
    }
  }
  labelClick(e) {
    if (!this.labelClickable) e.preventDefault();
  }
  onSubmit(f: NgForm) {
    var formData = f.value;
    formData.filePath = this.filePath;
    formData.imageLeftPx = this.imageLeftPx;
    formData.imageLeftPc = this.imageLeftPc;
    this.http.post(ServerPath + '/admin/addReview', formData).subscribe(data => {
      this.getReviews();
      f.reset();
      this.selectedFile = null;
      this.filePath = '';
      this.imageLeftPx = '';
      this.imageLeftPc = '';
    }, error => {
      console.log(error);
    });
  }
  getReviews() {
    this.http.get(ServerPath + '/admin/reviews').subscribe((data:any) => {
      this.reviews = data;
    }, error => {
      console.log(error);
    });
  }
  editName(id, name) {
    var data = {
      id: id,
      name: name
    };
    this.http.post(ServerPath + '/admin/editReviewName', data).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  editLink(id, link) {
    var data = {
      id: id,
      link: link
    };
    this.http.post(ServerPath + '/admin/editReviewLink', data).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  editText(id, text) {
    var data = {
      id: id,
      text: text
    };
    this.http.post(ServerPath + '/admin/editReviewText', data).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  editImagePosition(item) {
    var data = {
      id: item.id,
      position_px: item.position_px,
      position_pc: item.position_pc
    };
    this.http.post(ServerPath + '/admin/editReviewImagePosition', data).subscribe(data => {
      
    }, error => {
      console.log(error);
    });
  }
  removeReview(id, img) {
    if (confirm('Вы действительно хотите удалить данный отзыв?')) {
      this.http.post(ServerPath + '/admin/removeReview', {id:id,img:img}).subscribe(data => {
        this.getReviews();
      }, error => {
        console.log(error);
      });
    }
  }
  ngOnInit() {
    this.getReviews();
  }

}