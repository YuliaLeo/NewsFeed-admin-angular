import {Injectable} from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {Category, OperationResponse} from "../../interfaces";
import {SharedCategoriesService} from "../services/shared-categories.service";

@Injectable({
  providedIn: 'root'
})
export class SharedCategoriesResolver implements Resolve<OperationResponse<Category[]>> {
  constructor(
    private _sharedCategoriesService: SharedCategoriesService,
    private _router: Router
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OperationResponse<Category[]>> {
    return this._sharedCategoriesService.updateCategoryList();
  }
}
