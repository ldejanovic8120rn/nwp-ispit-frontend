import { Component, OnInit } from '@angular/core';
import {MachineErrorResponse} from "../../model/responses/machine-error-response";
import {MachineService} from "../../services/machine.service";

@Component({
  selector: 'app-machine-error',
  templateUrl: './machine-error.component.html',
  styleUrls: ['./machine-error.component.css']
})
export class MachineErrorComponent implements OnInit {

  machineErrors: MachineErrorResponse[] = [];

  constructor(private machineService: MachineService) { }

  ngOnInit(): void {
    this.getMachineErrors();
  }

  getMachineErrors(){
    this.machineService.getMachineErrors().subscribe((errors) => {
      this.machineErrors = errors;
    })
  }

}
