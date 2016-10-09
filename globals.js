//blacklotus: W24S52, W26S51
delayPathfinding = 4;
delayRoomScanning = 50;
RESOURCE_SPACE = "space";
TERMINAL_PACKETSIZE = 500; //Size of packets in resource balancing system
RBS_PACKETSIZE = 2000;
CPU_THRESHOLD = 1000;

playerUsername = "Pantek59";
allies = ["king_lispi", "Tanjera", "Atavus", "BlackLotus", "Atlan", "Moria", "Ashburnie", "seancl", "Finndibaen", "klapaucius", "Hachima"];
myRooms = _.filter(Game.rooms, {controller: { owner: { username: playerUsername}}});

mineralDescriptions = {};
mineralDescriptions.H = {tier: 0, component1: false, component2: false };
mineralDescriptions.O = {tier: 0, component1: false, component2: false };
mineralDescriptions.U = {tier: 0, component1: false, component2: false };
mineralDescriptions.K = {tier: 0, component1: false, component2: false };
mineralDescriptions.L = {tier: 0, component1: false, component2: false };
mineralDescriptions.Z = {tier: 0, component1: false, component2: false };
mineralDescriptions.G = {tier: 2, component1: "ZK", component2: "UL" };
mineralDescriptions.X = {tier: 0, component1: false, component2: false };
mineralDescriptions.OH = {tier: 1, component1: "O", component2: "H" };
mineralDescriptions.UH = {tier: 1, component1: "U", component2: "H", bodyPart: ATTACK};
mineralDescriptions.UO = {tier: 1, component1: "U", component2: "O", bodyPart: WORK};
mineralDescriptions.UL = {tier: 1, component1: "U", component2: "L" };
mineralDescriptions.KH = {tier: 1, component1: "K", component2: "H", bodyPart: CARRY};
mineralDescriptions.KO = {tier: 1, component1: "K", component2: "O", bodyPart:RANGED_ATTACK};
mineralDescriptions.LH = {tier: 1, component1: "L", component2: "H", bodyPart: WORK };
mineralDescriptions.LO = {tier: 1, component1: "L", component2: "O", bodyPart: HEAL };
mineralDescriptions.ZH = {tier: 1, component1: "Z", component2: "H", bodyPart: WORK };
mineralDescriptions.ZO = {tier: 1, component1: "Z", component2: "O", bodyPart: MOVE };
mineralDescriptions.ZK = {tier: 1, component1: "Z", component2: "K" };
mineralDescriptions.GH = {tier: 1, component1: "G", component2: "H", bodyPart: WORK };
mineralDescriptions.GO = {tier: 1, component1: "G", component2: "O", bodyPart: TOUGH };
mineralDescriptions.UH2O = {tier: 2, component1: "UH", component2: "OH", bodyPart: ATTACK };
mineralDescriptions.UHO2 = {tier: 2, component1: "UO", component2: "OH", bodyPart: WORK };
mineralDescriptions.KH2O = {tier: 2, component1: "KH", component2: "OH", bodyPart: CARRY };
mineralDescriptions.KHO2 = {tier: 2, component1: "KO", component2: "OH", bodyPart: RANGED_ATTACK };
mineralDescriptions.LH2O = {tier: 2, component1: "LH", component2: "OH", bodyPart: WORK };
mineralDescriptions.LHO2 = {tier: 2, component1: "LO", component2: "OH", bodyPart: HEAL };
mineralDescriptions.ZH2O = {tier: 2, component1: "ZH", component2: "OH", bodyPart: WORK };
mineralDescriptions.ZHO2 = {tier: 2, component1: "ZO", component2: "OH", bodyPart: MOVE };
mineralDescriptions.GH2O = {tier: 2, component1: "GH", component2: "OH", bodyPart: WORK };
mineralDescriptions.GHO2 = {tier: 2, component1: "GO", component2: "OH", bodyPart: TOUGH };
mineralDescriptions.XUH2O = {tier: 3, component1: "X", component2: "UH2O", bodyPart: ATTACK };
mineralDescriptions.XUHO2 = {tier: 3, component1: "X", component2: "UHO2", bodyPart: WORK };
mineralDescriptions.XKH2O = {tier: 3, component1: "X", component2: "KH2O", bodyPart: CARRY };
mineralDescriptions.XKHO2 = {tier: 3, component1: "X", component2: "KHO2", bodyPart: RANGED_ATTACK };
mineralDescriptions.XLH2O = {tier: 3, component1: "X", component2: "LH2O", bodyPart: WORK };
mineralDescriptions.XLHO2 = {tier: 3, component1: "X", component2: "LHO2", bodyPart: HEAL };
mineralDescriptions.XZH2O = {tier: 3, component1: "X", component2: "ZH2O", bodyPart: WORK };
mineralDescriptions.XZHO2 = {tier: 3, component1: "X", component2: "ZHO2", bodyPart: MOVE };
mineralDescriptions.XGH2O = {tier: 3, component1: "X", component2: "GH2O", bodyPart: WORK };
mineralDescriptions.XGHO2 = {tier: 3, component1: "X", component2: "GHO2", bodyPart: TOUGH };

isHostile = function (creep) {
    if (allies.indexOf(creep.owner.username) == -1 && creep.owner.username != playerUsername) {
        //Not own and not allied creep
        return true;
    }
    else {
        return false;
    }
};