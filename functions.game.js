require ("globals");

global.getMasterSpawn = function (roomName) {
    return Game.rooms[roomName].memory.masterSpawn;
};

global.terminalTransfer = function (transferResource, transferAmount, targetRoomName, transferFlag) {
    // transfer resources to remote room from whatever room(s) is cheapest
    var roomCandidates = new Array();
    var tempArray = new Array();
    var resourceTotal = 0;

    if (arguments.length == 0) {
        return "terminalTransfer (transferResource, transferAmount, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    for (var r in Game.rooms) {
        if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
            //Fill candidate array with rooms
            var roomResourceTotal = 0;
            var roomArray = new Array();

            // Add resource in storage
            if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[transferResource] != undefined) {
                roomResourceTotal += Game.rooms[r].storage.store[transferResource];
            }

            // Add resource in containers
            tempArray = Game.rooms[r].memory.roomArrayContainers;
            var container;
            for (var s in tempArray) {
                container = Game.getObjectById(tempArray[s]);
                if (container != undefined) {
                    if (container.store[transferResource] != undefined) {
                        roomResourceTotal += container.store[transferResource];
                    }
                }
            }

            if (transferResource == RESOURCE_ENERGY) {
                // Add resource in links
                tempArray = Game.rooms[r].memory.roomArrayLinks;
                for (var s in tempArray) {
                    container = Game.getObjectById(tempArray[s]);
                    if (container != undefined) {
                        roomResourceTotal += Game.getObjectById(tempArray[s]).energy;
                    }
                }
            }

            if (roomResourceTotal > 0 && Game.rooms[r].name != targetRoomName) {
                roomArray["name"] = Game.rooms[r].name;
                roomArray["volume"] = roomResourceTotal;

                if (roomResourceTotal > transferAmount) {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(transferAmount, Game.rooms[r].name, targetRoomName);
                }
                else {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(roomResourceTotal, Game.rooms[r].name, targetRoomName);
                }
                roomArray["cost"] = Game.market.calcTransactionCost(100, roomArray.name, targetRoomName);

                if (transferFlag == false) {
                    console.log(roomArray.name + ": " + roomResourceTotal + " of " + transferResource + " (energy factor: " + roomArray.cost + ")");
                }

                roomCandidates.push(roomArray);
                resourceTotal += roomResourceTotal;
            }
        }
    }

    var totalVolume = 0;
    var totalCost = 0;

    if (roomCandidates.length == 0) {
        return "No rooms with " + transferResource + " found.";
    }
    else if (resourceTotal < transferAmount) {
        return "Not enough " + transferResource + " found.";
    }
    else {
        // There are rooms holding enough of the transfer resource
        var candidatesByCost = _.sortBy(roomCandidates,"cost");

        for (var c in candidatesByCost) {
            if (Game.rooms[candidatesByCost[c].name].memory.terminalTransfer == undefined) {
                if (candidatesByCost[c].volume > transferAmount) {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
                        //console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += transferAmount;
                    totalCost += candidatesByCost[c].totalCost;
                    break;
                }
                else {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoomName + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer";
                        //console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoomName + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += candidatesByCost[c].volume;
                    totalCost += candidatesByCost[c].totalCost;
                    transferAmount -= candidatesByCost[c].volume;
                }
            }
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.terminalTransferX = function (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) {
    // transfer resources to from source to target
    var roomCandidates = new Array();
    var sourceRoom = Game.rooms[sourceRoomName];

    if (arguments.length == 0) {
        return "terminalTransferX (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W18S49\", \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    if (sourceRoom.memory.terminalTransfer != undefined) {
        return "There is already an ongoing terminal transfer in room " + sourceRoomName + ".";
    }

    var totalCost = 0;
    if (sourceRoom.storage == undefined || sourceRoom.terminal == undefined || (sourceRoom.storage.store[transferResource] + sourceRoom.terminal.store[transferResource]) < transferAmount) {
        return "Error scheduling terminal transfer job.";
    }
    else {
        if (transferFlag == false) {
            console.log("Terminal Transfer Preview for room " + sourceRoom.name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName));
        }
        else if (transferFlag == true) {
            sourceRoom.memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
            //console.log(transferAmount + " " + transferResource + " scheduled from room " + sourceRoomName + " to room " + targetRoomName + " for " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName) + " energy.");
        }
        else {
            return "Transfer Flag missing.";
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.listStorages = function (displayResource) {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    resourceTable = _.sortBy(resourceTable, function (res) {return res.length;});
    for (res in resourceTable) {
        if (arguments.length == 0 || displayResource == resourceTable[res]) {
            returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
            for (var r in Game.rooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
                    var amount;
                    var color;
                    if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                        amount = 0;
                    }
                    else {
                        amount = Game.rooms[r].storage.store[resourceTable[res]];
                    }
                    if (amount < Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
                        color = "#ff0000";
                    }
                    else if (amount > Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
                        color ="#00ff00"
                    }
                    else {
                        color = "#ffffff";
                    }
                    returnstring = returnstring.concat("<td><font color='" + color + "'>" + prettyInt(amount) + "  </font></td>");
                }
            }
            returnstring = returnstring.concat("</tr>");
        }
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.prettyInt = function (int) {
    var string = int.toString();
    var numbers = string.length;
    var rest = numbers % 3;
    var returnString = "";
    if (rest > 0) {
        returnString = string.substr(0, rest);
        if (numbers > 3) {
            returnString += "'";
        }
    }
    numbers -= rest;

    while (numbers > 0) {
        returnString += string.substr(rest,3);
        if (numbers > 3) {
            returnString += "'";
        }
        rest += 3;
        numbers -= 3;
    }
    return returnString;
};

global.listLimits = function (limitType, displayResource) {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = [];
    if (limitType == "market") {
        limitType = "minMarket"
    }
    else if (limitType == "production") {
        limitType = "minProduction"
    }
    else if (limitType == "terminal") {
        limitType = "minTerminal"
    }
    else if (limitType == "storage") {
        limitType = "maxStorage"
    }
    else {return "Invalid limit type."}

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].memory.resourceLimits) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    resourceTable = _.sortBy(resourceTable, function (res) {return res.length;});
    for (res in resourceTable) {
        if (arguments.length == 1 || displayResource == resourceTable[res]) {
            var tempstring ="<tr><td>" + resourceTable[res] + "  </td>";
            var tempsum = 0;
            for (var r in Game.rooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
                    tempstring = tempstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]][limitType]) + "  </td>");
                    tempsum += Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage;
                }
            }
            if (tempsum > 0) {
                returnstring = returnstring.concat(tempstring + "</tr>");
            }
        }
    }
    returnstring = returnstring.concat("</table>");
    return returnstring;
};

global.setLimit = function(roomName, type, resource, limit) {
    if (arguments.length == 0) {
        return "setLimit (roomName, limitType, resource, limit) --> terminalTransfer(\"W18S49\", \"market\", \"Z\", 10000)<br>Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
    }
    var roomNames = [];

    if (roomName == "*") {
        for (var t in myRooms) {
            roomNames.push(myRooms[t].name);
        }
    }
    else {
        roomNames.push(roomName);
    }
    for (var i in roomNames) {
        switch (type) {
            case "market":
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minMarket = limit;
                break;
            case "terminal":
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minTerminal = limit;
                break;
            case "storage":
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].maxStorage = limit;
                break;
            case "production":
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minProductione = limit;
                break;
            case "*":
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minMarket = limit;
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minTerminal = limit;
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].maxStorage = limit;
                Game.rooms[roomNames[i]].memory.resourceLimits[resource].minProductione = limit;
            default:
                return "Unknown type";
        }
        console.log("Room " + Game.rooms[roomNames[i]].name + " has set the " + type + " limit for " + resource + " to " + limit + ".");
    }
    return "OK";
};
global.checkTerminalLimits = function (room, resource) {
    // Check if terminal has exactly what it needs. If everything is as it should be true is returned.
    // If material is missing or too much is in terminal, an array will be returned with the following format:
    // delta.type = Type of resource / delta.amount = volume (positive number means surplus material)
    var delta = {};
    delta["type"] = resource;
    if (room.memory.resourceLimits == undefined || room.terminal == undefined || room.storage == undefined) {
        delta["amount"] = 0;
        return delta;
    }

    var roomLimits = room.memory.resourceLimits;
    if (roomLimits[resource] != undefined && room.terminal.store[resource] != roomLimits[resource].minTerminal) {

        if (room.terminal.store[resource] == undefined) {
            delta.amount = 0 - roomLimits[resource].minTerminal
        }
        else {
            delta.amount = room.terminal.store[resource] - roomLimits[resource].minTerminal;
        }
    }
    else {
        delta.amount = 0
    }
    return delta;
};

global.checkStorageLimits = function(room, resource) {
    // Check if storage has exactly what it needs. Return delta to maxStorage
    // If everything is as it should be 0 is returned.
    // If material is missing a negative amount will be returned
    // If there is surplus a positive amount will be returned
    var terminalDelta = 0;
    if (room.storage == undefined) {
        return 0;
    }
    terminalDelta = checkTerminalLimits(room, resource);
    if (room.storage.store[resource] != undefined) {
        return (terminalDelta.amount + room.storage.store[resource] - room.memory.resourceLimits[resource].maxStorage)
    }
    else {
        return (terminalDelta.amount - room.memory.resourceLimits[resource].maxStorage);
    }
};

global.whatIsLackingFor = function(room, amount, resource) {
    //Return object [resource, amount] with lowest-tier resource missing in room for target resource
    var returnArray = {};
    returnArray.resource = resource;
    var components = [];
    var targetResourceDescription = mineralDescriptions[resource];
    if (targetResourceDescription == undefined) {
        console.log(resource + " not found in mineralDescriptions!");
    }
    if (room.storage.store[resource] == undefined) {
        returnArray["amount"] = amount;
    }
    else if (room.storage.store[resource] >= amount) {
        returnArray["amount"] = 0;
    }
    else {
        returnArray["amount"] = amount - room.storage.store[resource];
    }

    if (targetResourceDescription.tier == 0) {
        //Tier 0 resource
        return returnArray;
    }
    else {
        // Begin drill-down
        var OKcount = 0;
        do {
            components[0] = targetResourceDescription.component1;
            components[1] = targetResourceDescription.component2;
            for (let c in components) {
                if (room.storage.store[components[c]] < returnArray.amount) {
                    // not enough of this component
                    targetResourceDescription = mineralDescriptions[components[c]];
                    returnArray.resource = components[c];
                    if (room.storage.store[components[c]] != undefined) {
                        returnArray.amount = amount - room.storage.store[components[c]];
                    }
                    else {
                        returnArray.amount = amount;
                    }
                }
                else {
                    OKcount++;
                }
            }
        }
        while (OKcount < 2 && targetResourceDescription.tier > 0);

        return returnArray;
    }
};

global.buy = function (orderID, amount) {
    var order = Game.market.getOrderById(orderID);

    if (order == null) {
        return "Invalid order ID!"
    }

    if (order.amount < amount) {
        return "Order does not contain enough material!"
    }

    if (Game.market.credits < order.price * amount) {
        return "Not enough credits!"
    }

    var left = amount;
    while (left > 99) {
        var bestRoom;
        var bestCost = 9999999999999;
        for (var r in Game.rooms) {
            var cost = Game.market.calcTransactionCost(100, order.roomName, Game.rooms[r].name);
            if (Game.rooms[r].terminal != undefined && Game.rooms[r].terminal.owner.username == playerUsername && Game.rooms[r].storage.store[RESOURCE_ENERGY] >= cost) {
                if (bestCost > cost) {
                    bestRoom = Game.rooms[r];
                    bestCost = cost;
                }
            }
        }

        if (bestRoom == undefined || bestRoom.name == undefined) {
            return "No room with enough energy found!"
        }

        var returnCode = Game.market.deal(order.id, 100, bestRoom.name);
        if (returnCode == OK) {
            left -= 100;
        }
        else if (returnCode != ERR_NOT_ENOUGH_RESOURCES) {
            console.log(returnCode);
        }
    }
}