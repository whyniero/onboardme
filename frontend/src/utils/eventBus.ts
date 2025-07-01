import mitt from "mitt";

type Events = {
  reloadTeamleads: void;
  reloadInterns: void;
  reloadPositions: void;
  reloadStages: void;
};

export const eventBus = mitt<Events>();
