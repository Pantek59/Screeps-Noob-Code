module.exports = {
    // manages spawning in indicated room
    
    run: function (spawnRoom, allies) {
        var globalSpawningStatus = true;

        for (var s in spawnRoom.memory.roomArraySpawns) {
            var testSpawn = Game.getObjectById(spawnRoom.memory.roomArraySpawns[s]);
            if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                globalSpawningStatus = false;
            }
        }

        if (globalSpawningStatus == true || spawnRoom.controller.owner == undefined) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }

        //Check for sources & minerals
        var numberOfSources = spawnRoom.memory.roomArraySources.length;
        var numberOfExploitableMineralSources = spawnRoom.memory.roomArrayExtractors.length;
        var roomMineralType;

        //Check mineral type of the room
        if (numberOfExploitableMineralSources > 0) {
            // Assumption: There is only one mineral source per room
            var mineral = Game.getObjectById(spawnRoom.memory.roomArrayMinerals[0]);
            if (mineral != undefined) {
                roomMineralType = mineral.mineralType;
            }
        }

        // Define spawn minima
        var minimumSpawnOf = new Array();
        //Volume defined by flags
        minimumSpawnOf["remoteHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["protector"] = 0;
        minimumSpawnOf["stationaryHarvester"] = 0;
        minimumSpawnOf["demolisher"] = 0;

        // Check for demolisher flags
        var demolisherFlags = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: spawnRoom.memory.masterSpawn}});
        for (var p in demolisherFlags) {
            //Iterate through demolisher flags of this spawn
            minimumSpawnOf.demolisher += demolisherFlags[p].memory.volume;
        }

        // Check for protector flags
        var protectorFlags = _.filter(Game.flags,{ memory: { function: 'protector', spawn: spawnRoom.memory.masterSpawn}});
        for (var p in protectorFlags) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.protector += protectorFlags[p].memory.volume;
        }

        // Check for remote source flags
        var remoteSources = _.filter(Game.flags,{ memory: { function: 'remoteSource', spawn: spawnRoom.memory.masterSpawn}});
        for (var t in remoteSources) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.remoteHarvester += remoteSources[t].memory.volume;
        }

        // Check for narrow source flags
        var narrowSources = _.filter(Game.flags,{ memory: { function: 'narrowSource', spawn: spawnRoom.memory.masterSpawn}});
        for (var t in narrowSources) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.stationaryHarvester ++;
        }

        // Check for active flag "remoteController"
        var remoteController = _.filter(Game.flags,{ memory: { function: 'remoteController', spawn: spawnRoom.memory.masterSpawn}});
        for (var t in remoteController) {
            if (remoteController[t].room != undefined && remoteController[t].room != undefined && remoteController[t].room.controller.owner != undefined && remoteController[t].room.controller.owner.username == spawnRoom.controller.owner.username) {
                //Target room already claimed
            }
            else {
                if (remoteController[t].room == undefined || remoteController[t].room.controller.reservation == undefined || remoteController[t].room.controller.reservation == undefined || remoteController[t].room.controller.reservation.ticksToEnd < 3000) {
                    minimumSpawnOf.claimer ++;
                }
            }
        }

        //Spawning volumes scaling with # of sources in room
        var constructionSites = spawnRoom.find(FIND_CONSTRUCTION_SITES);
        var constructionOfRampartsAndWalls = 0;

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

        if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)){
            minimumSpawnOf.builder = Math.ceil(numberOfSources * 1.5);
        }

        if (spawnRoom.controller.level == 8 && spawnRoom.controller.ticksToDowngrade > 5000) {
            minimumSpawnOf["upgrader"] = 0;
        }
        else {
            minimumSpawnOf["upgrader"] = Math.ceil(numberOfSources * 1);
        }
        minimumSpawnOf["harvester"] = Math.ceil(numberOfSources * 1.5);
        minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);
        minimumSpawnOf["miner"] = numberOfExploitableMineralSources;

        if (spawnRoom.memory.roomSecure == true && constructionOfRampartsAndWalls == 0) {
            minimumSpawnOf["wallRepairer"] = 0;
        }
        else {
            minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        }

        if (spawnRoom.memory.terminalTransfer != undefined) {
            //ongoing terminal transfer
            var info = spawnRoom.memory.terminalTransfer;
            info = info.split(":");
            if (parseInt(info[1]) > 3000 || minimumSpawnOf.stationaryHarvester == 0) {
                minimumSpawnOf["distributor"] = 1;
            }
            else {
                // Amount too small -> pick up with energyTransporter
                minimumSpawnOf["distributor"] = 0;
            }
        }
        else if (spawnRoom.terminal != undefined && (_.sum(spawnRoom.terminal.store) - spawnRoom.terminal.store[RESOURCE_ENERGY] > 3000 || minimumSpawnOf.stationaryHarvester == 0)) {
            minimumSpawnOf["distributor"] = 1;
        }
        else {
            // Amount too small -> pick up with energyTransporter
            minimumSpawnOf["distributor"] = 0;
        }

        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArrayMinerals[0]).mineralAmount == 0 || (spawnRoom.storage != undefined && spawnRoom.storage.store[roomMineralType] > spawnRoom.memory.roomMineralLimit)) {
            minimumSpawnOf.miner = 0;
        }

        // Adjustments in case of hostile presence
        var enemyCreeps = spawnRoom.find(FIND_HOSTILE_CREEPS);
        for (var g in enemyCreeps) {
            var username = enemyCreeps[g].owner.username;
            if (allies.indexOf(username) == -1) {
                minimumSpawnOf.protector++;
                minimumSpawnOf.upgrader = 0;
                minimumSpawnOf.builder = 0;
                minimumSpawnOf.remoteHarvester = 0;
                minimumSpawnOf.miner = 0;
                minimumSpawnOf.distributor = 0;
                minimumSpawnOf.wallRepairer *= 2;
                break;
            }
        }

        // Measuring number of active creeps
        var numberOf = new Array();
        // Creeps not leaving room
        numberOf["harvester"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "harvester")}).length;
        numberOf["stationaryHarvester"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "stationaryHarvester")}).length;
        numberOf["builder"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "builder")}).length;
        numberOf["repairer"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")}).length;
        numberOf["wallRepairer"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "wallRepairer")}).length;
        numberOf["miner"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "miner")}).length;
        numberOf["upgrader"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")}).length;
        numberOf["distributor"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "distributor")}).length;
        numberOf["energyTransporter"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "energyTransporter")}).length;

        //Creeps leaving room
        numberOf["remoteHarvester"] = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["claimer"] = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["protector"] = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["demolisher"] = _.filter(Game.creeps,{ memory: { role: 'demolisher', spawn: spawnRoom.memory.masterSpawn}}).length;

        // Addition of creeps being spawned
        for (s in spawnRoom.memory.roomArraySpawns) {
            testSpawn = Game.getObjectById(spawnRoom.memory.roomArraySpawns[s]);
            if (testSpawn != null && testSpawn.spawning != null) {
                // Active spawn found
                if (testSpawn.memory.lastSpawn == "miniharvester") {
                    numberOf.harvester++;
                }
                else {
                    numberOf[testSpawn.memory.lastSpawn]++;
                }
            }
        }

        // Role selection
        var energy = spawnRoom.energyCapacityAvailable;
        var name = undefined;
        var hostiles = spawnRoom.memory.hostiles;

        // if not enough harvesters
        if (numberOf.harvester + numberOf.energyTransporter < minimumSpawnOf.harvester) {
            // try to spawn one
            var rolename = 'harvester';
            // if spawning failed and we have no harvesters left
            if (numberOf.harvester + numberOf.energyTransporter == 0 || spawnRoom.energyCapacityAvailable < 350) {
                // spawn one with what is available
                var rolename = 'miniharvester';
            }
            else if (minimumSpawnOf.stationaryHarvester > 0 && minimumSpawnOf.stationaryHarvester == numberOf.stationaryHarvester && minimumSpawnOf.harvester - numberOf.harvester <= minimumSpawnOf.stationaryHarvester) {
                var rolename = "energyTransporter";
            }
        }
        else if (numberOf.protector < minimumSpawnOf.protector) {
            var rolename = 'protector';
        }
        else if (numberOf.claimer < minimumSpawnOf.claimer) {
            var rolename = 'claimer';
        }
        else if (numberOf.stationaryHarvester < minimumSpawnOf.stationaryHarvester) {
            var rolename = 'stationaryHarvester';
        }
        else if (numberOf.remoteHarvester < Math.floor(minimumSpawnOf.remoteHarvester / 2)) {
            var rolename = 'remoteHarvester';
        }
        else if (numberOf.distributor < minimumSpawnOf.distributor) {
            var rolename = 'distributor';
        }
        else if (numberOf.upgrader < minimumSpawnOf.upgrader) {
            var rolename = 'upgrader';
        }
        else if (numberOf.repairer < minimumSpawnOf.repairer) {
            var rolename = 'repairer';
        }
        else if (numberOf.miner < minimumSpawnOf.miner) {
            var rolename = 'miner';
        }
        else if (numberOf.builder < Math.floor(minimumSpawnOf.builder / 2)) {
            var rolename = 'builder';
        }
        else if (numberOf.remoteHarvester < minimumSpawnOf.remoteHarvester) {
            var rolename = 'remoteHarvester';
        }
        else if (numberOf.builder < minimumSpawnOf.builder) {
            var rolename = 'builder';
        }
        else if (numberOf.demolisher < minimumSpawnOf.demolisher) {
            var rolename = 'demolisher';
        }
        else if (numberOf.wallRepairer < minimumSpawnOf.wallRepairer) {
            var rolename = 'wallRepairer';
        }
        else {
            // Surplus spawning
            var container = spawnRoom.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE});
            var containerEnergie = 0;

            for (var e in container) {
                containerEnergie += container[e].store[RESOURCE_ENERGY];
            }
            if (hostiles == 0 && containerEnergie > spawnRoom.energyAvailable * 2.5) {
                if (numberOf.upgrader < Math.ceil(minimumSpawnOf.upgrader * 2.5)) {
                    var rolename = 'upgrader';
                }
                else {
                    var rolename = "---";
                }
            }
            else {
                var rolename = "---";
            }
        }

        if (rolename != "---") {
            // Look for unoccupied, active spawn
            var actingSpawn;
            for (var s in spawnRoom.memory.roomArraySpawns) {
                testSpawn = Game.getObjectById(spawnRoom.memory.roomArraySpawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    actingSpawn = testSpawn;
                    break;
                }
            }

            if (actingSpawn != undefined) {
                // Spawn!
                name = actingSpawn.createCustomCreep(energy, rolename, spawnRoom.memory.masterSpawn);
                actingSpawn.memory.lastSpawnAttempt = rolename;
                
                if (!(name < 0)) {
                    console.log("<font color=#00ff22 type='highlight'>" + actingSpawn.name + " is spawning creep: " + name + " (" + rolename + ") in room " + spawnRoom.name + ".</font>");
                    actingSpawn.memory.lastSpawn = rolename;
                }
            }
        }
    }
}