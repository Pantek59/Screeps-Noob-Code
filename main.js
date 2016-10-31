
const CPUdebug = false;
require("globals");
require('prototype.spawn2')();
require('prototype.creep.findMyFlag')();
require('prototype.creep.findResource')();
require('functions.creeps')();
require('functions.game');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleRemoteHarvester = require('role.remoteHarvester');
var roleProtector = require('role.protector');
var roleClaimer = require('role.claimer');
var roleStationaryHarvester = require('role.stationaryHarvester');
var roleMiner = require('role.miner');
var roleDistributor = require("role.distributor");
var roleDemolisher = require('role.demolisher');
var moduleSpawnCreeps = require('module.spawnCreeps');
var roleEnergyTransporter = require("role.energyTransporter");
var roleEnergyHauler = require("role.energyHauler");
var roleRemoteStationaryHarvester = require('role.remoteStationaryHarvester');
var roleUnit = require('role.unit');
var roleScientist = require('role.scientist');
var roleBigClaimer = require('role.bigClaimer');
var roleTransporter = require('role.transporter');

var CPUdebugString = "CPU Debug<br><br>";

function memCleanFlags(){
    memCleanThingy(Game.flags,Memory.flags);    
}
function memCleanCreeps(){
    memCleanThingy(Game.creeps,Memory.creeps);
}
//delete obsolete memory entries
//g - in game objects
//m - in memory data
function memCleanThingy(g,m){
    // check for memory entries of non existent 
    for (var name in m) {
        // and checking if the it is still alive
        if (g[name] == undefined) {
            // if not, delete the memory entry
            delete m[name];
        }
    }
}

// Any modules that you use that modify the game's prototypes should be require'd before you require the profiler.
const profiler = require('screeps-profiler'); // cf. https://www.npmjs.com/package/screeps-profiler

// This line monkey patches the global prototypes.
//profiler.enable();
module.exports.loop = function() {
    //profiler.wrap(function() {
        if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed())}
        // check for memory entries of died creeps by iterating over Memory.creeps
        memCleanCreeps();
        // same for flags
        //memCleanFlags(); //Flags do not count as memory (yet), therefore not necessary (yet)
    
        var senex = _.filter(Game.creeps,{ ticksToLive: 1});
        for (var ind in senex) {
            console.log("<font color=#ffffff type='highlight'>Creep expired: " + senex[ind].name + " the \"" + senex[ind].memory.role + "\" in room " + senex[ind].room.name + ".</font>");
        }

        /*Observer Code
        //TODO: Scan rooms in 10 rooms distance for room info and save it in an object
        var observerRooms = _.filter(Game.rooms, function(room) {return room.memory.roomArrayObservers != undefined && room.memory.roomArrayObservers.length > 0;});
        */

        // Flag colors
        if (Game.time % DELAYFLAGCOLORS == 0) {
            //only flags for unit group should have only one color
            for (let f in Game.flags) {
                switch (Game.flags[f].memory.function) {
                    case "narrowSource":
                        //stationaryHarvester
                        Game.flags[f].setColor(COLOR_BROWN, COLOR_YELLOW);
                        break;

                    case "remoteController":
                        //claimer
                        Game.flags[f].setColor(COLOR_CYAN, COLOR_PURPLE);
                        break;

                    case "attackController":
                        //bigClaimer
                        Game.flags[f].setColor(COLOR_CYAN, COLOR_RED);
                        break;

                    case "remoteSource":
                        //remoteHarvester
                        Game.flags[f].setColor(COLOR_GREEN, COLOR_YELLOW);
                        break;

                    case "haulEnergy":
                        //remoteStationaryHarvester & energyHauler
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_YELLOW);
                        break;

                    case "protector":
                        //protector
                        Game.flags[f].setColor(COLOR_RED, COLOR_BROWN);
                        break;

                    case "demolish":
                        //demolisher
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_RED);
                        break;

                    case "transporter":
                        //transporter
                        Game.flags[f].setColor(COLOR_BLUE, COLOR_BROWN);
                        break;

                    case "realmExit":
                        //Flag marking the edge of civilization
                        Game.flags[f].setColor(COLOR_WHITE, COLOR_BROWN);
                        break;
                }
            }
        }

        // Single Market Buy Orders
        if (Game.time % DELAYMARKETBUY == 0 && Game.cpu.bucket > CPU_THRESHOLD && Memory.buyOrder != undefined) {
            let info = Memory.buyOrder.split(":"); //Format: [AMOUNT]:[ORDERID]
            var left = info[0];
            var order =Game.market.getOrderById(info[1]);
            if (order != null) {
                if (left > 5000) {
                    left = 5000;
                }

                var bestRoom;
                if (Memory.buyRoom != undefined) {
                    bestRoom = Game.rooms[Memory.buyRoom];
                }
                else {
                    var bestCost = 999999;
                    for (var r in myRooms) {
                        var cost = Game.market.calcTransactionCost(left, order.roomName, myRooms[r].name);
                        if (myRooms[r].terminal != undefined && myRooms[r].terminal.owner.username == playerUsername) {
                            if (bestCost > cost) {
                                bestRoom = myRooms[r];
                                bestCost = cost;
                            }
                        }
                    }
                    if (bestRoom == undefined || bestRoom.name == undefined) {
                        console.log("No room with enough energy found!");
                    }
                    else {
                        Memory.buyRoom = bestRoom.name;
                    }
                }

                var returnCode = Game.market.deal(order.id, left, bestRoom.name);
                if (returnCode == OK) {
                    info[0] -= left;
                    console.log("<font color=#fe2ec8 type='highlight'>" + left + " " + order.resourceType + " bought in room " + bestRoom.name + " for " + (left * order.price) + " credits.</font>");

                    if (info[0] > 0) {
                        Memory.buyOrder = info.join(":");
                    }
                    else {
                        delete Memory.buyOrder;
                        delete Memory.buyRoom;
                        console.log("<font color=#fe2ec8 type='highlight'>Buy order accomplished.</font>");
                    }
                }
            }
            else {
                delete Memory.buyOrder;
                delete Memory.buyRoom;
                console.log("<font color=#fe2ec8 type='highlight'>Buy order cancelled since it disappeared from market.</font>");
            }
        }
    // Market Auto Selling Code
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Market Code: " + Game.cpu.getUsed())}
        if (Game.time % DELAYMARKETAUTOSELL == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
            //Remove expired market orders
            let expiredOrders = _.filter(Game.market.orders, {remainingAmount: 0});
            if (expiredOrders.length > 0) {
                for (let o in expiredOrders) {
                    Game.market.cancelOrder(expiredOrders[o].id);
                }
            }

            //Look for surplus materials
            var surplusMinerals;

            for (var r in myRooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[RESOURCE_ENERGY] > 0 && Game.rooms[r].terminal != undefined && _.sum(Game.rooms[r].terminal.store) < TERMINALMAXFILLING &&  Game.rooms[r].memory.terminalTransfer == undefined) {
                    for (var resource in Game.rooms[r].memory.resourceLimits) {
                        if (Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket && Game.rooms[r].memory.resourceLimits[resource] != undefined) {

                            if (Game.rooms[r].storage.store[resource] > Game.rooms[r].memory.resourceLimits[resource].minMarket + 100) {
                                surplusMinerals = Game.rooms[r].storage.store[resource] - Game.rooms[r].memory.resourceLimits[resource].minMarket;
                                if (surplusMinerals >= 10000) {
                                    surplusMinerals = 10000;
                                    var orders = [];
                                    if (Memory.marketBuffer == undefined || Game.time % (2 * DELAYMARKETAUTOSELL) == 0) {
                                        orders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: resource});
                                        orders = _.sortBy(orders, "price");
                                        orders.reverse();
                                        Memory.marketBuffer = orders;
                                    }
                                    else {
                                        orders = Memory.marketBuffer
                                    }

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
                                        var roomDistance = Math.floor(Game.rooms[r].storage.store[RESOURCE_ENERGY] / 7500);
                                        if (orderAmount >= 500 && Game.map.getRoomLinearDistance(Game.rooms[r].name, orderRoomName) < roomDistance && orderCosts <= Game.rooms[r].storage.store[RESOURCE_ENERGY] - 10000) {
                                            Game.rooms[r].memory.terminalTransfer = orders[o].id + ":" + orderAmount + ":" + orderResource + ":MarketOrder";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Resource Balancing: " + Game.cpu.getUsed())}
    if (Game.time % DELAYRESOURCEBALANCING == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
        // Inter-room resource balancing
        for (let r in myRooms) {
            if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername
                && Game.rooms[r].storage.store[RESOURCE_ENERGY] > 5000 && Game.rooms[r].memory.terminalTransfer == undefined) {
                var combinedResources = [];
                for (let e in Game.rooms[r].storage.store) {
                    if (combinedResources.indexOf(e) == -1) {
                        combinedResources.push(e);
                    }
                }
                for (let e in Game.rooms[r].terminal.store) {
                    if (combinedResources.indexOf(e) == -1) {
                        combinedResources.push(e);
                    }
                }
                var checkedResources = [];
                combinedResources = _.sortBy(combinedResources, function (res) {return checkStorageLimits(Game.rooms[r], res);});
                combinedResources = combinedResources.reverse();

                for (let n in combinedResources) {
                    //Iterate through resources in terminal and/or storage
                    if (checkedResources.indexOf(combinedResources[n]) == -1) {
                        var storageDelta = checkStorageLimits(Game.rooms[r], combinedResources[n]);
                        var packetSize = RBS_PACKETSIZE;
                        if (combinedResources[n] == RESOURCE_ENERGY) {
                            packetSize = RBS_PACKETSIZE * 10;
                        }

                        if (storageDelta >= (Game.rooms[r].memory.resourceLimits[combinedResources[n]].maxStorage * 0.1) && packetSize <= Game.rooms[r].storage.store[combinedResources[n]]&& storageDelta <= Game.rooms[r].storage.store[combinedResources[n]] && Game.rooms[r].memory.terminalTransfer == undefined) {
                            // Resource can be shared with other rooms if their maxStorage is not reached yet
                            checkedResources.push(n);
                            let recipientRooms = [];
                            let fullRooms = [];
                            for (var ru in myRooms) {
                                if (Game.rooms[ru].name != Game.rooms[r].name && Game.rooms[ru].storage != undefined && Game.rooms[ru].terminal != undefined && Game.rooms[ru].storage.owner.username == playerUsername) {
                                    if (checkStorageLimits(Game.rooms[ru], combinedResources[n]) < 0) {
                                        recipientRooms.push(Game.rooms[ru]);
                                    }
                                    else {
                                        fullRooms.push(Game.rooms[ru]);
                                    }
                                }
                            }
                            recipientRooms = _.sortBy(recipientRooms,function (room) { return checkStorageLimits(room, combinedResources[n]);});
                            fullRooms = _.sortBy(fullRooms,function (room) { return checkStorageLimits(room, combinedResources[n]);});
                            if (recipientRooms.length > 0) {
                                let recipientDelta = checkStorageLimits(recipientRooms[0], combinedResources[n]);
                                if (recipientDelta < 0) {
                                    // Recipient room need the resource
                                    let transferAmount;
                                    if (storageDelta + recipientDelta >= 0) {
                                        transferAmount = Math.abs(recipientDelta);
                                    }
                                    else {
                                        transferAmount = storageDelta;
                                    }

                                    if (transferAmount < 100) {
                                        transferAmount = 100;
                                    }

                                    terminalTransferX(combinedResources[n], transferAmount, Game.rooms[r].name, recipientRooms[0].name, true);
                                    break;
                                }
                            }
                            else if (fullRooms.length > 0) {
                                // Room is over storage limit --> look for rooms with less of the resource
                                for (let p in fullRooms) {
                                    if (fullRooms[p].storage != undefined && (fullRooms[p].storage.store[combinedResources[n]] == undefined || checkStorageLimits(Game.rooms[r], combinedResources[n]) > checkStorageLimits(fullRooms[p], combinedResources[n]) + packetSize)) {
                                        //room with less minerals found
                                        terminalTransferX(combinedResources[n], packetSize / 2, Game.rooms[r].name, fullRooms[p].name, true);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start cycling through rooms: " + Game.cpu.getUsed())}
        // Cycle through rooms
        for (var r in Game.rooms) {

            //Save # of hostile creeps in room
            var enemies = Game.rooms[r].find(FIND_HOSTILE_CREEPS);
            Game.rooms[r].memory.hostiles = _.filter(enemies, function (e) {return (isHostile(e))});



            //Set default resource limits:
            if (Game.rooms[r].memory.resourceLimits == undefined && Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                var roomLimits = {};
                var limit;
                for (var res in RESOURCES_ALL) {
                    roomLimits[RESOURCES_ALL[res]] = {};
                    if (Game.rooms[r].memory.roomArrayMinerals != undefined && Game.getObjectById(Game.rooms[r].memory.roomArrayMinerals[0]).mineralType == RESOURCES_ALL[res]) {
                        //Room mineral
                        limit = {minTerminal:0, maxStorage:6000, minMarket:500000, minProduction: 600000};
                    }
                    else if (RESOURCES_ALL[res] == RESOURCE_ENERGY) {
                        //Energy
                        limit = {minTerminal:0, maxStorage:100000, minMarket:900000, minProduction: 1000000};
                    }
                    else {
                        // Rest
                        limit = {minTerminal:0, maxStorage:6000, minMarket:900000, minProduction: 0};
                    }
                    roomLimits[RESOURCES_ALL[res]] = limit;
                }
                Game.rooms[r].memory.resourceLimits = roomLimits;
            }

            //Build RCL8 installations
            if (Game.time % DELAYRCL8INSTALLATION == 0 && Game.rooms[r].controller != undefined && Game.rooms[r].controller.level == 8 && Game.rooms[r].controller.owner.username == playerUsername) {
                let structures = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER || s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_TOWER || s.structureType == STRUCTURE_STORAGE});
                for (let s in structures) {
                    let foundStructures = structures[s].pos.lookFor(LOOK_STRUCTURES);
                    foundStructures = foundStructures.concat(structures[s].pos.lookFor(LOOK_CONSTRUCTION_SITES));
                    let ramparts = _.filter(foundStructures, function (s) { return s.structureType == STRUCTURE_RAMPART});
                    if (ramparts.length == 0) {
                        structures[s].pos.createConstructionSite(STRUCTURE_RAMPART);
                        console.log("built");
                    }
                }
            }

            //  Refresher (will be executed every few ticks)
            var searchResult;
            if (Game.time % DELAYROOMSCANNING == 0) {
                // Preloading room structure
                var defenseObjects = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                defenseObjects = _.sortBy(defenseObjects,"hits");

                if (defenseObjects != undefined && defenseObjects[0] != undefined && ((Game.rooms[r].controller.level == 8 && defenseObjects[0].hits > WALLMAX * 2) || (Game.rooms[r].controller.level < 8 && defenseObjects[0].hits > WALLMAX))) {
                    Game.rooms[r].memory.roomSecure = true;
                }
                else if (Game.rooms[r].memory.roomSecure != undefined) {
                    delete Game.rooms[r].memory.roomSecure;
                }

                if (Game.rooms[r].memory.roomArraySources == undefined) {
                    var sourceIDs = [];
                    searchResult = Game.rooms[r].find(FIND_SOURCES);
                    for (let s in searchResult) {
                        sourceIDs.push(searchResult[s].id);
                    }
                    Game.rooms[r].memory.roomArraySources = sourceIDs;
                }

                if (Game.rooms[r].memory.roomArrayMinerals == undefined) {
                    var sourceIDs = [];
                    searchResult = Game.rooms[r].find(FIND_MINERALS);
                    for (let s in searchResult) {
                        sourceIDs.push(searchResult[s].id);
                    }
                    Game.rooms[r].memory.roomArrayMinerals = sourceIDs;
                }

                var containerIDs = [];
                searchResult = Game.rooms[r].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
                for (let s in searchResult) {
                    containerIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayContainers = containerIDs;

                var powerSpawnIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN});
                for (let s in searchResult) {
                    powerSpawnIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayPowerSpawns = powerSpawnIDs;

                var spawnIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                for (let s in searchResult) {
                    spawnIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArraySpawns = spawnIDs;

                var extensionIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
                for (let s in searchResult) {
                    extensionIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayExtensions = extensionIDs;

                var LinkIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LINK});
                for (let s in searchResult) {
                    LinkIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayLinks = LinkIDs;

                var LabIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_LAB});
                for (let s in searchResult) {
                    LabIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayLabs = LabIDs;

                var ExtractorIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR});
                for (let s in searchResult) {
                    ExtractorIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayExtractors = ExtractorIDs;

                var rampartIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                for (let s in searchResult) {
                    rampartIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayRamparts = rampartIDs;

                var nukerIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_NUKER});
                for (let s in searchResult) {
                    nukerIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayNukers = nukerIDs;

                var observerIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_OBSERVER});
                for (let s in searchResult) {
                    observerIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayObservers = observerIDs;

                var towerIDs = [];
                searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
                for (let s in searchResult) {
                    towerIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayTowers = towerIDs;

                var lairIDs = [];
                searchResult = Game.rooms[r].find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR});
                for (let s in searchResult) {
                    lairIDs.push(searchResult[s].id);
                }
                Game.rooms[r].memory.roomArrayLairs = lairIDs;

                if (Game.rooms[r].memory.roomArrayConstructionSites == undefined) {
                    var constructionIDs = [];
                    searchResult = Game.rooms[r].find(FIND_MY_CONSTRUCTION_SITES);
                    for (let s in searchResult) {
                        constructionIDs.push(searchResult[s].id);
                    }
                    Game.rooms[r].memory.roomArrayConstructionSites = constructionIDs;
                }
            }

            //Check master spawn
            if (Game.rooms[r].memory.masterSpawn != undefined && Game.getObjectById(Game.rooms[r].memory.masterSpawn) == null) {
                delete Game.rooms[r].memory.masterSpawn;
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

            //Panic flag code
            //TODO Energyhaul sites must be included in one step
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting flag code: " + Game.cpu.getUsed())}
            if (Game.time % DELAYPANICFLAG == 0) {
                // Check existing flags
                let panicFlags = Game.rooms[r].find(FIND_FLAGS,{filter: (f) => f.memory.function == "protector" && f.memory.panic == true});
                if (panicFlags.length > 0 && Game.rooms[r].memory.hostiles.length == 0) {
                    for (let f in panicFlags) {
                        Game.flags[panicFlags[f].name].remove();
                    }
                }

                //Set new flags
                var remoteHarvestingFlags = _.filter(Game.flags, {memory: {function: 'remoteSource'}});
                for (var f in remoteHarvestingFlags) {
                    var flag = remoteHarvestingFlags[f];
                    if (flag.room != undefined) {
                        // We have visibility in room
                        if (flag.room.memory.hostiles.length > 0 && flag.room.memory.panicFlag == undefined && flag.memory.skr == undefined) {
                            //Hostiles present in room with remote harvesters
                            var panicFlag = flag.pos.createFlag(); // create white panic flag to attract protectors
                            flag.room.memory.panicFlag = panicFlag;
                            panicFlag = _.filter(Game.flags, {name: panicFlag})[0];
                            panicFlag.memory.function = "protector";
                            panicFlag.memory.volume = flag.room.memory.hostiles.length;
                            panicFlag.memory.spawn = flag.memory.spawn;
                            panicFlag.memory.panic = true;

                            console.log("<font color=#ff0000 type='highlight'>Panic flag has been set in room " + flag.room.name + " for room " + Game.getObjectById(panicFlag.memory.spawn).room.name + "</font>");
                        }
                        else if (flag.room.memory.hostiles.length == 0 && flag.room.memory.panicFlag != undefined) {
                            // No hostiles present in room with remote harvesters
                            var tempFlag = _.filter(Game.flags, {name: flag.room.memory.panicFlag})[0];
                            tempFlag.remove();
                            delete flag.room.memory.panicFlag;
                        }
                    }
                }

                var stationaryRemoteHarvestingFlags = _.filter(Game.flags, {memory: {function: 'haulEnergy'}});

                for (var f in stationaryRemoteHarvestingFlags) {
                    var flag = stationaryRemoteHarvestingFlags[f];
                    if (flag.room != undefined) {
                        // We have visibility in room
                        if (flag.room.memory.hostiles.length > 0 && flag.room.memory.panicFlag == undefined && flag.memory.skr == undefined) {
                            //Hostiles present in room with remote harvesters
                            var panicFlag = flag.pos.createFlag(); // create white panic flag to attract protectors
                            flag.room.memory.panicFlag = panicFlag;
                            panicFlag = _.filter(Game.flags, {name: panicFlag})[0];
                            panicFlag.memory.function = "protector";
                            panicFlag.memory.volume = flag.room.memory.hostiles.length;
                            panicFlag.memory.spawn = flag.memory.spawn;
                            panicFlag.memory.panic = true;

                            console.log("<font color=#ff0000 type='highlight'>Panic flag has been set in room " + flag.room.name + " for room " + Game.getObjectById(panicFlag.memory.spawn).room.name + "</font>");
                        }
                        else if (flag.room.memory.hostiles.length == 0 && flag.room.memory.panicFlag != undefined) {
                            // No hostiles present in room with remote harvesters
                            var tempFlag = _.filter(Game.flags, {name: flag.room.memory.panicFlag})[0];
                            if (tempFlag != undefined) {
                                tempFlag.remove();
                                delete flag.room.memory.panicFlag;
                            }

                        }
                    }
                }
            }

            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting spawn code: " + Game.cpu.getUsed())}
            // Spawn code
            if (Game.rooms[r].memory.roomArraySpawns == undefined || Game.rooms[r].memory.roomArraySpawns.length == 0) {
                //room has no spawn yet
                if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                    //room is owned and should be updated
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
                            for (var x in myRooms) {
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
                            for (var x in myRooms) {
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
            else if (Game.time % DELAYSPAWNING == 0 && Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername) {
                moduleSpawnCreeps.run(Game.rooms[r], allies);
            }

            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting tower code: " + Game.cpu.getUsed())}


            // Tower code
            if (Game.rooms[r].memory.hostiles.length > 0) {
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
                            if (Game % 3 == 0) {
                                console.log("Hostile creep " + username + " spotted in room " + Game.rooms[r].name + "!");
                            }
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
            }

            // Search for dropped energy
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start dropped energy search: " + Game.cpu.getUsed())}
            var energies = Game.rooms[r].find(FIND_DROPPED_ENERGY);
            for (var energy in energies) {
                var energyID = energies[energy].id;
                var energyAmount = energies[energy].amount;

                if (energyAmount > 15 && (Game.rooms[r].memory.hostiles.length == 0 || Game.rooms[r].memory.roomArrayLairs.length > 0)) {
                    var collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                            filter: (s) => (s.carryCapacity - _.sum(s.carry) - energyAmount) >= 0 && s.memory.role != "protector" && s.memory.role != "einarr" && s.memory.role != "distributor" && s.memory.role != "stationaryHarvester" && s.memory.role != "remoteStationaryHarvester" && s.memory.dropEnergy != true});

                    if (collector == null) {
                        collector = energies[energy].pos.findClosestByPath(FIND_MY_CREEPS, {
                                filter: (s) => (s.carryCapacity - _.sum(s.carry)) > 0 && s.memory.role != "protector" && s.memory.role != "einarr" && s.memory.role != "distributor" && s.memory.role != "stationaryHarvester" && s.memory.role != "remoteStationaryHarvester" && s.memory.dropEnergy != true});
                    }

                    if (collector != null) {
                        // Creep found to pick up dropped energy
                        collector.memory.jobQueueObject = energyID;
                        collector.memory.jobQueueTask = "pickUpEnergy";
                    }
                }
            }

            // Link code
            if (Game.time % DELAYLINK == 0 && Game.rooms[r].memory.roomArrayLinks != undefined && Game.rooms[r].memory.roomArrayLinks.length > 1) {
                var fillLinks = [];
                var emptyLinks = [];
                var targetLevel = 0;

                if (Game.rooms[r].memory.linksEmpty == undefined) {
                    // Prepare link roles
                    var emptyArray = [];
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
            if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Starting terminal code: " + Game.cpu.getUsed())}
            if (Game.cpu.bucket > CPU_THRESHOLD && Game.rooms[r].memory.terminalTransfer != undefined && Game.rooms[r].terminal != undefined && _.sum(Game.rooms[r].terminal.store) < TERMINALMAXFILLING && Game.rooms[r].terminal.owner.username == playerUsername) {
                var terminal = Game.rooms[r].terminal;
                if (terminal != undefined && terminal.owner.username == playerUsername && Game.rooms[r].memory.terminalTransfer != undefined) {
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

                    if (amount >= 100) {
                        energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, targetRoom);
                        Game.rooms[r].memory.terminalEnergyCost = energyCost;
                        if (comment != "MarketOrder") {
                            var energyTransferAmount = parseInt(energyCost) + parseInt(amount);
                            var stdEnergyCost = Game.market.calcTransactionCost(500, terminal.room.name, targetRoom);
                            if ((resource != RESOURCE_ENERGY && amount > 499 && terminal.store[resource] >= 500 && (terminal.store[RESOURCE_ENERGY]) >= stdEnergyCost)
                                || (resource == RESOURCE_ENERGY && amount > 499 && terminal.store[resource] >= 500 && (terminal.store[RESOURCE_ENERGY]) - 500 >= stdEnergyCost)) {
                                if (terminal.send(resource, 500, targetRoom, comment) == OK) {
                                    info[1] -= 500;
                                    Game.rooms[r].memory.terminalTransfer = info.join(":");
                                    console.log("<font color=#009bff type='highlight'>" + Game.rooms[r].name + ": 500/" + amount + " " + resource + " has been transferred to room " + targetRoom + " using " + stdEnergyCost + " energy: " + comment + "</font>");
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
                                    if (amount < 100) {
                                        delete Game.rooms[r].memory.terminalTransfer;
                                    }
                                    else {
                                        console.log("<font color=#ff0000 type='highlight'>Terminal transfer error (" + Game.rooms[r].name + "): " + terminal.send(resource, amount, targetRoom, comment) + "</font>");
                                    }
                                }
                            }
                        }
                        else {
                            // Market Order
                            var orderID = targetRoom;
                            var order = Game.market.getOrderById(orderID);
                            if (order != null) {
                                if (amount > 500) {
                                    amount = 500;
                                }
                                energyCost = Game.market.calcTransactionCost(amount, terminal.room.name, order.roomName);
                                Game.rooms[r].memory.terminalEnergyCost = energyCost;
                                if (Game.rooms[r].terminal.store[resource] >= amount) {
                                    if (resource == RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= amount + energyCost ||
                                        resource != RESOURCE_ENERGY && Game.rooms[r].terminal.store[RESOURCE_ENERGY] >= energyCost) {
                                        //Do the deal!
                                        if (parseInt(info[1]) <= 500 && Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
                                            console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                            delete Game.rooms[r].memory.terminalTransfer;
                                        }
                                        else if (Game.market.deal(orderID, amount, Game.rooms[r].name) == OK) {
                                            console.log("<font color=#33ffff type='highlight'>" + Game.rooms[r].name + ": " + amount + " " + resource + " has been sold to room " + order.roomName + " for " + (order.price * amount) + " credits, using " + energyCost + " energy.</font>");
                                            info[1] -= amount;
                                            Game.rooms[r].memory.terminalTransfer = info.join(":");
                                        }
                                    }
                                }
                            }
                            else {
                                delete Game.rooms[r].memory.terminalTransfer;
                            }
                        }
                    }
                    else {
                        delete Game.rooms[r].memory.terminalTransfer;
                    }
                }
            }
            // Production Code
            if (Game.cpu.bucket > CPU_THRESHOLD && Game.time % DELAYPRODUCTION == 0 && Game.rooms[r].memory.innerLabs != undefined && Game.rooms[r].memory.innerLabs[0].labID != "[LAB_ID]" && Game.rooms[r].memory.innerLabs[1].labID != "[LAB_ID]"
            && Game.rooms[r].memory.labOrder == undefined && Game.rooms[r].memory.labTarget == undefined) {
                for (let res in RESOURCES_ALL) {
                    if (RESOURCES_ALL[res] != RESOURCE_ENERGY && RESOURCES_ALL[res] != RESOURCE_POWER && mineralDescriptions[RESOURCES_ALL[res]].tier > 0) {
                        var storageLevel;
                        if (Game.rooms[r].storage.store[RESOURCES_ALL[res]] == undefined) {
                            storageLevel = 0;
                        }
                        else {
                            storageLevel = Game.rooms[r].storage.store[RESOURCES_ALL[res]];
                        }

                        if ((storageLevel) < Game.rooms[r].memory.resourceLimits[RESOURCES_ALL[res]].minProduction) {
                            //Try to produce resource
                            let resource = RESOURCES_ALL[res];

                            let delta = Math.ceil((Game.rooms[r].memory.resourceLimits[resource].minProduction - storageLevel)/10)*10;

                            if (delta >= 10) {
                                let genuineDelta = delta;
                                var productionTarget = whatIsLackingFor(Game.rooms[r], delta, resource);
                                let minProductionPacketSize = 100;

                                while (mineralDescriptions[productionTarget.resource].tier > 0 && Game.rooms[r].memory.labTarget == undefined && Game.cpu.getUsed() < 250) {
                                    if (productionTarget.amount == 0) {
                                        productionTarget.amount = genuineDelta;
                                    }
                                    if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component1] >= minProductionPacketSize &&
                                        Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component2] >= minProductionPacketSize) {
                                        //All components ready, start production
                                        let reactionAmount = Math.min(Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component1], Game.rooms[r].storage.store[mineralDescriptions[productionTarget.resource].component2]);
                                        if (reactionAmount > genuineDelta) {
                                            reactionAmount = genuineDelta;
                                        }
                                        Game.rooms[r].memory.labTarget = reactionAmount + ":" + productionTarget.resource;
                                        console.log("<font color=#ffca33 type='highlight'>Room " + Game.rooms[r].name + " started auto production of " + reactionAmount + " " + productionTarget.resource + ".</font>");
                                    }
                                    else if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget].component1] < minProductionPacketSize) {
                                        resource = mineralDescriptions[productionTarget].component1;
                                    }
                                    else if (Game.rooms[r].storage.store[mineralDescriptions[productionTarget].component2] < minProductionPacketSize) {
                                        resource = mineralDescriptions[productionTarget].component2;
                                    }
                                    productionTarget = whatIsLackingFor(Game.rooms[r], genuineDelta, resource);
                                }

                                if (mineralDescriptions[productionTarget.resource].tier == 0) {
                                    //Tier 0 resource missing
                                    Game.rooms[r].memory.lastMissingComponent = productionTarget.resource;
                                }
                            }
                        }
                    }
                }
            }

            // Lab code
            if (Game.time % DELAYPRODUCTION == 0 && Game.cpu.bucket > CPU_THRESHOLD && Game.rooms[r].memory.labTarget != undefined && Game.rooms[r].memory.labOrder == undefined) { //FORMAT: 500:ZH
                // Lab Queueing Code
                var labString = Game.rooms[r].memory.labTarget.split(":");
                var origAmount = labString[0];
                var origResource = labString[1];
                if (mineralDescriptions[labString[1]].tier == 0) {
                    delete Game.rooms[r].memory.labTarget;
                    console.log("Removed " + Game.rooms[r].name + ".labTarget as it indicated a tier 0 resource.");
                }
                else {
                    while (mineralDescriptions[labString[1]] != undefined && mineralDescriptions[labString[1]].tier > 0) {
                        var labTarget = global.whatIsLackingFor(Game.rooms[r], labString[0], labString[1]);
                        var missingComponent1 = mineralDescriptions[labTarget.resource].component1;
                        var missingComponent2 = mineralDescriptions[labTarget.resource].component2;
                        if (Game.rooms[r].storage.store[missingComponent1] != undefined && Game.rooms[r].storage.store[missingComponent2] != undefined
                            && Game.rooms[r].storage.store[missingComponent1] >= labTarget.amount && Game.rooms[r].storage.store[missingComponent2] >= labTarget.amount) {
                            //All component available
                            if (labTarget.amount == 0) {
                                labTarget.amount = origAmount;
                            }
                            Game.rooms[r].memory.labOrder = labTarget.amount + ":" + missingComponent1 + ":" + missingComponent2 + ":prepare";
                            if (missingComponent1 == mineralDescriptions[origResource].component1 && missingComponent2 == mineralDescriptions[origResource].component2) {
                                // Last production order given
                                delete Game.rooms[r].memory.labTarget;
                            }
                            break;
                        }
                        else {
                            //Components missing
                            if (Game.rooms[r].storage.store[missingComponent1] == undefined || Game.rooms[r].storage.store[missingComponent1] < labTarget.amount) {
                                //Component 1 missing
                                if (Game.rooms[r].storage.store[missingComponent1] == undefined) {
                                    labString[0] = labTarget.amount;
                                }
                                else {
                                    labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent1];
                                }
                                labString[1] = missingComponent1;
                            }
                            else {
                                //Component 2 missing
                                if (Game.rooms[r].storage.store[missingComponent2] == undefined) {
                                    labString[0] = labTarget.amount;
                                }
                                else {
                                    labString[0] = labTarget.amount - Game.rooms[r].storage.store[missingComponent2];
                                }
                                labString[1] = missingComponent2;
                            }
                        }
                    }
                }

            }

            // Lab Production Code
            if (Game.time % DELAYLAB == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
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
                            if (labOrder[3] == "prepare" && Game.getObjectById(innerLabs[0].labID).mineralType == innerLabs[0].resource && Game.getObjectById(innerLabs[0].labID).mineralAmount >= rawAmount
                                && Game.getObjectById(innerLabs[1].labID).mineralType == innerLabs[1].resource && Game.getObjectById(innerLabs[1].labID).mineralAmount >= rawAmount) {
                                labOrder[3] = "running";
                                Game.rooms[r].memory.labOrder = labOrder.join(":");
                            }
                            if (labOrder[3] == "running") {
                                // Reaction can be started
                                for (var lab in Game.rooms[r].memory.roomArrayLabs) {
                                    if ((Game.rooms[r].memory.boostLabs == undefined || Game.rooms[r].memory.boostLabs.indexOf(Game.rooms[r].memory.roomArrayLabs[lab]) == -1) && Game.rooms[r].memory.roomArrayLabs[lab] != innerLabs[0].labID && Game.rooms[r].memory.roomArrayLabs[lab] != innerLabs[1].labID) {
                                        if (Game.getObjectById(innerLabs[0].labID).mineralAmount > 4 && Game.getObjectById(innerLabs[1].labID).mineralAmount > 4) {
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
                    else {
                        console.log("Inner links not defined in room " + Game.rooms[r].name);
                    }
                }
            }
        }

        //Cycle through creeps
        if (CPUdebug == true) { CPUdebugString = CPUdebugString.concat("<br>Starting creeps: " + Game.cpu.getUsed()) }
        for (let name in Game.creeps) {
            // get the creep object
            var creep = Game.creeps[name];

            //Check for miniharvester
            if (creep.memory.role == "miniharvester") {
                creep.memory.role = "harvester";
            }

            //Check for fleeing creeps
            if (creep.room.memory.hostiles.length == 0 && creep.memory.fleeing == true) {
                //Get away from the exit
                if ((creep.pos.x < 5 || creep.pos.x > 45) || (creep.pos.y < 5 || creep.pos.y > 45)) {

                    var area = creep.room.lookAtArea(20, 20, 40, 40, true);
                    area = _.filter(area, function (a) { return (a.terrain != "wall")});
                    if (area.length > 0) {
                        let destPos = creep.room.getPositionAt(area[0].x, area[0].y);
                        creep.moveTo(destPos, {reusePath: moveReusePath()});
                    }
                    else {
                        console.log("No safe area found in room " + Game.rooms[r].name + ".");
                    }
                }
                else {
                    //Creep has distance to any room exit
                    creep.memory.sleep = 50;
                    delete creep.memory.fleeing;
                }
            }
            else
            { // Check for sleeping creeps
                if (creep.memory.sleep != undefined) {
                    creep.memory.sleep--;
                    //creep.say("Zzz: " + creep.memory.sleep);
                    if (creep.memory.sleep < 1) {
                        delete creep.memory.sleep;
                    }
                }
                else {
                    if (creep.spawning == false && creep.ticksToLive > 1000 && creep.memory.boostList != undefined) {
                        //Creep needs boosting
                        if (creep.memory.boostList.length > 0) {
                            let boostLabs = creep.room.memory.boostLabs;
                            if (boostLabs.length > 0) {

                                if (creep.memory.myBoostLab == undefined) {
                                    let tempList = [];
                                    for (let b in boostLabs) {
                                        tempList.push(Game.getObjectById(boostLabs[b]));
                                    }
                                    let myBoostLab = creep.pos.findClosestByPath(tempList);
                                    console.log(myBoostLab);
                                    if (myBoostLab != null) {
                                        creep.memory.myBoostLab = myBoostLab.id;
                                    }
                                }
                                if (creep.memory.myButler == undefined || Game.getObjectById(creep.memory.myButler) == null) {
                                    //Find butler
                                    let butler = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (c) => c.memory.role == "energyTransporter" || c.memory.role == "harvester"});
                                    if (butler != null) {
                                        butler.memory.jobQueueTask = "prepareBoost";
                                        butler.memory.jobQueueObject = creep.id;
                                        creep.memory.myButler = butler.id;
                                        console.log(creep.name + " has taken " + butler.name + " as a butler.");
                                    }
                                }
                                else {
                                    //Wait for boostLab to fill up
                                    let boostLab = Game.getObjectById(creep.memory.myBoostLab);
                                    if (creep.pos.getRangeTo(boostLab) > 1) {
                                        creep.moveTo(boostLab, {reusePath: moveReusePath()});
                                    }
                                    else {
                                        let bodyPart = mineralDescriptions[creep.memory.boostList[0]].bodyPart;
                                        let numberofParts = creep.getActiveBodyparts(bodyPart);
                                        let mineralNeed = 30 * numberofParts;
                                        let energyNeed = 20 * numberofParts;

                                        if (boostLab.mineralType == creep.memory.boostList[0] && boostLab.mineralAmount >= mineralNeed && boostLab.energy >= energyNeed) {
                                            // Lab ready for boost
                                            let returnCode = boostLab.boostCreep(creep);
                                            if (returnCode == OK) {
                                                 creep.memory.boostList.slice(0,1);
                                            }
                                            if (creep.memory.boostList.length == 0) {
                                                delete creep.memory.boostList;
                                                if (creep.memory.myButler != undefined) {
                                                    let butler = Game.getObjectById(creep.memory.myButler);
                                                    delete butler.memory.jobQueueObject;
                                                    delete butler.memory.jobQueueTask;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            delete creep.memory.boostList;
                        }
                    }
                    else if (creep.memory.jobQueueTask != undefined && creep.spawning == false) {
                        //Job queue pending
                        switch (creep.memory.jobQueueTask) {
                            case "pickUpEnergy": //Dropped energy to be picked up
                                let source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
                                let enemy = creep.pos.findClosestByPath(creep.room.memory.hostiles);

                                if (creep.pickup(source) == ERR_NOT_IN_RANGE && (enemy == null || creep.pos.getRangeTo(enemy) > 7)) {
                                    creep.moveTo(source, {reusePath: moveReusePath()});
                                }
                                creep.memory.jobQueueTask = undefined;
                                break;

                            case "prepareBoost": //Creep boost to be prepared
                                let boostLabs = creep.room.memory.boostLabs;
                                if (creep.memory.myBoostLab == undefined) {
                                    let tempList = [];
                                    for (let b in boostLabs) {
                                        tempList.push(Game.getObjectById(boostLabs[b]));
                                    }
                                    let myBoostLab = creep.pos.findClosestByPath(tempList);
                                    if (myBoostLab != null) {
                                        creep.memory.myBoostLab = myBoostLab.id;
                                    }
                                }

                                if (creep.carry[RESOURCE_ENERGY] > 0) {
                                    creep.storeAllBut();
                                }
                                else {
                                    let clientCreep = Game.getObjectById(creep.memory.jobQueueObject);
                                    let boostLab = Game.getObjectById(creep.memory.myBoostLab);
                                    let bodyPart = mineralDescriptions[clientCreep.memory.boostList[0]].bodyPart;
                                    let mineralNeed = 30 * clientCreep.getActiveBodyparts(bodyPart);

                                    if (boostLab.mineralAmount >= mineralNeed || boostLab.mineralType != clientCreep.memory.boostList[0]) {
                                        //Lab needs minerals
                                        if (creep.storeAllBut(clientCreep.memory.boostList[0]) == true) {
                                            if (_.sum(creep.carry) == 0) {
                                                //Get minerals from storage
                                                let amount = mineralNeed - boostLab.mineralAmount;
                                                if (amount > creep.carryCapacity) {
                                                    amount = creep.carryCapacity;
                                                }
                                                if (creep.withdraw(creep.room.storage, clientCreep.memory.boostList[0], amount) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(creep.room.storage, {reusePath: moveReusePath()});
                                                    break;
                                                }
                                            }
                                            else {
                                                //Bring minerals to lab
                                                if (creep.transfer(boostLab, clientCreep.memory.boostList[0]) == ERR_NOT_IN_RANGE) {
                                                    creep.moveTo(boostLab, {reusePath: moveReusePath()});
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            default:
                                creep.memory.jobQueueTask = undefined;
                                break;
                        }

                    }
                    else if (creep.spawning == false) {
                        if (CPUdebug == true) {
                            CPUdebugString = CPUdebugString.concat("<br>Start creep " + creep.name + "( " + creep.memory.role + "): " + Game.cpu.getUsed())
                        }
                        if (creep.memory.role != "miner" && creep.memory.role != "distributor" && creep.memory.role != "transporter" && creep.memory.role != "scientist" && _.sum(creep.carry) != creep.carry.energy) {
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
                                roleProtector.run(creep);
                            }
                            else if (creep.memory.role == 'claimer') {
                                roleClaimer.run(creep);
                            }
                            else if (creep.memory.role == 'bigClaimer') {
                                roleBigClaimer.run(creep);
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
                            else if (creep.memory.role == 'attacker' || creep.memory.role == 'einarr' || creep.memory.role == 'healer') {
                                roleUnit.run(creep);
                            }
                            else if (creep.memory.role == 'scientist') {
                                roleScientist.run(creep);
                            }
                            else if (creep.memory.role == 'transporter') {
                                roleTransporter.run(creep);
                            }
                            else if (creep.memory.role == 'bigUpgrader') {
                                roleUpgrader.run(creep);
                            }
                        }
                    }
                }
                if (CPUdebug == true) {
                    CPUdebugString = CPUdebugString.concat("<br>Creep " + creep.name + "( " + creep.memory.role + ") finished: " + Game.cpu.getUsed())
                }
            }
        }
    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
        console.log(CPUdebugString);
    }
    //});
};
