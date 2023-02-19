import {Component, OnInit, ViewChild} from '@angular/core';
import {MachineActionEnum} from "../../model/machine-action-enum";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {MachineService} from "../../services/machine.service";
import {RoleEnum} from "../../model/role-enum";
import {PopupComponent} from "../popup/popup.component";

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  machineId: number = -1;
  machineName: string = "";
  allowedActions: MachineActionEnum[] = [];

  @ViewChild(PopupComponent)
  popupComponent!: PopupComponent;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private userService: UserService, private machineService: MachineService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.machineId = +params['machineId'];  //+?
      this.machineName = params['machineName'];
    });

    this.getAllowedActions();
  }

  getAllowedActions(){
    if(this.userService.checkUserRole(RoleEnum.CAN_START_MACHINE)){
      this.allowedActions.push(MachineActionEnum.START);
    }
    if(this.userService.checkUserRole(RoleEnum.CAN_STOP_MACHINE)){
      this.allowedActions.push(MachineActionEnum.STOP);
    }
    if(this.userService.checkUserRole(RoleEnum.CAN_RESTART_MACHINE)){
      this.allowedActions.push(MachineActionEnum.RESTART);
    }
  }

  returnToMachines(){
    this.router.navigate(['/machines']);
  }

  scheduleTask(){
    let scheduleDate = document.getElementById('date-schedule') as HTMLInputElement;
    let scheduleTime = document.getElementById('time-schedule') as HTMLInputElement;

    if(!isNaN(scheduleDate.valueAsNumber) && !isNaN(scheduleTime.valueAsNumber)){
      let date = new Date(scheduleDate.value + " " + scheduleTime.value);
      let timestamp = date.getTime();

      let action = this.getSelectedAction();

      this.machineService.scheduleTask(this.machineId, action, timestamp).subscribe({
        complete: () => {
          this.returnToMachines();
        },
        error: (error) => {
          this.openPopup("Error!", error.message);
        },
        next: () => {
        }
      });
    }
    else {
      this.openPopup("Error!", "Date and time must be selected.");
    }
  }

  private openPopup(title: string, message: string) {
    this.popupComponent.title = title;
    this.popupComponent.message = message;
    this.popupComponent.displayStyle="block";
  }

  private getSelectedAction():MachineActionEnum{
    let e = (document.getElementById("action-select")) as HTMLSelectElement;
    let selected = e.selectedIndex;
    return <MachineActionEnum>e.options[selected].value;
  }

}
