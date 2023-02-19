import {Component, OnInit, ViewChild} from '@angular/core';
import {MachineStatusEnum} from "../../model/machine-status-enum";
import {PopupComponent} from "../popup/popup.component";
import {MachineResponse} from "../../model/responses/machine-response";
import {MachineService} from "../../services/machine.service";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {RoleEnum} from "../../model/role-enum";
import * as SockJS from "sockjs-client";
import {environment} from "../../../environments/environment";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {MachineActionEnum} from "../../model/machine-action-enum";

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.css']
})
export class MachinesComponent implements OnInit {

  machines: MachineResponse[] = [];
  canCreate: boolean = false;
  canDestroy: boolean = false;
  canStart: boolean = false;
  canStop: boolean = false;
  canRestart: boolean = false;

  machineName: string = "";
  statusList: MachineStatusEnum[] = [];
  dateFrom: number = -1;
  dateTo: number = -1;

  createMachineName: string = "";

  // @ts-ignore
  stompClient: CompatClient;

  @ViewChild(PopupComponent)
  popupComponent!: PopupComponent;

  constructor(private machineService: MachineService, private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.getMachines();
    this.checkAllRoles();
    this.connectToSocket();
  }

  checkAllRoles(){
    this.canCreate = this.userService.checkUserRole(RoleEnum.CAN_CREATE_MACHINE);
    this.canDestroy = this.userService.checkUserRole(RoleEnum.CAN_DESTROY_MACHINE);
    this.canStart = this.userService.checkUserRole(RoleEnum.CAN_START_MACHINE);
    this.canStop = this.userService.checkUserRole(RoleEnum.CAN_STOP_MACHINE);
    this.canRestart = this.userService.checkUserRole(RoleEnum.CAN_RESTART_MACHINE);
  }

  getMachines(){
    this.machineService.getMachines(this.machineName, this.statusList, this.dateFrom, this.dateTo).subscribe({
      complete: () => {
        this.statusList = [];
        this.dateTo = -1;
        this.dateFrom = -1;
        this.machineName = "";
        this.clearChecked();
      },
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: (machines) => {
        this.machines = machines;
      }
    });
  }

  connectToSocket(){
    let jwt = localStorage.getItem("jwt");
    const socket = new SockJS(environment.wsUrl + "?jwt=" + jwt);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, this.onConnect.bind(this));
  }

  onConnect(){
    let email = this.userService.getUserEmail();
    if(email != null){
      this.stompClient.subscribe('/machine-fe/' + email, this.changeMachines.bind(this));
    }
  }

  changeMachines(machineMessage: any){
    let machine = JSON.parse(machineMessage.body);
    for(let m of this.machines){
      if(m.id == machine.id){
        m.status = machine.status;
      }
    }
  }

  searchMachines(){
    let stopped = document.getElementById('stopped-check') as HTMLInputElement;
    let running = document.getElementById('running-check') as HTMLInputElement;
    if(stopped.checked){
      this.statusList.push(MachineStatusEnum.STOPPED);
    }
    if(running.checked){
      this.statusList.push(MachineStatusEnum.RUNNING);
    }

    let dateFrom = document.getElementById('date-from') as HTMLInputElement;
    let dateTo = document.getElementById('date-to') as HTMLInputElement;
    if(dateTo.value || dateFrom.value){
      if(!isNaN(dateFrom.valueAsNumber) && !isNaN(dateTo.valueAsNumber)){
        this.dateFrom = dateFrom.valueAsNumber;
        this.dateTo = dateTo.valueAsNumber;
      }
      else {
        this.openPopup("Error!", "Both dates must be selected.");
      }
    }

    this.getMachines();
  }

  createMachine(){
    this.machineService.createMachine(this.createMachineName).subscribe({
      complete: () => {
        this.createMachineName = ""
      },
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: (machine) => {
        this.machines.push(machine);
      }
    });
  }

  deleteMachine(machineId: number){
    this.machineService.deleteMachine(machineId).subscribe({
      complete : () => {},
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: () => {
        for(let i = 0; i < this.machines.length; i++){
          if(this.machines[i].id == machineId){
            this.machines.splice(i, 1);
            break;
          }
        }
      }
    });
  }

  startMachine(machineId: number){
    this.machineService.machineActions(machineId, MachineActionEnum.START).subscribe({
      complete: () => {
      },
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: () => {
      }
    });
  }

  stopMachine(machineId: number){
    this.machineService.machineActions(machineId, MachineActionEnum.STOP).subscribe({
      complete: () => {
      },
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: () => {
      }
    });
  }

  restartMachine(machineId: number){
    this.machineService.machineActions(machineId, MachineActionEnum.RESTART).subscribe({
      complete: () => {
      },
      error: (error) => {
        this.openPopup("Error!", error.message);
      },
      next: () => {
      }
    });
  }

  isStopped(status: MachineStatusEnum): boolean{
    return status == MachineStatusEnum.STOPPED;
  }

  private openPopup(title: string, message: string) {
    this.popupComponent.title = title;
    this.popupComponent.message = message;
    this.popupComponent.displayStyle="block";
  }

  private clearChecked(){
    let stopped = document.getElementById('stopped-check') as HTMLInputElement;
    let running = document.getElementById('running-check') as HTMLInputElement;

    stopped.checked = false;
    running.checked = false;
  }

  openSchedule(machineId: number, machineName: string){
    this.router.navigate(['/schedule', machineId, machineName]);
  }

}
