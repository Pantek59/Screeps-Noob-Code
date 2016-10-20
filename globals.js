moveReusePath = function() {
    let minTicks = 10, maxTicks = 60;
    let range = maxTicks - minTicks;

    return minTicks + Math.floor((1 - (Game.cpu.bucket / 10000)) * range);
};

DELAYPATHFINDING = moveReusePath();
DELAYMARKETAUTOSELL = 31;
DELAYMARKETBUY = 5;
DELAYFLAGCOLORS = 31;
DELAYRESOURCEBALANCING = 27;
DELAYROOMSCANNING = 50;
DELAYPANICFLAG = 5;
DELAYSPAWNING = 13;
DELAYLINK = 3;
DELAYPRODUCTION = 25;
DELAYLAB = 10;
RESOURCE_SPACE = "space";
TERMINAL_PACKETSIZE = 500; //Size of packets in resource balancing system
TERMINALMAXFILLING = 290000;
RBS_PACKETSIZE = 2000;
CPU_THRESHOLD = 2500;

playerUsername = "Pantek59";
allies = ["king_lispi", "Tanjera", "Atavus", "BlackLotus", "Atlan", "Moria", "Ashburnie", "seancl", "Finndibaen", "klapaucius", "Hachima"];
myroomlist = _.filter(Game.rooms, {controller: { owner: { username: playerUsername}}});
myRooms = {};
for (let m in myroomlist) {
    myRooms[myroomlist[m].name] = myroomlist[m];
}

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

buildingPlans = {
    miniharvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        }],

    remoteHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 400,
            body: [MOVE, MOVE, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 2050,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    harvester: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 350,
            body: [MOVE, MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1250,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    energyTransporter: [
        {
            //Level 1 (max 300)
            minEnergy: 250,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    stationaryHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 950,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 950,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 950,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 950,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 950,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    upgrader: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3250,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    repairer: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    builder: [
        {
            //Level 1 (max 300)
            minEnergy: 200,
            body: [MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    wallRepairer: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, WORK, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1550,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1900,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    claimer: [
        {
            //Level 1 (max 300)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [CLAIM, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1300,
            body: [CLAIM, CLAIM, MOVE, MOVE]
        }],

    bigClaimer: [
        {
            //Level 1 (max 300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 2 (max 550)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 3 (max 800)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3250,
            body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE]
        }],

    protector: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 520,
            body: [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 3 (max 800)
            minEnergy: 780,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1690,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1950,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1950,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1950,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        }],

    miner: [
        {
            //Level 1 (max 300)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 2200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    distributor: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1200,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    scientist: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 450,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 750,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    demolisher: [
        {
            //Level 1 (max 300)
            minEnergy: 250,
            body: [MOVE, MOVE, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1150,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    remoteStationaryHarvester: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, WORK, WORK, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 550,
            body: [MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 700,
            body: [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY]
        }],

    energyHauler: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, WORK, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 650,
            body: [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1100,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    transporter: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
        },
        {
            //Level 2 (max 550)
            minEnergy: 500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 5 (max 1800)
            minEnergy: 1350,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 2500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 2500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        }],

    attacker: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 390,
            body: [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 3 (max 800)
            minEnergy: 800,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1350,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 6 (max 2300)
            minEnergy: 2270,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 3040,
            body: [TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]
        }],

    healer: [
        {
            //Level 1 (max 300)
            minEnergy: 300,
            body: [MOVE, HEAL]
        },
        {
            //Level 2 (max 550)
            minEnergy: 300,
            body: [MOVE, HEAL]
        },
        {
            //Level 3 (max 800)
            minEnergy: 600,
            body: [MOVE, MOVE, HEAL, HEAL]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1300,
            body: [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 6 (max 2100)
            minEnergy: 2270,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 5400,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 7500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        }],

    einarr: [
        {
            //Level 1 (max 300)
            minEnergy: 260,
            body: [MOVE, MOVE, ATTACK, ATTACK]
        },
        {
            //Level 2 (max 550)
            minEnergy: 490,
            body: [TOUGH, MOVE, MOVE, MOVE, ATTACK, HEAL]
        },
        {
            //Level 3 (max 800)
            minEnergy: 790,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, HEAL, HEAL]
        },
        {
            //Level 4 (max 1300)
            minEnergy: 1290,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL]
        },
        {
            //Level 5 (max 1750)
            minEnergy: 1500,
            body: [MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 6 (max 2100)
            minEnergy: 1910,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 7 (max 5600)
            minEnergy: 5220,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        },
        {
            //Level 8 (max 12900)
            minEnergy: 5220,
            body: [TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
        }]
};