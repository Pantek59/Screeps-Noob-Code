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
                        color = "#ff3333";
                    }
                    else if (amount > Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxStorage) {
                        color ="#00ff00"
                    }
                    else {
                        color = "#aaffff";
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
    if (arguments.length == 0) {
        return "listLimits (limitTyoe, [displayResource]) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
    }
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
        return "setLimit (roomName, limitType, resource, limit) - Known limit types: \"market\", \"storage\", \"production\", \"terminal\"";
    }
    var roomNames = [];
    var resources = [];

    if (roomName == "*") {
        for (var t in myRooms) {
            roomNames.push(myRooms[t].name);
        }
    }
    else {
        roomNames.push(roomName);
    }

    if (resource == "*") {
        for (var t in RESOURCES_ALL) {
            resources.push(RESOURCES_ALL[t]);
        }
    }
    else {
        resources.push(resource);
    }

    for (var i in roomNames) {
        for (let m in resources) {
            switch (type) {
                case "market":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
                    break;
                case "terminal":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
                    break;
                case "storage":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
                    break;
                case "production":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
                    break;
                case "*":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minMarket = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minTerminal = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].maxStorage = limit;
                    Game.rooms[roomNames[i]].memory.resourceLimits[resources[m]].minProduction = limit;
                default:
                    return "Unknown type";
            }
            console.log("Room " + Game.rooms[roomNames[i]].name + " has set the " + type + " limit for " + resources[m] + " to " + limit + ".");
        }
    }
    return "OK";
};
global.checkTerminalLimits = function (room, resource) {
    // Check if terminal has exactly what it needs. If everything is as it should be true is returned.
    // If material is missing or too much is in terminal, an array will be returned with the following format:
    // delta.type = Type of resource / delta.amount = volume (positive number means surplus material)

    //Check terminal limits
    var uplift = 0;
    var delta = {};
    delta["type"] = resource;
    if (room.memory.resourceLimits == undefined || room.terminal == undefined || room.storage == undefined) {
        delta["amount"] = 0;
        return delta;
    }

    var roomLimits = room.memory.resourceLimits;
    if (roomLimits[resource] != undefined && room.terminal.store[resource] != undefined) {
        delta.amount = room.terminal.store[resource] - roomLimits[resource].minTerminal;
    }
    else if (room.terminal.store[resource] == undefined) {
        delta.amount = roomLimits[resource].minTerminal;
    }
    else {
        delta.amount = 0
    }

    //Check market selling orders
    if (Object.keys(Game.market.orders).length > 0) {
        //Look through orders to determine whether additional material is needed in terminal

        var relevantOrders = _.filter(Game.market.orders,function (order) {
            if (order.resourceType == resource && order.roomName == room.name) {return true}
            else {return false}
        });

        if (relevantOrders.length > 0) {
            for (let o in relevantOrders) {
                if (relevantOrders[o].remainingAmount > 10000) {
                    uplift = 10000;
                }
                else {
                    uplift += relevantOrders[o].remainingAmount;
                }
            }
            delta.amount -= uplift;
        }
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
    returnArray["amount"] = amount;

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
                if (room.storage.store[components[c]] == undefined || room.storage.store[components[c]] < returnArray.amount) {
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
    if (arguments.length == 0) {
        return "buy (orderID, amount)";
    }
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

    if (Memory.buyOrder != undefined) {
        return "Active buy order found: " + Game.memory.buyOrder;
    }

    Memory.buyOrder = amount + ":" + order.id;
    return "Buy queue created!";
};

global.sell = function (orderID, amount, roomName) {
    if (arguments.length == 0) {
        return "sell (orderID, amount, roomName)";
    }
    var order = Game.market.getOrderById(orderID);

    if (order == null) {
        return "Invalid order ID!"
    }
    if (Game.rooms[roomName].memory.terminalTransfer == undefined) {
        Game.rooms[roomName].memory.terminalTransfer = order.id + ":" + amount + ":" + order.resourceType + ":MarketOrder";
        return "Selling transfer scheduled.";
    }
    else {
        return "Ongoing terminal transfer found. Try later.";
    }
};

global.sellOrder = function (amount, resource, roomName, price) {
    if (arguments.length == 0) {
        return "sell (amount, resource, roomName, price)";
    }

    if (Game.rooms[roomName].storage != undefined && Game.rooms[roomName].storage.store[resource] >= amount) {
        if (Game.market.createSellOrder(resource, price, amount, roomName) == OK) {
            return "Sell order created!";
        }
    }
    else {
        return "Room " + roomName + " is not able to sell this resource.";
    }
};

global.produce = function (roomName, amount, resource) {
    Game.rooms[roomName].memory.labTarget = amount + ":" + resource;
    return "OK";
}
