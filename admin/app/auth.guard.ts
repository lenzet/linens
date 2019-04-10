import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

import { ServerPath } from './globals';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private isAdmin: boolean;

  constructor(private http: HttpClient, private router: Router) {}

  canActivate(
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.http.get(ServerPath + '/admin/isadmin').toPromise()
      .then((data:any) => {
        if (data.isAdmin) {
          return true;
        } else {
          this.router.navigate(['admin/auth']);
          return false;
        }
      })
  }
}
