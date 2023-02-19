import {MachineActionEnum} from "../machine-action-enum";
import {MachineResponse} from "./machine-response";

export interface MachineErrorResponse{
  id: number,
  message: string,
  action: MachineActionEnum,
  machine: MachineResponse,
  dateError: number
}
