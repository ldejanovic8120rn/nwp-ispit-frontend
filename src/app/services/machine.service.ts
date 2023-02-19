import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {MachineStatusEnum} from "../model/machine-status-enum";
import {catchError, Observable, throwError} from "rxjs";
import {MachineResponse} from "../model/responses/machine-response";
import {MachineActionEnum} from "../model/machine-action-enum";
import {MachineErrorResponse} from "../model/responses/machine-error-response";

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  private machinesUrl = environment.machinesUrl;
  private headers = new HttpHeaders({
    'Authorization':'Bearer ' + localStorage.getItem("jwt")
  });
  constructor(private httpClient: HttpClient) { }

  getMachines(name: string, statusList: MachineStatusEnum[], dateFrom: number, dateTo: number):Observable<MachineResponse[]>{
    let params = new HttpParams();
    if(name != "")
      params = params.append("name", name);

    if(statusList.length > 0)
      params = params.append("statusList", statusList.toString());

    if(dateFrom > -1 && dateTo > -1) {
      params = params.append("dateFrom", dateFrom);
      params = params.append("dateTo", dateTo);
    }

    return this.httpClient.get<MachineResponse[]>(this.machinesUrl, {
      headers: this.headers,
      params: params
    }).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error.message));
      })
    )
  }

  createMachine(name: string):Observable<MachineResponse>{
    let url = this.machinesUrl + "/create/" + name;

    return this.httpClient.post<MachineResponse>(url,
      {},
      {
        headers: this.headers,
      }).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error.message));
      })
    );
  }

  deleteMachine(id: number):Observable<any>{
    let url = this.machinesUrl + "/delete/" + id;

    return this.httpClient.delete(url, {
      headers: this.headers
    })
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message));
        })
      );
  }

  machineActions(id: number, action: MachineActionEnum):Observable<any>{
    let url = this.machinesUrl + "/" + action.toString().toLowerCase() + "/" + id;

    return this.httpClient.post(url, {}, {
      headers: this.headers
    })
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message));
        })
      );
  }

  getMachineErrors():Observable<MachineErrorResponse[]>{
    return this.httpClient.get<MachineErrorResponse[]>(
      this.machinesUrl + "/errors",
      {headers: this.headers})
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message));
        })
      );
  }

  scheduleTask(id: number, action: MachineActionEnum, date: number):Observable<any>{
    return this.httpClient.post(this.machinesUrl + "/schedule", {
      id: id,
      scheduleDate: date,
      action: action
    }, {
      headers: this.headers
    })
      .pipe(
        catchError(err => {
          return throwError(() => new Error(err.error.message));
        })
      );
  }

}
