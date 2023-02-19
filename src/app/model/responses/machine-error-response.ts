import {MachineActionEnum} from "../machine-action-enum";
import {MachineResponse} from "./machine-response";

export interface MachineErrorResponse{
  id: number,
  message: string,
  action: MachineActionEnum,
  dateError: number,
  machine: MachineResponse
}
