export type Status = "NOT_STARTED" | "HAS_STARTED" | "DONE" | "EXPIRED";
export type Role = "HR" | "TEAMLEAD" | "INTERN";

export interface Position {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Teamlead {
  id: string;
  login: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  lastOnline?: Date;
  role: "TEAMLEAD";
  responsibleFor: Intern[];
  createdAt: Date;
}

export interface Intern {
  id: string;
  login: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  lastOnline?: Date;
  role: "INTERN";
  positionId?: string;
  mentorId?: string;
  position?: Position;
  teamlead?: Teamlead;
  createdAt: Date;
}

export interface Stage {
  id: string;
  number: number;
  name: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: Status;
  tasks: Task[];
  teamleadId: string;
  internId: string;
  createdBy: Teamlead;
  createdFor: Intern;
}

export interface Task {
  id: string;
  number: number;
  name: string;
  desc: string;
  deadline: Date;
  status: Status;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  attachments?: Attachment[];
  comments: Comment[];
  stageId: String;
  stage: Stage;
}

export interface Attachment {
  id: string;
  url: string;
  taskId: string;
  task: Task;
}
