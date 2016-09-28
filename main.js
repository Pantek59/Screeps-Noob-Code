const CPUdebug = true;
require("globals");
require('prototype.spawn')();
require('prototype.creep.findMyFlag')();
require('prototype.creep.findResource')();
require('functions.creeps')();
require('functions.game');

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
var roleEnergyHauler = require("role.energyHauler");
var roleRemoteStationaryHarvester = require('role.remoteStationaryHarvester');
var roleAttacker = require('role.attacker');
var roleEinarr = require('role.einarr');
var roleScientist = require('role.scientist');

var CPUdebugString = "CPU Debug<br><br>";
// Any modules that you use that modify the game's prototypes should be require'd before you require the profiler.
const profiler = require('screeps-profiler'); // cf. https://www.npmjs.com/package/screeps-profiler

// This line monkey patches the global prototypes.
//profiler.enable();
module.exports.loop = function() {
    //profiler.wrap(function() {
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

        // Market Code
        if (Game.time % 10 == 0) {
            //Look for surplus materials
            var surplusMinerals;

            for (var r in Game.rooms) {
                for (var resource in Game.rooms[r].memory.resourceLimits) {
                    if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket && Game.rooms[r].terminal != undefined && Game.rooms[r].memory.terminalTransfer == undefined && Game.rooms[r].memory.resourceLimits[resource] != undefined) {
                        if (Game.rooms[r].storage.store[resource] + Game.rooms[r].terminal.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket + 100) {
                            surplusMinerals = Game.rooms[r].storage.store[resource] + Game.rooms[r].terminal.store[resource] - Game.rooms[r].memory.resourceLimits[resource].minMarket;

                            if (surplusMinerals >= 500) {
                                surplusMinerals = 500;
                                var orders = new Array();
                                orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
                                orders = _.sortBy(orders, "price");
                                orders.reverse();
                                for (var o = 0; o < orders.length; o++) {
                                    var orderResource = orders[o].resourceType;
                                    var orderRoomName = orders[o].roomName;
                                    var orderAmount;
                                    if (surplusMinerals > orders[o].amount) {
                                        orderAmount = orders[o].amount;
                                    }
                                    else {
                                        orderAmount = surplusMinerals;
                                    }
                                    var orderCosts = global.terminalTransfer(orderResource, orderAmount, orderRoomName, "cost");
                                    if (orderAmount >= 500 && Game.map.getRoomLinearDistance(Game.rooms[r].name, orderRoomName) < 13 && orderCosts <= Game.rooms[r].storage.store[RESOURCE_ENERGY] - 10000) {
                                        Game.rooms[r].memory.terminalTransfer = orders[o].id + ":" + orderAmount + ":" + orderResource + ":MarketOrder";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (Game.time % 10 == 0) {
            // Inter-room energy balancing
            var fullRooms = new Array();
            var recipientRooms = new Array();

            for (var r in Game.rooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].terminal != undefined && (Game.rooms[r].terminal.store[RESOURCE_ENERGY] + Game.rooms[r].storage.store[RESOURCE_ENERGY]) > 120000 && Game.rooms[r].memory.terminalTransfer == undefined) {
                    fullRooms.push(Game.rooms[r]);
                }
                else if (Game.rooms[r].storage != undefined && Game.rooms[r].terminal != undefined && (Game.rooms[r].terminal.store[RESOURCE_ENERGY] + Game.rooms[r].storage.store[RESOURCE_ENERGY]) < 100000) {
                    recipientRooms.push(Game.rooms[r]);
                }
            }

            if (fullRooms.length > 0) {
                if (recipientRooms.length > 0) {
                    recipientRooms = _.sortBy(recipientRooms, function(room){ return room.storage.store[RESOURCE_ENERGY]});
                    fullRooms[0].memory.terminalTransfer = recipientRooms[0].name + ":2000:energy:Energy Balance";
                }
                else {
                    fullRooms[0].memory.terminalTransfer = "W16S47:3500:energy:King_Lispi";
                }
            }

            /* TODO: Inter-room mineral balancing
            var fullRooms = _.filter(Game.rooms, {filter: (s) => s.storage != undefined && s.terminal != undefined && _.sum(s.storage.store) > 750000});
            if (fullRooms.length > 0) {
                var recipientRooms = _.filter(Game.rooms, {filter: (s) => s.storage != undefined && s.terminal != undefined && _.sum(s.storage.store) < 500000});
                if (recipientRooms.length > 0) {
                }
            }*/
        }



        if (CPUdebug == true) {CPUdebugString.concat("<br>Start cycling through rooms: " + Game.cpu.getUsed())}
        // Cycle through rooms
        for (var r in Game.rooms) {
            //if (Game.rooms[r].memory.terminalTransfer == 0) {delete Game.rooms[r].memory.terminalTransfer}

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

            if (Game.rooms[r].memory.resourceLimits == undefined) {
                //Set default resource limits
                var roomLimits = {};
                var limit;
                for (var res in RESOURCES_ALL) {
                    roomLimits[RESOURCES_ALL[res]] = {};
                    if (Game.rooms[r].memory.roomArrayMinerals != undefined && Game.getObjectById(Game.rooms[r].memory.roomArrayMinerals[0]).mineralType == RESOURCES_ALL[res]) {
                        limit = {maxTerminal:0, maxMining:350000, minMarket:1000000, maxLab: 0};
                    }
                    else {
                        limit = {maxTerminal:0, maxMining:0, minMarket:1000000, maxLab: 0};
                    }
                    roomLimits[RESOURCES_ALL[res]] = limit;
                }
                Game.rooms[r].memory.resourceLimits = roomLimits;
            }

            //Remove deprecated memory entries
            delete Game.rooms[r].memory.roomMineralLimit;
            delete Game.rooms[r].memory.roomMarketLimit;
            delete Game.rooms[r].memory.IDofSources;
            delete Game.rooms[r].memory.resourceTicker;

            //  Refresher (will be executed every few ticks)
            var searchResult;
            if (Game.time % delayRoomScanning == 0) {
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

                var NukerIDs = new Array();
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER});
                for (let s in searchResult) {
                    NukerIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayNukers = NukerIDs;

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
            //TODO Energyhaul sites must be included in one step
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

            var stationaryRemoteHarvestingFlags = _.filter(Game.flags,{ memory: { function: 'haulEnergy'}});

            for (var f in stationaryRemoteHarvestingFlags) {
                var flag = stationaryRemoteHarvestingFlags[f];
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
                    //var claimFlags = _.filter(Game.flags,{ memory: { function: 'remoteController'}});
                    var claimFlags = Game.rooms[r].find(FIND_FLAGS, { filter: (s) => s.pos.roomName == Game.rooms[r].name && s.memory.function == "remoteController"});
                    var upgraderRecruits = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: Game.rooms[r].name}});
                    if (upgraderRecruits.length < 1) {
                        var roomName;
                        if (claimFlags.length > 0) {
                            //Claimer present, read homeroom
                            var newUpgraders = _.filter(Game.creeps,{ memory: { role: 'upgrader', homeroom: claimFlags[0].memory.supply}});
                            if (newUpgraders.length > 0) {
                                var targetCreep = newUpgraders;
                                roomName=claimFlags[0].memory.supply;
                            }
                        }
                        else {
                            for (var x in Game.rooms) {
                                if(Game.rooms[x] != undefined && Game.rooms[x] != Game.rooms[r]){
                                    var newUpgraders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "upgrader" && s.carry.energy == 0});
                                    if (newUpgraders.length > 0) {
                                        var targetCreep = newUpgraders;
                                        roomName=Game.rooms[x].name;
                                    }
                                }
                            }
                        }
                        for (var g in newUpgraders) {
                            var targetCreep = newUpgraders[g];
                            if (targetCreep != undefined && targetCreep.carry.energy == 0 && targetCreep.ticksToLive > 500) {
                                targetCreep.memory.homeroom = Game.rooms[r].name;
                                targetCreep.memory.spawn = Game.rooms[r].controller.id;
                                console.log("<font color=#ffff00 type='highlight'>" + targetCreep.name + " has been captured in room " + targetCreep.pos.roomName + " as an upgrader by room " + Game.rooms[r].name + ".</font>");
                                break;
                            }
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
                                    var newBuilders = Game.rooms[x].find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "repairer" && s.carry.energy == 0});
                                    if (newBuilders.length > 0) {
                                        var targetCreepBuilder = newBuilders[0];
                                        roomName=Game.rooms[x].name;
                                    }
                                }
                            }
                        }
                        if (targetCreepBuilder != undefined && targetCreepBuilder.carry.energy == 0 && targetCreepBuilder.ticksToLive > 500) {
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
                var maxAttackBodyParts = 0;
                var AttackBodyParts = 0;
                var attackingInvader = undefined;

                for (var h in hostiles) {
                    AttackBodyParts = 0;
                    for (var part in hostiles[h].body) {
                        if (hostiles[h].body[part].type == ATTACK) {
                            //Healing body part found
                            AttackBodyParts++;
                        }
                    }

                    if (AttackBodyParts > maxAttackBodyParts) {
                        maxAttackBodyParts = AttackBodyParts;
                        attackingInvader = hostiles[h].id;
                    }
                }

                if (hostiles.length > 0) {
                    if (attackingInvader != undefined) {
                        hostiles[0] = Game.getObjectById(attackingInvader);
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
            }

            // Search for dropped energy
            if (CPUdebug == true) {CPUdebugString.concat("<br>Start dropped energy search: " + Game.cpu.getUsed())}
            var energies=Game.rooms[r].find(FIND_DROPPED_ENERGY);
            for (var energy in energies) {
                var energyID = energies[energy].id;
                var energyAmount = energies[energy].amount;

                if (energyAmount > 15 && Game.rooms[r].memory.hostiles == 0) {
                    var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) >= 0 && s.memory.role != "protector" && s.memory.role != "distributor" && s.memory.dropEnergy != true});

                    if (collector == null) {
                        collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                                filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0 && s.memory.role != "protector" && s.memory.role != "distributor" && s.memory.dropEnergy != true});
                    }

                    if (collector != null) {
                        // Creep found to pick up dropped energy
                        collector.memory.jobQueueObject = energyID;
                        collector.memory.jobQueueTask = "pickUpEnergy";
                    }
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
                                if (fillLinks[i].energy + emptyLinks[link].energy < 799) {
                                    emptyLinks[link].transferEnergy(fillLinks[i], emptyLinks[link].energy);
                                }
                                else if (fillLinks[i].energy < 790) {
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

                    if (maxLink != undefined && maxLink.id != minLink.id && fillLinks.length > 1 && maxLevel > targetLevel) {
                        maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
                    }
                }
            }

            // Terminal code
            if (CPUdebug == true) {CPUdebugString.concat("<br>Starting terminal code: " + Game.cpu.getUsed())}
            if (Game.rooms[r].memory.terminalTransfer != undefined) {
                var terminal = Game.rooms[r].terminal;
                if (terminal != undefined && Game.rooms[r].memory.terminalTransfer != undefined) {
                    //Terminal exists
                    var targetRoom;
                    var amount;
                    var resource;
                    var comment;
                    var energyCost;
                    var info = Game.rooms[r].memory.terminalTransfer;
                    info = info.split(":");
                    targetRoom = info[0];
                    amount = parseInt(info[1]);
                    resource = info[2];
                    comment = info[3];

                    energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
                    Game.rooms[r].memory.terminalEnergyCost = energyCost;
                    if (comment != "MarketOrder") {
                        var energyTransferAmount = parseInt(energyCost) + parseInt(amount);
                        if ((resource != RESOURCE_ENERGY && amount > 500 && terminal.store[resource] >= 500 && (terminal.store[RESOURCE_ENERGY]) >= Game.market.calcTransactionCost(500, terminal.room.name, targetRoom))
                            || (resource == RESOURCE_ENERGY && amount > 500 && terminal.store[resource] >= 500 && (terminal.store[RESOURCE_ENERGY]) - 500 >= Game.market.calcTransactionCost(500, terminal.room.name, targetRoom))) {
                            if (terminal.send(resource, 500, targetRoom, comment) == OK) {
                                info[1] -= 500;
                                Game.rooms[r].memory.terminalTransfer = info.join(":");
                                console.log("<font color=#009bff type='highlight'>" + Game.rooms[r].name + ": 500/" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + Game.market.calcTransactionCost(500, terminal.room.name, targetRoom) + " energy: " + comment + "</font>");
                            }
                            else {
                                console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, 500, targetRoom, comment) + "</font>");
                            }
                        }
                        else if ((resource == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] >= energyTransferAmount)
                            || (resource != RESOURCE_ENERGY && terminal.store[resource] >= amount && terminal.store[RESOURCE_ENERGY] >= energyCost)) {
                            // Amount to be transferred reached and enough energy available -> GO!
                            if (terminal.send(resource, amount, targetRoom, comment) == OK) {
                                delete Game.rooms[r].memory.terminalTransfer;
                                delete Game.rooms[r].memory.terminalEnergyCost;
                                console.log("<font color=#009bff type='highlight'>" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + energyCost + " energy: " + comment + "</font>");
                            }
                            else {
                                console.log("<font color=#ff0000 type='highlight'>Terminal transfer error: " + terminal.send(resource, amount, targetRoom, comment) + "</font>");
                            }
                        }
                    }
                    else {
                        // Market Order
                        var orderID = targetRoom;
                        var order = Game.market.getOrderById(orderID);

                        energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, order.roomName);
                        Game.rooms[r].memory.terminalEnergyCost = energyCost;
                        if (Game.rooms[r].terminal.store[resource] >= amount && Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket) {
                            if (resource == RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= amount + energyCost ||
                                resource != RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= energyCost) {
                                //Do the deal!
                                if (Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
                                    console.log("<font color=#33ffff type='highlight'>" + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                }
                            }
                        }
                    }
                }
            }

            // Lab code
            if (Game.rooms[r].memory.innerLabs == undefined) {
                // Prepare link roles
                var emptyArray = {};
                var innerLabs = [];
                emptyArray["labID"] = "[LAB_ID]";
                emptyArray["resource"] = "[RESOURCE]";
                innerLabs.push(emptyArray);
                innerLabs.push(emptyArray);
                Game.rooms[r].memory.innerLabs = innerLabs;
            }
            if (Game.rooms[r].memory.labOrder != undefined) { //FORMAT: 500:H:Z:[prepare/running/done]
                var innerLabs = [];
                if (Game.rooms[r].memory.innerLabs == undefined) {
                    // Prepare link roles
                    var emptyArray = {};
                    emptyArray["labID"] = "[LAB_ID]";
                    emptyArray["resource"] = "[RESOURCE]";
                    innerLabs.push(emptyArray);
                    Game.rooms[r].memory.innerLabs = innerLabs;
                }
                else if (Game.rooms[r].memory.innerLabs[0].labID != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1].labID != "[LAB_ID]") {
                    innerLabs = Game.rooms[r].memory.innerLabs;
                    var labOrder = Game.rooms[r].memory.labOrder.split(":");
                    if (innerLabs.length == 2) {
                        //There are two innerLabs defined
                        if (innerLabs[0].resource != labOrder[1] || innerLabs[1].resource != labOrder[2]) {
                            //Set inner lab resource to ingredients
                            innerLabs[0].resource = labOrder[1];
                            innerLabs[1].resource = labOrder[2];
                            Game.rooms[r].memory.innerLabs = innerLabs;
                        }
                        var rawAmount = labOrder[0];
                        if (rawAmount > Game.getObjectById(innerLabs[0].labID).mineralCapacity) {
                            rawAmount = Game.getObjectById(innerLabs[0].labID).mineralCapacity;
                        }

                        if (labOrder[3] == "prepare" && Game.getObjectById(innerLabs[0].labID).mineralType == innerLabs[0].resource && Game.getObjectById(innerLabs[0].labID).mineralAmount == rawAmount
                         && Game.getObjectById(innerLabs[1].labID).mineralType == innerLabs[1].resource && Game.getObjectById(innerLabs[1].labID).mineralAmount == rawAmount) {
                            labOrder[3] = "running";
                            Game.rooms[r].memory.labOrder = labOrder.join(":");
                        }
                        if (labOrder[3] == "running") {
                            // Reaction can be started
                            for (var lab in Game.rooms[r].memory.roomArrayLabs) {
                                if (Game.rooms[r].memory.roomArrayLabs[lab] != innerLabs[0].labID && Game.rooms[r].memory.roomArrayLabs[lab] != innerLabs[1].labID) {
                                    if (Game.getObjectById(innerLabs[0].labID).mineralAmount > 0 && Game.getObjectById(innerLabs[1].labID).mineralAmount > 0) {
                                        //Still enough material to do a reaction
                                        var currentLab = Game.getObjectById(Game.rooms[r].memory.roomArrayLabs[lab]);
                                        if (currentLab.cooldown == 0) {
                                            currentLab.runReaction(Game.getObjectById(innerLabs[0].labID), Game.getObjectById(innerLabs[1].labID));
                                        }
                                    }
                                    else {
                                        labOrder[3] = "done";
                                        Game.rooms[r].memory.labOrder = labOrder.join(":");
                                    }
                                }
                            }
                        }
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

                    case "distributor": //Small amount distribution job pending
                        roleJobber.run(creep,"distributor");
                        break;
                }
            creep.memory.jobQueueTask = undefined;
            }
            else if (creep.spawning == false) {
                if (CPUdebug == true) {CPUdebugString.concat("<br>Start creep " + creep.name +"( "+ creep.memory.role + "): " + Game.cpu.getUsed())}
                if (creep.memory.role != "miner" && creep.memory.role != "distributor" && creep.memory.role != "scientist" && _.sum(creep.carry) != creep.carry.energy) {
                    // Minerals found in creep
                    creep.getRidOfMinerals();
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
                    else if (creep.memory.role == 'bigClaimer') {
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
                    else if (creep.memory.role == 'energyHauler') {
                        roleEnergyHauler.run(creep);
                    }
                    else if (creep.memory.role == 'remoteStationaryHarvester') {
                        roleRemoteStationaryHarvester.run(creep);
                    }
                    else if (creep.memory.role == 'attacker') {
                        roleAttacker.run(creep);
                    }
                    else if (creep.memory.role == 'einarr') {
                        roleEinarr.run(creep);
                    }
                    else if (creep.memory.role == 'scientist') {
                        roleScientist.run(creep);
                    }
                }
            }
            if (CPUdebug == true) {CPUdebugString.concat("<br>Creep " + creep.name +"( "+ creep.memory.role + ") finished: " + Game.cpu.getUsed())}
        }
        if (CPUdebug == true) {
            CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
        }
    //});
}
