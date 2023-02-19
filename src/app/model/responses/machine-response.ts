import {MachineStatusEnum} from "../machine-status-enum";

export interface MachineResponse{
  id: number,
  name: string
  status: MachineStatusEnum,
  createdDate: number,
}
