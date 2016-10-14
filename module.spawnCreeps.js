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
        minimumSpawnOf["scientist"] = 0;
        minimumSpawnOf["transporter"] = 0;

        // Check for transporter flags
        var transporterFlags = _.filter(Game.flags,{ memory: { function: 'transporter', spawn: spawnRoom.memory.masterSpawn}});
        for (var p in transporterFlags) {
            //Iterate through demolisher flags of this spawn
            minimumSpawnOf.transporter += transporterFlags[p].memory.volume;
        }

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

        // Check for energy hauling flags
        var energyHaulingFlags = _.filter(Game.flags,{ memory: { function: 'haulEnergy', spawn: spawnRoom.memory.masterSpawn}});
        for (var t in energyHaulingFlags) {
            //Iterate through remote source flags of this spawn
            minimumSpawnOf.energyHauler += (energyHaulingFlags[t].memory.volume - 1);
            minimumSpawnOf.remoteStationaryHarvester++;
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
            let tempRoom = Game.rooms[remoteController[t].pos.roomName];
            if (tempRoom != undefined && tempRoom.controller != undefined && tempRoom.controller.owner != undefined && tempRoom.controller.owner.username == playerUsername) {
                //Target room already claimed
            }
            else if (remoteController[t].room == undefined || remoteController[t].room.controller.reservation == undefined || remoteController[t].room.controller.reservation.ticksToEnd < 3000) {
                minimumSpawnOf.claimer ++;
            }
        }

        // Check for active flag "attackController"
        var attackController = _.filter(Game.flags,{ memory: { function: 'attackController', spawn: spawnRoom.memory.masterSpawn}});
        for (var t in attackController) {
            minimumSpawnOf.bigClaimer += attackController[t].memory.volume;
        }

        // Check for unit groups
        var groupFlags = _.filter(Game.flags,{ memory: { function: 'unitGroup', spawn: spawnRoom.memory.masterSpawn}});
        for (var g in groupFlags) {

            if (groupFlags[g].memory.attacker != undefined) {
                minimumSpawnOf.attacker += groupFlags[g].memory.attacker;
            }
            if (groupFlags[g].memory.healer != undefined) {
                minimumSpawnOf.healer += groupFlags[g].memory.healer;
            }
            if (groupFlags[g].memory.einarr != undefined) {
                minimumSpawnOf.einarr += groupFlags[g].memory.einarr;
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

        if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)){
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

        // Harvester & Repairer
        minimumSpawnOf["harvester"] = Math.ceil(numberOfSources * 1.5);
        minimumSpawnOf["repairer"] = Math.ceil(numberOfSources * 0.5);

        /** Rest **/
        // Miner
        minimumSpawnOf["miner"] = numberOfExploitableMineralSources;
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArrayMinerals[0]).mineralAmount == 0 || spawnRoom.memory.resourceLimits[roomMineralType] == undefined || (spawnRoom.storage != undefined && spawnRoom.storage.store[roomMineralType] > spawnRoom.memory.resourceLimits[roomMineralType].minProduction)) {
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
        var enemyCreeps = spawnRoom.find(FIND_HOSTILE_CREEPS);
        for (var g in enemyCreeps) {
            var username = enemyCreeps[g].owner.username;
            if (allies.indexOf(username) == -1) {
                if (spawnRoom.memory.roomArrayTowers.length > 0) {
                    minimumSpawnOf.protector = enemyCreeps.length - 1;
                }
                else {
                    minimumSpawnOf.protector = enemyCreeps.length;
                }
                minimumSpawnOf.upgrader = 0;
                minimumSpawnOf.builder = 0;
                minimumSpawnOf.remoteHarvester = 0;
                minimumSpawnOf.miner = 0;
                minimumSpawnOf.distributor = 0;
                minimumSpawnOf.wallRepairer *= 2;
                break;
            }
        }
        //console.log(spawnRoom.name + ": " + minimumSpawnOf.upgrader);

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
        numberOf["scientist"] = spawnRoom.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "scientist")}).length;

        //Creeps leaving room
        numberOf["remoteHarvester"] = _.filter(Game.creeps,{ memory: { role: 'remoteHarvester', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["remoteStationaryHarvester"] = _.filter(Game.creeps,{ memory: { role: 'remoteStationaryHarvester', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["claimer"] = _.filter(Game.creeps,{ memory: { role: 'claimer', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["bigClaimer"] = _.filter(Game.creeps,{ memory: { role: 'bigClaimer', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["protector"] = _.filter(Game.creeps,{ memory: { role: 'protector', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["demolisher"] = _.filter(Game.creeps,{ memory: { role: 'demolisher', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["energyHauler"] = _.filter(Game.creeps,{ memory: { role: 'energyHauler', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["attacker"] = _.filter(Game.creeps,{ memory: { role: 'attacker', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["healer"] = _.filter(Game.creeps,{ memory: { role: 'healer', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["einarr"] = _.filter(Game.creeps,{ memory: { role: 'einarr', spawn: spawnRoom.memory.masterSpawn}}).length;
        numberOf["transporter"] = _.filter(Game.creeps,{ memory: { role: 'transporter', spawn: spawnRoom.memory.masterSpawn}}).length;

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
        var rcl = spawnRoom.controller.level;

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
        else if (numberOf.protector < minimumSpawnOf.protector && (buildingPlans.protector[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.protector[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'protector';
        }
        else if (numberOf.claimer < minimumSpawnOf.claimer && (buildingPlans.claimer[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.claimer[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'claimer';
        }
        else if (numberOf.einarr < minimumSpawnOf.einarr && (buildingPlans.einarr[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.einarr[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'einarr';
        }
        else if (numberOf.bigClaimer < minimumSpawnOf.bigClaimer && (buildingPlans.bigClaimer[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.bigClaimer[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'bigClaimer';
        }
        else if (numberOf.attacker < minimumSpawnOf.attacker && (buildingPlans.attacker[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.attacker[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'attacker';
        }
        else if (numberOf.healer < minimumSpawnOf.healer && (buildingPlans.healer[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.healer[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'healer';
        }
        else if (numberOf.stationaryHarvester < minimumSpawnOf.stationaryHarvester && (buildingPlans.stationaryHarvester[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.stationaryHarvester[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'stationaryHarvester';
        }
        else if (numberOf.remoteStationaryHarvester < minimumSpawnOf.remoteStationaryHarvester && (buildingPlans.remoteStationaryHarvester[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.remoteStationaryHarvester[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'remoteStationaryHarvester';
        }
        else if (numberOf.energyHauler < minimumSpawnOf.energyHauler && (buildingPlans.energyHauler[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.energyHauler[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'energyHauler';
        }
        else if (numberOf.remoteHarvester < Math.floor(minimumSpawnOf.remoteHarvester / 2) && (buildingPlans.remoteHarvester[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.remoteHarvester[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'remoteHarvester';
        }
        else if (numberOf.distributor < minimumSpawnOf.distributor && (buildingPlans.distributor[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.distributor[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'distributor';
        }
        else if (numberOf.upgrader < minimumSpawnOf.upgrader && (buildingPlans.upgrader[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.upgrader[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'upgrader';
        }
        else if (numberOf.repairer < minimumSpawnOf.repairer && (buildingPlans.repairer[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.repairer[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'repairer';
        }
        else if (numberOf.miner < minimumSpawnOf.miner && (buildingPlans.miner[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.miner[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'miner';
        }
        else if (numberOf.builder < Math.floor(minimumSpawnOf.builder / 2) && (buildingPlans.builder[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.builder[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'builder';
        }
        else if (numberOf.remoteHarvester < minimumSpawnOf.remoteHarvester && (buildingPlans.remoteHarvester[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.remoteHarvester[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'remoteHarvester';
        }
        else if (numberOf.builder < minimumSpawnOf.builder && (buildingPlans.builder[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.builder[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'builder';
        }
        else if (numberOf.wallRepairer < minimumSpawnOf.wallRepairer && (buildingPlans.wallRepairer[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.wallRepairer[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'wallRepairer';
        }
        else if (numberOf.scientist < minimumSpawnOf.scientist && (buildingPlans.scientist[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.scientist[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'scientist';
        }
        else if (numberOf.demolisher < minimumSpawnOf.demolisher && (buildingPlans.demolisher[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.demolisher[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'demolisher';
        }
        else if (numberOf.transporter < minimumSpawnOf.transporter && (buildingPlans.transporter[rcl-1].minEnergy <= spawnRoom.energyAvailable || buildingPlans.transporter[rcl-2].minEnergy <= spawnRoom.energyAvailable)) {
            var rolename = 'transporter';
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