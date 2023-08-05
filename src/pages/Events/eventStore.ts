import { AccessLevel } from "@/typings/AccessLevel";
import { Community } from "@/typings/Community";
import { CommunityEvent } from "@/typings/CommunityEvent";
import { Game } from "@/typings/Game";
import { Session } from "@/typings/Session";
import { reactive } from "vue";

interface EventStore {
  event?: CommunityEvent;
  community?: Community;
  eventAccessPolicies?: AccessLevel[];
  eventGames?: (Game & { sessions: Session[] })[];
}

const DEFAULT_EVENT_STATE: EventStore = {};

export let eventStore = reactive<EventStore>({
  ...DEFAULT_EVENT_STATE,
});

export function clearEventStore() {
  eventStore = reactive<EventStore>({
    ...DEFAULT_EVENT_STATE,
  });
}
