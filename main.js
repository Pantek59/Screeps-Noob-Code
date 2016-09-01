const CPUdebug = true;
const delayPathfinding = 2;
const delayRoomScanning = 50;
const RESOURCE_SPACE = "space";

require('prototype.spawn')();
require('prototype.creep.findMyFlag')();
require('prototype.creep.findResource')();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleJobber = require('role.jobber');
var roleRemoteHarvester = require('role.remoteHarvester');
var roleProtector = require('role.protector');
var roleClaimer = require('role.claimer')
var roleStationaryHarvester = require('role.stationaryHarvester');
var roleMiner = require('role.miner');
var roleDistributor = require("role.distributor");
var roleDemolisher = require('role.demolisher');
var moduleSpawnCreeps = require('module.spawnCreeps');
var roleEnergyTransporter = require("role.energyTransporter");

var CPUdebugString = "CPU Debug<br><br>";
var playerUsername = "Pantek59";
var allies = new Array();
allies.push("king_lispi");
allies.push("Tanjera");
allies.push("Atavus");
allies.push("BlackLotus");

// Any modules that you use that modify the game's prototypes should be require'd before you require the profiler.
const profiler = require('screeps-profiler'); // cf. https://www.npmjs.com/package/screeps-profiler

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
     if (CPUdebug == true) {CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed())}

	// check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
    var senex = _.filter(Game.creeps,{ ticksToLive: 1});
    for (var ind in senex) {
        console.log("<font color=#ffffff type='highlight'>Creep expired: " + senex[ind].name + " the \"" + senex[ind].memory.role + "\" in room " + senex[ind].room.name + ".</font>");
    }

    if (CPUdebug == true) {CPUdebugString.concat("<br>Start cycling through rooms: " + Game.cpu.getUsed())}
    // Cycle through rooms    
    for (var r in Game.rooms) {
        //Save # of hostile creeps in room
        Game.rooms[r].memory.hostiles = 0;
        var enemies = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
        for (var cr in enemies) {
            if (allies.indexOf(enemies[cr].owner.username) == -1) {
                Game.rooms[r].memory.hostiles++;
            }
        }

        if (Game.rooms[r].memory.terminalEnergyCost == undefined) {
            Game.rooms[r].memory.terminalEnergyCost = 0;
        }

        //  Refresher (will be executed every few ticks)
        var searchResult;

        if (Game.time % delayRoomScanning == 0) {
            Game.rooms[r].memory.resourceTicker = Game.time;

            // Preloading room structure
            var defenseObjects = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
            defenseObjects = _.sortBy(defenseObjects,"hits");

            if (defenseObjects != undefined && defenseObjects[0] != undefined && defenseObjects[0].hits > 5000000) {
                Game.rooms[r].memory.roomSecure = true;
            }
            else if (Game.rooms[r].memory.roomSecure != undefined) {
                delete Game.rooms[r].memory.roomSecure;
            }

            if (Game.rooms[r].memory.roomArraySources == undefined) {
                var sourceIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_SOURCES);
                for (let s in searchResult) {
                    sourceIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArraySources = sourceIDs;
            }

            if (Game.rooms[r].memory.roomArrayMinerals == undefined) {
                var sourceIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_MINERALS);
                for (let s in searchResult) {
                    sourceIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayMinerals = sourceIDs;
            }

            var containerIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
            for (let s in searchResult) {
                containerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayContainers = containerIDs;

            var spawnIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
            for (let s in searchResult) {
                spawnIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArraySpawns = spawnIDs;

            var extensionIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
            for (let s in searchResult) {
                extensionIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayExtensions = extensionIDs;

            var LinkIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
            for (let s in searchResult) {
                LinkIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayLinks = LinkIDs;

            var LabIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});
            for (let s in searchResult) {
                LabIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayLabs = LabIDs;

            var ExtractorIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
            for (let s in searchResult) {
                ExtractorIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayExtractors = ExtractorIDs;

            var rampartIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
            for (let s in searchResult) {
                rampartIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArrayRamparts = rampartIDs;

            var towerIDs = new Array();
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
            for (let s in searchResult) {
                towerIDs.push(searchResult[s].id);
            }

            Game.rooms[r].memory.roomArrayTowers = towerIDs;

            if (Game.rooms[r].memory.roomArrayConstructionSites == undefined) {
                var constructionIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_MY_CONSTRUCTION_SITES);
                for (let s in searchResult) {
                    constructionIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayConstructionSites = constructionIDs;
            }
        }
        if (Game.rooms[r].memory.masterSpawn == undefined && Game.rooms[r].memory.roomArraySpawns != undefined) {
            if (Game.rooms[r].memory.roomArraySpawns.length == 1) {
                Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArraySpawns[0];
            }
            else if (Game.rooms[r].memory.roomArraySpawns.length > 1) {
                for (var id in Game.rooms[r].memory.roomArraySpawns) {
                    var testSpawn = Game.getObjectById(Game.rooms[r].memory.roomArraySpawns[id]);
                    if (testSpawn.memory.spawnRole == 1) {
                        Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArraySpawns[id];
                    }
                }
            }
        }

        //Flag code
        if (CPUdebug == true) {CPUdebugString.concat("<br>Starting flag code: " + Game.cpu.getUsed())}
        var remoteHarvestingFlags = _.filter(Game.flags,{ memory: { function: 'remoteSource'}});

        for (var f in remoteHarvestingFlags) {
            var flag = remoteHarvestingFlags[f];
            if (flag.room != undefined) {
                // We have visibility in room
                if (flag.room.memory.hostiles > 0 && flag.room.memory.panicFlag == undefined) {
                    //Hostiles present in room with remote harvesters
                    var panicFlag = flag.pos.createFlag(); // create white panic flag to attract protectors
                    flag.room.memory.panicFlag = panicFlag;
                    panicFlag = _.filter(Game.flags,{ name: panicFlag})[0];
                    panicFlag.memory.function = "protector";
                    panicFlag.memory.volume = flag.room.memory.hostiles;
                    panicFlag.memory.spawn = flag.memory.spawn;

                    console.log("<font color=#ff0000 type='highlight'>Panic flag has been set in room " + flag.room.name + " for room " + Game.getObjectById(panicFlag.memory.spawn).room.name + "</font>");
                }
                else if (flag.room.memory.hostiles == 0 && flag.room.memory.panicFlag != undefined) {
                    // No hostiles present in room with remote harvesters
                    var tempFlag = _.filter(Game.flags,{ name: flag.room.memory.panicFlag})[0];
                    tempFlag.remove();
                    delete flag.room.memory.panicFlag;
                }
            }
        }

        if (CPUdebug == true) {CPUdebugString.concat("<br>Starting spawn code: " + Game.cpu.getUsed())}
        // Spawn code
        if (Game.rooms[r].memory.roomArraySpawns == undefined || Game.rooms[r].memory.roomArraySpawns.length == 0) {
            //room has no spawner yet
            if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                //room is owned and should be updated
                var claimFlags = _.filter(Game.flags,{ memory: { function: 'remoteController'}});
                claimFlags = Game.rooms[r].find(FIND_FLAGS, { filter: (s) => s.pos.roomName == Game.rooms[r].name && s.memory.function == "remoteController"});

                var upgraderRecruits = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: Game.rooms[r].name}});
                if (upgraderRecruits.length < 1) {
                    var roomName;
                    if (claimFlags.length > 0) {
                        //Claimer present, read homeroom
                        var newUpgraders = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: claimFlags[0].memory.supply}});

                        if (newUpgraders.length > 0) {
                            var targetCreep = newUpgraders[0];
                            roomName=claimFlags[0].memory.supply;
                        }
                    }
                    else {
                        for (var x in Game.rooms) {
                            if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                var newUpgraders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "upgrader")});
                                if (newUpgraders.length > 0) {
                                    var targetCreep = newUpgraders[0];
                                    roomName=Game.rooms[x].name;
                                }
                            }
                        }
                    }

                    if (targetCreep != undefined) {
                        targetCreep.memory.homeroom = Game.rooms[r].name;
                        targetCreep.memory.spawn =  Game.rooms[r].controller.id;
                        console.log("<font color=#ffff00 type='highlight'>" + targetCreep.name + " has been captured in room " + targetCreep.pos.roomName + " as an upgrader by room " + Game.rooms[r].name + ".</font>");
                        targetCreep = undefined;
                    }
                }

                var BuilderRecruits = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: Game.rooms[r].name}});
                if (BuilderRecruits.length < 1) {
                    var roomName;
                    if (claimFlags.length > 0) {
                        //Claimer present, read homeroom
                        var newBuilders = _.filter(Game.creeps,{ memory: { role: 'repairer', homeroom: claimFlags[0].memory.supply}});
                        if (newBuilders.length > 0) {
                            var targetCreepBuilder = newBuilders[0];
                            roomName=claimFlags[0].memory.supply;
                        }
                    }
                    else {
                        for (var x in Game.rooms) {
                            if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                var newBuilders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "repairer")});
                                if (newBuilders.length > 0) {
                                    var targetCreepBuilder = newBuilders[0];
                                    roomName=Game.rooms[x].name;
                                }
                            }
                        }
                    }
                    if (targetCreepBuilder != undefined) {
                        targetCreepBuilder.memory.homeroom = Game.rooms[r].name;
                        targetCreepBuilder.memory.spawn =  Game.rooms[r].controller.id;
                        console.log("<font color=#ffff000 type='highlight'>" + targetCreepBuilder.name + " has been captured in room " + targetCreepBuilder.pos.roomName + " as a repairer by room " + Game.rooms[r].name + ".</font>");
                    }
                }

            }
        }
        else if (Game.time % 5 == 0) {
            moduleSpawnCreeps.run(Game.rooms[r], allies);
        }

        if (CPUdebug == true) {CPUdebugString.concat("<br>Starting tower code: " + Game.cpu.getUsed())}
        // Tower code      
        var towers = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS);

        for (var tower in towers) {
            // Tower attack code
            var maxHealBodyParts = 0;
            var HealBodyParts = 0;
            var healingInvader = undefined;

            for (var h in hostiles) {
                HealBodyParts = 0;
                for (var part in hostiles[h].body) {
                    if (hostiles[h].body[part].type == "heal") {
                        //Healing body part found
                        HealBodyParts++;
                    }
                }

                if (HealBodyParts > maxHealBodyParts) {
                    maxHealBodyParts = HealBodyParts;
                    healingInvader = hostiles[h].id;
                }
            }

            if (hostiles.length > 0) {
                if (healingInvader != undefined) {
                    hostiles[0] = Game.getObjectById(healingInvader);
                }
                var username = hostiles[0].owner.username;
                if (allies.indexOf(username) == -1) {
                    console.log("Hostile creep " + username + " spotted in room " + Game.rooms[r].name + "!");
                    towers.forEach(tower => tower.attack(hostiles[0]));
                }
            }
            else {
                // Tower healing code
                var wounded = Game.rooms[r].find(FIND_MY_CREEPS, {filter: (s) => s.hits < s.hitsMax});
                if (wounded.length > 0) {
                    towers[tower].heal(wounded[0]);
                }
            }
            /* Tower repairing code
            if (towers[tower].energy / towers[tower].energyCapacity > 0.8) {
                var damage = Game.rooms[r].find(FIND_MY_STRUCTURES, { filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});

                if (damage.length > 0) {
                    towers[tower].repair(damage[0]);
                }
            }*/
        }

        // Search for dropped energy
        if (CPUdebug == true) {CPUdebugString.concat("<br>Start dropped energy search: " + Game.cpu.getUsed())}
        var energies=Game.rooms[r].find(FIND_DROPPED_ENERGY);
        for (var energy in energies) {
            var energyID = energies[energy].id;
            var energyAmount = energies[energy].amount;

            if (energyAmount > 5 && Game.rooms[r].memory.hostiles == 0) {
                var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                        filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) >= 0 && s.memory.role != "protector" && s.memory.role != "distributor"});

                if (collector == null) {
                    collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0 && s.memory.role != "protector" && s.memory.role != "distributor"});
                }

                if (collector != null) {
                    // Creep found to pick up dropped energy
                    collector.memory.jobQueueObject = energyID;
                    collector.memory.jobQueueTask = "pickUpEnergy";

                    roleJobber.run(collector, "droppedEnergy")
                }
                //console.log(collector.name + " is picking up dropped energy (" + energyAmount + ") in room " + energies[energy].room);
            }
        }

        // Link code
        if (Game.rooms[r].memory.roomArrayLinks != undefined && Game.rooms[r].memory.roomArrayLinks.length > 1) {
            var fillLinks = new Array();
            var emptyLinks = new Array();
            var targetLevel = 0;

            if (Game.rooms[r].memory.linksEmpty == undefined) {
                // Prepare link roles
                var emptyArray = new Array();
                emptyArray.push("[LINK_ID]");
                Game.rooms[r].memory.linksEmpty = emptyArray;
            }

            for (var link in Game.rooms[r].memory.roomArrayLinks) {
                if (Game.rooms[r].memory.linksEmpty == undefined || Game.rooms[r].memory.linksEmpty.indexOf(Game.rooms[r].memory.roomArrayLinks[link]) == -1) {
                    fillLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArrayLinks[link]));
                    targetLevel += Game.getObjectById(Game.rooms[r].memory.roomArrayLinks[link]).energy;
                }
                else {
                    emptyLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArrayLinks[link]));
                }
            }
            targetLevel = Math.ceil(targetLevel / fillLinks.length / 100); //Targetlevel is now 0 - 8
            fillLinks = _.sortBy(fillLinks, "energy");

            //Empty emptyLinks
            for (var link in emptyLinks) {
                if (emptyLinks[link].cooldown == 0 && emptyLinks[link].energy > 0) {
                    for (var i = 0; i < fillLinks.length; i++) {
                        if (fillLinks[i].energy < 800) {
                            if (fillLinks[i].energy + emptyLinks[link].energy <= 800) {
                                emptyLinks[link].transferEnergy(fillLinks[i], emptyLinks[link].energy);
                            }
                            else {
                                emptyLinks[link].transferEnergy(fillLinks[i], (800 - fillLinks[i].energy));
                            }
                        }
                    }
                }
            }
            fillLinks = _.sortBy(fillLinks, "energy");

            if (targetLevel > 0 && fillLinks.length > 1) {
                var minLevel = 99;
                var maxLevel = 0;
                var maxLink;
                var minLink;

                for (var link in fillLinks) {
                    if (Math.ceil(fillLinks[link].energy / 100) <= targetLevel && Math.ceil(fillLinks[link].energy / 100) <= minLevel) {
                        //Receiver link
                        minLevel = Math.ceil(fillLinks[link].energy / 100);
                        minLink = fillLinks[link];
                    }
                    else if (fillLinks[link].cooldown == 0 && Math.ceil(fillLinks[link].energy / 100) >= targetLevel && Math.ceil(fillLinks[link].energy / 100) >= maxLevel) {
                        //Sender link
                        maxLevel = Math.ceil(fillLinks[link].energy / 100);
                        maxLink = fillLinks[link];
                    }
                }

                if (maxLink != undefined && maxLink.id != minLink.id && fillLinks.length > 1) {
                    maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
                }
            }
        }

        // Terminal code
        if (CPUdebug == true) {CPUdebugString.concat("<br>Starting terminal code: " + Game.cpu.getUsed())}
        if (Game.rooms[r].memory.terminalTransfer != undefined) {
            var terminal = Game.rooms[r].terminal;
            if (terminal != undefined) {
                //Terminal exists
                var targetRoom;
                var amount;
                var resource;
                var comment;
                var energyCost;
                var info = Game.rooms[r].memory.terminalTransfer;
                info = info.split(":");
                targetRoom = info[0];
                amount = info[1];
                resource = info[2];
                comment = info[3];

                energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
                Game.rooms[r].memory.terminalEnergyCost = energyCost;

                if (terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost) {
                    // Amount to be transferred reached and enough energy available -> GO!
                    if (terminal.send(resource,amount,targetRoom,comment) == OK) {
                        delete Game.rooms[r].memory.terminalTransfer;
                        delete Game.rooms[r].memory.terminalEnergyCost;
                        console.log("<font color=#009bff type='highlight'>" + amount + " " + resource + " has been transferred to room " + targetRoom + ": " + comment + "</font>");
                        Game.notify(amount + " " + resource + " has been transferred to room " + targetRoom + ": " + comment);
                    }
                    else {
                        console.log("<font color=#ff0000 type='highlight'>Terminal transfer error: " + terminal.send(resource,amount,targetRoom,comment) + "</font>");
                        Game.notify("Terminal transfer error: " + terminal.send(resource,amount,targetRoom,comment));
                    }
                }
            }
        }

        // Lab production code
        if (Game.rooms[r].memory.labOrder != undefined) {

            if (Game.rooms[r].memory.labOrderArray == undefined) {
                // Process not started yet
                var labsArray = new Array();
                for (var l in Game.rooms[r].memory.roomArrayLabs) {
                    var lab = Game.getObjectById(Game.rooms[r].memory.roomArrayLabs[l]);
                    var neighboringLabs = lab.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => (s.structureType == STRUCTURE_LAB)});
                    if (neighboringLabs.length > 1) {
                        var outputLab = new Array();
                        var inputLab1 = new Array();
                        var inputLab2 = new Array();
                        outputLab["id"] = lab.id;
                        outputLab["mineralType"] = order[3];
                        inputLab1["id"] = neighboringLabs[0].id;
                        inputLab1["mineralType"] = order[1];
                        inputLab2["id"] = neighboringLabs[1].id;
                        inputLab2["mineralType"] = order[2];
                        labsArray["outputLab"] = outputLab;
                        labsArray["inputLab1"] = inputLab1;
                        labsArray["inputLab2"] = inputLab2;
                        Game.rooms[r].memory.labOrderArray = labsArray;
                        break;
                    }
                }
            }

            //Lab order pending
            if (Game.rooms[r].memory.labOrderArray != undefined) {
                // Material acquisition on progress
                var inputLab1 = Game.getObjectById(Game.rooms[r].memory.labOrderArray.inputLab1.id);
                var inputLab2 = Game.getObjectById(Game.rooms[r].memory.labOrderArray.inputLab2.id);
                var outputLab = Game.getObjectById(Game.rooms[r].memory.labOrderArray.outputLab.id);

                if ((inputLab2.mineralType == Game.rooms[r].memory.labOrderArray.inputLab2.mineralType && inputLab2.mineralAmount >= amount) && (inputLab1.mineralType == Game.rooms[r].memory.labOrderArray.inputLab1.mineralType && inputLab1.mineralAmount >= amount)) {
                    // all material ready -> begin production
                    var tempArray = new Array();
                    tempArray["outputLab"] = Game.getObjectById(Game.rooms[r].memory.labOrderArray.outputLab.id);
                    tempArray["inputLab1"] = Game.getObjectById(Game.rooms[r].memory.labOrderArray.inputLab1.id);
                    tempArray["inputLab2"] = Game.getObjectById(Game.rooms[r].memory.labOrderArray.inputLab2.id);
                    Game.rooms[r].memory.productionArray = tempArray;
                    delete Game.rooms[r].memory.labOrderArray;
                    delete Game.rooms[r].memory.labOrder;
                }
            }
        }
    }
      //Cycle through creeps
      if (CPUdebug == true) { CPUdebugString.concat("<br>Starting creeps: " + Game.cpu.getUsed()) }
      // for every creep name in Game.creeps
      for (let name in Game.creeps) {
          // get the creep object
          var creep = Game.creeps[name];
          //Check for job queues
        if (creep.memory.jobQueueTask != undefined && creep.spawning == false) {
            //Job queue pending
            switch (creep.memory.jobQueueTask) {
                case "pickUpEnergy": //Dropped energy to be picked up
                    roleJobber.run(creep,"droppedEnergy");
                    break;

                case "remoteBuild": //Room without spawner needs builder
                    var newroom = Game.getObjectById(creep.memory.jobQueueObject);
                    break;
            }
            creep.memory.jobQueueTask = undefined;
        }
        else if (creep.spawning == false) {
            if (CPUdebug == true) {CPUdebugString.concat("<br>Start creep " + creep.name +"( "+ creep.memory.role + "): " + Game.cpu.getUsed())}
            if (creep.memory.role != "miner" && creep.memory.role != "distributor" && creep.memory.role != "scientist" &&_.sum(creep.carry) != creep.carry.energy) {
                // Minerals found in creep
                for (var resourceType in creep.carry) {
                    switch (resourceType) {
                        case RESOURCE_ENERGY:
                            break;
                        default:
                            if (creep.room.name != creep.memory.homeroom) {
                                creep.moveTo(Game.getObjectById(creep.memory.spawn), {reusePath: 5});
                            }
                            else {
                                // find closest container with space to get rid of minerals
                                var freeContainer = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                                if (creep.room.name != creep.memory.homeroom) {
                                    creep.moveTo(creep.memory.spawn);
                                }
                                else if (creep.transfer(freeContainer, resourceType) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(freeContainer, {reusePath: delayPathfinding});
                                }
                            }
                            break;
                    }
                }
            }
            else {
                // if creep is harvester, call harvester script
                if (creep.memory.role == 'harvester') {
                    roleHarvester.run(creep);
                }
                // if creep is upgrader, call upgrader script
                else if (creep.memory.role == 'upgrader') {
                    roleUpgrader.run(creep);
                }
                // if creep is builder, call builder script
                else if (creep.memory.role == 'builder') {
                    roleBuilder.run(creep);
                }
                // if creep is repairer, call repairer script
                else if (creep.memory.role == 'repairer') {
                    roleRepairer.run(creep);
                }
                // if creep is wallRepairer, call wallRepairer script
                else if (creep.memory.role == 'wallRepairer') {
                    roleWallRepairer.run(creep);
                }
                // if creep is remoteHarvester, call remoteHarvester script
                else if (creep.memory.role == 'remoteHarvester') {
                    roleRemoteHarvester.run(creep);
                }
                else if (creep.memory.role == 'protector') {
                    roleProtector.run(creep, allies);
                }
                else if (creep.memory.role == 'claimer') {
                    roleClaimer.run(creep);
                }
                else if (creep.memory.role == 'stationaryHarvester') {
                    roleStationaryHarvester.run(creep);
                }
                else if (creep.memory.role == 'miner') {
                    roleMiner.run(creep);
                }
                else if (creep.memory.role == 'distributor') {
                    roleDistributor.run(creep);
                }
                else if (creep.memory.role == 'demolisher') {
                    roleDemolisher.run(creep);
                }
                else if (creep.memory.role == 'energyTransporter') {
                    roleEnergyTransporter.run(creep);
                }
            }
        }
        if (CPUdebug == true) {CPUdebugString.concat("<br>Creep " + creep.name +"( "+ creep.memory.role + ") finished: " + Game.cpu.getUsed())}
    }
    if (CPUdebug == true) {
        CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
    }
  });
}
