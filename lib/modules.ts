export type ModuleStatus = "ACTIVE" | "COMING_SOON";

export type DostModule = {
  id: string;
  name: string;
  description: string;
  status: ModuleStatus;
};

export const DOST_MODULES: DostModule[] = [
  {
    id: "heat-input",
    name: "Heat Input",
    description: "Current active professional welding calculator.",
    status: "ACTIVE",
  },
];