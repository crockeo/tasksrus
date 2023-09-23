export interface Task {
  id: number,
  title: string,
  description: string,
  scheduled: string,
  completed: string | null,
}

export interface GetTaskResponse {
  task: Task,
  children: [Task],
  parents: [Task],
}

export enum Mode {
  Inbox = "Inbox",
  Today = "Today",
  Upcoming = "Upcoming",
  Anytime = "Anytime",
  Someday = "Someday",
  Logbook = "Logbook",
  Trash = "Trash",
}

export type View = Mode | number;

export function isMode(view: View): bool {
  switch (view) {
    case Mode.Inbox:
    case Mode.Today:
    case Mode.Upcoming:
    case Mode.Anytime:
    case Mode.Someday:
    case Mode.Logbook:
    case Mode.Trash:
      return true;

    default:
      return false;
  }
}
