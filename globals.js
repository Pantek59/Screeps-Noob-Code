delayPathfinding = 2;
delayRoomScanning = 50;
RESOURCE_SPACE = "space";

playerUsername = "Pantek59";
allies = ["king_lispi", "Tanjera", "Atavus", "BlackLotus", "Atlan", "Moria", "Ashburnie", "seancl", "Finndibaen"];

var mineralDescription = function(mineral) {
    this.id = mineral.id;
    this.tier = mineral.tier;
};

mineralDescriptions = [
    new mineralDescription({
        id: "H",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "O",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "U",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "K",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "L",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "Z",
        tier: 1,
        component1: false,
        component2: false
    }),

    new mineralDescription({
        id: "X",
        tier: 1,
        component1: false,
        component2: false
    }),
];