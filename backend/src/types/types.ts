export type Role = "HR" | "TEAMLEAD" | "INTERN" | "DEVELOPER";

export type Status = "NOT_STARTED" | "HAS_STARTED" | "DONE" | "EXPIRED";

export interface Position {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  groupName?: string;
}

export interface Message {
  id: string;
  content: string;
}

export interface Comment {
  id: string;
}

export interface Intern {
  id: string;
  login: string;
  email: string;
  name: string;
  avatar?: string;
  lastOnline?: Date;
  createdAt: Date;
  positionId: string;
  mentorId?: string;
  role: Role;
  chats: Chat[];
  messages: Message[];
  comments: Comment[];
  position: Position;
  teamlead?: Teamlead;
}

export interface HR {
  id: string;
  login: string;
  email: string;
  name: string;
  avatar?: string;
  lastOnline?: Date;
  createdAt: Date;
  role: Role;
  responsibleFor: Intern[];
  chats: Chat[];
  messages: Message[];
  comments: Comment[];
}

export interface Teamlead {
  id: string;
  login: string;
  email: string;
  name: string;
  avatar?: string;
  lastOnline?: Date;
  position?: Position;
  createdAt: Date;
  role: Role;
  responsibleFor: Intern[];
  chats: Chat[];
  messages: Message[];
  comments: Comment[];
}

export interface Task {
  id: string;
  number: number;
  name: string;
  desc: string;
  deadline: Date;
  status: Status;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date;
}

export interface Stage {
  id: string;
  number: number;
  name: string;
  status: Status;
  createdAt: Date;
  startedAt: Date;
  endedAt: Date;
  tasks: Task[];
}

export interface Attachment {
  id: string;
  url: string;
  taskId: string;
}
