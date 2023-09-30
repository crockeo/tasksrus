import {
  ArchiveBoxIcon,
  CalendarDaysIcon,
  CircleStackIcon,
  InboxIcon,
  StarIcon,
  DocumentCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Mode } from "./types.ts";

export function getIconForMode(mode: Mode) {
  switch (mode) {
    case Mode.Inbox:
      return <InboxIcon className="text-blue-500" />;

    case Mode.Today:
      return <StarIcon className="text-yellow-500" />;

    case Mode.Upcoming:
      return <CalendarDaysIcon className="text-red-500" />;

    case Mode.Anytime:
      return <CircleStackIcon className="text-teal-500" />;

    case Mode.Someday:
      return <ArchiveBoxIcon className="text-amber-200" />;

    case Mode.Logbook:
      return <DocumentCheckIcon className="text-green-500" />;

    case Mode.Trash:
      return <TrashIcon className="text-neutral-300" />;
  }
  throw Error(`Invalid mode: ${mode}`);
}
