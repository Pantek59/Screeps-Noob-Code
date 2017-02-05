module.exports = {
    // manages spawning in indicated room
    run: function (spawnRoom) {
        let globalSpawningStatus = 0;
        let cpuStart = Game.cpu.getUsed();

        for (var s in spawnRoom.memory.roomArray.spawns) {
            var testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
            if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                globalSpawningStatus++;
            }
        }

        if (globalSpawningStatus == 0) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.homeroom == spawnRoom.name && (c.ticksToLive > (c.body.length*3) - 3 || c.spawning == true));

        //Check for sources & minerals
        let numberOfSources = spawnRoom.memory.roomArray.sources.length;
        let numberOfExploitableMineralSources = spawnRoom.memory.roomArray.extractors.length;
        let roomMineralType;

        //Check mineral type of the room
        if (numberOfExploitableMineralSources > 0) {
            // Assumption: There is only one mineral source per room
            let mineral = Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]);
            if (mineral != undefined) {
                roomMineralType = mineral.mineralType;
            }
        }

        // Define spawn minima
        let minimumSpawnOf = {};
        //Volume defined by flags
        minimumSpawnOf["remoteHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["bigClaimer"] = 0;
        minimumSpawnOf["protector"] = 0;
        minimumSpawnOf["stationaryHarvester"] = 0;
        minimumSpawnOf["remoteStationaryHarvester"] = 0;
        minimumSpawnOf["demolisher"] = 0;
        minimumSpawnOf["distributor"] = 0;
        minimumSpawnOf["energyHauler"] = 0;
        minimumSpawnOf["attacker"] = 0;
        minimumSpawnOf["healer"] = 0;
        minimumSpawnOf["einarr"] = 0;
        minimumSpawnOf["archer"] = 0;
        minimumSpawnOf["scientist"] = 0;
        minimumSpawnOf["transporter"] = 0;
        minimumSpawnOf["SKHarvester"] = 0;
        minimumSpawnOf["SKHauler"] = 0;

        let myFlags = _.filter(Game.flags,{ memory: { spawn: spawnRoom.memory.masterSpawn}});
        let vacantFlags = [];
        for (let flag in myFlags) {
            var mem = myFlags[flag].memory;
            var vol = mem.volume;
            switch (mem.function) {
                case "transporter":
                    minimumSpawnOf.transporter += vol;
                    break;
                case 'demolish':
                    minimumSpawnOf.demolisher += vol;
                    break;
                case 'protector':
                    minimumSpawnOf.protector += vol;
                    break;
                case 'remoteSource':
                    minimumSpawnOf.remoteHarvester += vol;
                    break;
                case 'haulEnergy':
                    if (vol > 0) {
                        minimumSpawnOf.remoteStationaryHarvester++;
                        minimumSpawnOf.energyHauler += vol - 1;
                    }
                    break;
                case 'narrowSource':
                    minimumSpawnOf.stationaryHarvester++;
                    minimumSpawnOf.energyTransporter++;
                    break;
                case "remoteController":
                    vacantFlags = _.filter(myFlags, function (f) {
                        if (f.memory.function == "remoteController" && _.filter(allMyCreeps, {memory: {currentFlag: f.name}}).length == 0) {
                            if (Game.rooms[f.pos.roomName] != undefined) {
                                // Sight on room
                                let controller = Game.rooms[f.pos.roomName].controller;
                                if (controller.owner == undefined && (controller.reservation == undefined || controller.reservation.ticksToEnd < 3000 || f.memory.claim == 1)) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                            else {
                                // No sight on room
                                return true;
                            }
                        }
                    });
                    minimumSpawnOf.claimer = vacantFlags.length;
                    break;
                case 'attackController':
                    minimumSpawnOf.bigClaimer += vol;
                    break;
                case "unitGroup":
                    if (mem.attacker != undefined) {
                        minimumSpawnOf.attacker += mem.attacker;
                    }
                    if (mem.healer != undefined) {
                        minimumSpawnOf.healer += mem.healer;
                    }
                    if (mem.einarr != undefined) {
                        minimumSpawnOf.einarr += mem.einarr;
                    }
                    if (mem.archer != undefined) {
                        minimumSpawnOf.archer += mem.archer;
                    }
                    break;
            }
        }

        /**Spawning volumes scaling with # of sources in room**/
        var constructionSites = spawnRoom.find(FIND_CONSTRUCTION_SITES);
        var constructionOfRampartsAndWalls = 0;
        // Builder
        if (constructionSites.length == 0) {
            minimumSpawnOf.builder = 0;
        }
        else {
            //There are construction sites
            var progress = 0;
            var totalProgress = 0;
            for (var w in constructionSites) {
                progress += constructionSites[w].progress;
                totalProgress += constructionSites[w].progressTotal;
                if (constructionSites[w].structureType == STRUCTURE_RAMPART || constructionSites[w].structureType == STRUCTURE_WALL) {
                    constructionOfRampartsAndWalls++;
                }
            }
            minimumSpawnOf.builder = Math.ceil((totalProgress - progress) / 5000);
        }
        if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)) {
            minimumSpawnOf.builder = Math.ceil(numberOfSources * 1.5);
        }
        // Upgrader
        if (spawnRoom.controller.level == 8) {
            minimumSpawnOf.upgrader = 0;
            if (spawnRoom.storage.store[RESOURCE_ENERGY] > 200000) {
                minimumSpawnOf.upgrader = 1;
            }
        }
        else {
            minimumSpawnOf["upgrader"] = Math.ceil(numberOfSources * 1);
        }
        //Wall Repairer
        if (spawnRoom.memory.roomSecure == true && constructionOfRampartsAndWalls == 0) {
            minimumSpawnOf["wallRepairer"] = 0;
        }
        else {
            minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        }
        // Distributor
        if (spawnRoom.memory.terminalTransfer != undefined) {
            //ongoing terminal transfer
            minimumSpawnOf["distributor"] = 1;
        }
        else if (spawnRoom.terminal != undefined && spawnRoom.storage != undefined) {
            for (var rs in RESOURCES_ALL) {
                if ((checkTerminalLimits(spawnRoom, RESOURCES_ALL[rs]).amount < 0 && spawnRoom.storage.store[RESOURCES_ALL[rs]] > 0)
                    || checkTerminalLimits(spawnRoom, RESOURCES_ALL[rs]).amount > 0) {
                    minimumSpawnOf["distributor"] = 1;
                    break;
                }
            }
        }
        // EnergyTransporter, Harvester & Repairer
        minimumSpawnOf["energyTransporter"] = minimumSpawnOf.stationaryHarvester;
        minimumSpawnOf["harvester"] = Math.ceil(numberOfSources * 1.5) - minimumSpawnOf.energyTransporter;
        minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);
        /** Rest **/
        // Miner
        minimumSpawnOf["miner"] = numberOfExploitableMineralSources;
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0 || spawnRoom.memory.resourceLimits[roomMineralType] == undefined || (spawnRoom.storage != undefined && spawnRoom.storage.store[roomMineralType] > spawnRoom.memory.resourceLimits[roomMineralType].minProduction)) {
            minimumSpawnOf.miner = 0;
        }
        // Scientist
        if (spawnRoom.memory.labOrder != undefined) {
            var info = spawnRoom.memory.labOrder.split(":");
            if (info[3] == "prepare" || info[3] == "done") {
                minimumSpawnOf.scientist = 1;
            }
        }
        // Adjustments in case of hostile presence
        if (spawnRoom.memory.hostiles.length > 0) {
            if (spawnRoom.memory.roomArray.towers.length > 0) {
                minimumSpawnOf.protector = spawnRoom.memory.hostiles.length - 1;
            }
            else {
                minimumSpawnOf.protector = spawnRoom.memory.hostiles.length;
            }
            minimumSpawnOf.upgrader = 0;
            minimumSpawnOf.builder = 0;
            minimumSpawnOf.remoteHarvester = 0;
            minimumSpawnOf.miner = 0;
            minimumSpawnOf.distributor = 0;
            minimumSpawnOf.remoteStationaryHarvester = 0;
            minimumSpawnOf.energyHauler = 0;
            minimumSpawnOf.demolisher = 0;
            minimumSpawnOf.wallRepairer *= 2;
        }
        // Measuring number of active creeps
        let counter = _.countBy(allMyCreeps, "memory.role");
        let roleList = (Object.getOwnPropertyNames(minimumSpawnOf));
        for (let z in roleList) {
            if (roleList[z] != "length" && counter[roleList[z]] == undefined) {
                counter[roleList[z]] = 0;
            }
        }
        let numberOf = counter;
        numberOf.claimer = 0; //minimumSpawnOf only contains claimer delta. Hence numberOf.claimer is always 0
        //console.log(spawnRoom + ": " + minimumSpawnOf.upgrader + " / " + numberOf.upgrader);
        // Role selection
        let energy = spawnRoom.energyCapacityAvailable;
        let name = undefined;
        let rcl = spawnRoom.controller.level;

        //Check whether spawn trying to spawn too many creeps
        let missingBodyParts = 0;
        for (let rn in minimumSpawnOf){
            if(minimumSpawnOf[rn] != undefined && buildingPlans[rn] != undefined) {
                missingBodyParts+=minimumSpawnOf[rn]*buildingPlans[rn][rcl-1].body.length;
            }
        }
        let neededTicksToSpawn = 3 * missingBodyParts;
        let neededTicksThreshold = 1300 * spawnRoom.memory.roomArray.spawns.length;
        if (neededTicksToSpawn > neededTicksThreshold) {
            console.log("<font color=#ff0000 type='highlight'>Warning: Possible bottleneck to spawn creeps needed for room " + spawnRoom.name + "  detected: " + neededTicksToSpawn + " ticks > " + neededTicksThreshold + " ticks</font>");
        }
        let spawnList = this.getSpawnList(spawnRoom, minimumSpawnOf, numberOf);
        if (spawnList != null && spawnList.length > 0) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                // Iterate through spawns
                let testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    // Spawn!
                    if (spawnList[s] == "claimer") {
                        name = testSpawn.createCustomCreep(energy, spawnList[s], spawnRoom.memory.masterSpawn, vacantFlags);
                    }
                    else {
                        name = testSpawn.createCustomCreep(energy, spawnList[s], spawnRoom.memory.masterSpawn);
                    }
                    testSpawn.memory.lastSpawnAttempt = spawnList[s];
                    if (!(name < 0) && name != undefined) {
                        testSpawn.memory.lastSpawn = spawnList[s];
                        if (LOG_SPAWN == true) {
                            console.log("<font color=#00ff22 type='highlight'>" + testSpawn.name + " is spawning creep: " + name + " (" + spawnList[s] + ") in room " + spawnRoom.name + ". (CPU used: " + (Game.cpu.getUsed() - cpuStart) + ")</font>");
                        }
                    }
                }
                if (s + 1 >= spawnList.length) {
                    break;
                }
            }
        }
    },
    
    getSpawnList: function (spawnRoom, minimumSpawnOf, numberOf) {
        let rcl = spawnRoom.controller.level;
        let tableImportance = {
            harvester: {
                name: "harvester",
                prio: 10,
                energyRole: true,
                min: minimumSpawnOf.harvester,
                max: numberOf.harvester,
                minEnergy: buildingPlans.harvester[rcl - 1].minEnergy
            },
            miniharvester: {
                name: "miniharvester",
                prio: 5,
                energyRole: true,
                min: 0,
                max: 0,
                minEnergy: buildingPlans.miniharvester[rcl - 1].minEnergy
            },
            stationaryHarvester: {
                name: "stationaryHarvester",
                prio: 100,
                energyRole: true,
                min: minimumSpawnOf.stationaryHarvester,
                max: numberOf.stationaryHarvester,
                minEnergy: buildingPlans.stationaryHarvester[rcl - 1].minEnergy
            },
            builder: {
                name: "builder",
                prio: 140,
                energyRole: false,
                min: minimumSpawnOf.builder,
                max: numberOf.builder,
                minEnergy: buildingPlans.builder[rcl - 1].minEnergy
            },
            repairer: {
                name: "repairer",
                prio: 170,
                energyRole: false,
                min: minimumSpawnOf.repairer,
                max: numberOf.repairer,
                minEnergy: buildingPlans.repairer[rcl - 1].minEnergy
            },
            wallRepairer: {
                name: "wallRepairer",
                prio: 210,
                energyRole: false,
                min: minimumSpawnOf.wallRepairer,
                max: numberOf.wallRepairer,
                minEnergy: buildingPlans.wallRepairer[rcl - 1].minEnergy
            },
            miner: {
                name: "miner",
                prio: 200,
                energyRole: false,
                min: minimumSpawnOf.miner,
                max: numberOf.miner,
                minEnergy: buildingPlans.miner[rcl - 1].minEnergy
            },
            upgrader: {
                name: "upgrader",
                prio: 160,
                energyRole: false,
                min: minimumSpawnOf.upgrader,
                max: numberOf.upgrader,
                minEnergy: buildingPlans.upgrader[rcl - 1].minEnergy
            },
            distributor: {
                name: "distributor",
                prio: 150,
                energyRole: false,
                min: minimumSpawnOf.distributor,
                max: numberOf.distributor,
                minEnergy: buildingPlans.distributor[rcl - 1].minEnergy
            },
            energyTransporter: {
                name: "energyTransporter",
                prio: 20,
                energyRole: true,
                min: minimumSpawnOf.energyTransporter,
                max: numberOf.energyTransporter,
                minEnergy: buildingPlans.energyTransporter[rcl - 1].minEnergy
            },
            scientist: {
                name: "scientist",
                prio: 220,
                energyRole: false,
                min: minimumSpawnOf.scientist,
                max: numberOf.scientist,
                minEnergy: buildingPlans.scientist[rcl - 1].minEnergy
            },
            remoteHarvester: {
                name: "remoteHarvester",
                prio: 130,
                energyRole: true,
                min: minimumSpawnOf.remoteHarvester,
                max: numberOf.remoteHarvester,
                minEnergy: buildingPlans.remoteHarvester[rcl - 1].minEnergy
            },
            remoteStationaryHarvester: {
                name: "remoteStationaryHarvester",
                prio: 110,
                energyRole: true,
                min: minimumSpawnOf.remoteStationaryHarvester,
                max: numberOf.remoteStationaryHarvester,
                minEnergy: buildingPlans.remoteStationaryHarvester[rcl - 1].minEnergy
            },
            claimer: {
                name: "claimer",
                prio: 40,
                energyRole: false,
                min: minimumSpawnOf.claimer,
                max: numberOf.claimer,
                minEnergy: buildingPlans.claimer[rcl - 1].minEnergy
            },
            bigClaimer: {
                name: "bigClaimer",
                prio: 60,
                energyRole: false,
                min: minimumSpawnOf.bigClaimer,
                max: numberOf.bigClaimer,
                minEnergy: buildingPlans.bigClaimer[rcl - 1].minEnergy
            },
            protector: {
                name: "protector",
                prio: 30,
                energyRole: false,
                min: minimumSpawnOf.protector,
                max: numberOf.protector,
                minEnergy: buildingPlans.protector[rcl - 1].minEnergy
            },
            demolisher: {
                name: "demolisher",
                prio: 230,
                energyRole: true,
                min: minimumSpawnOf.demolisher,
                max: numberOf.demolisher,
                minEnergy: buildingPlans.demolisher[rcl - 1].minEnergy
            },
            energyHauler: {
                name: "energyHauler",
                prio: 120,
                energyRole: true,
                min: minimumSpawnOf.energyHauler,
                max: numberOf.energyHauler,
                minEnergy: buildingPlans.energyHauler[rcl - 1].minEnergy
            },
            attacker: {
                name: "attacker",
                prio: 80,
                energyRole: false,
                min: minimumSpawnOf.attacker,
                max: numberOf.attacker,
                minEnergy: buildingPlans.attacker[rcl - 1].minEnergy
            },
            archer: {
                name: "archer",
                prio: 80,
                energyRole: false,
                min: minimumSpawnOf.apaHatchi,
                max: numberOf.apaHatchi,
                minEnergy: buildingPlans.archer[rcl - 1].minEnergy
            },
            healer: {
                name: "healer",
                prio: 90,
                energyRole: false,
                min: minimumSpawnOf.healer,
                max: numberOf.healer,
                minEnergy: buildingPlans.healer[rcl - 1].minEnergy
            },
            einarr: {
                name: "einarr",
                prio: 50,
                energyRole: false,
                min: minimumSpawnOf.einarr,
                max: numberOf.einarr,
                minEnergy: buildingPlans.einarr[rcl - 1].minEnergy
            },
            transporter: {
                name: "transporter",
                prio: 2400,
                energyRole: false,
                min: minimumSpawnOf.transporter,
                max: numberOf.transporter,
                minEnergy: buildingPlans.transporter[rcl - 1].minEnergy
            }
        };

        if (numberOf.harvester + numberOf.energyTransporter == 0 && spawnRoom.energyAvailable < buildingPlans.harvester.minEnergy) {
            // Set up miniHarvester to spawn
            tableImportance.miniharvester.min = 1;
        }

        tableImportance = _.filter(tableImportance, function (x) {
            return (!(x.min == 0 || x.min == x.max || x.max > x.min))
        });
        if (tableImportance.length > 0) {
            tableImportance = _.sortBy(tableImportance, "prio");

            if (3 ==5 && numberOf.harvester + numberOf.energyTransporter != 0) {
                // TODO: Add surplus upgrader to spawnlist
                let container = spawnRoom.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE});
                let containerEnergy = 0;
                for (let e in container) {
                    containerEnergy += container[e].store[RESOURCE_ENERGY];
                }
                if (spawnRoom.memory.hostiles.length == 0 && containerEnergy > spawnRoom.energyAvailable * 2.5 && spawnRoom.controller.level < 8 && numberOf.upgrader < Math.ceil(minimumSpawnOf.upgrader * 2)) {
                    tableImportance.push("upgrader");
                }
            }
            let spawnList = [];
            for (let c in tableImportance) {
                for (let i = 0; i < (tableImportance[c].min - tableImportance[c].max); i++) {
                    spawnList.push(tableImportance[c].name);
                }
            }
            return spawnList;
        }
        else {
            return null;
        }
    }
};
