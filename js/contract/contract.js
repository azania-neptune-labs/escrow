"use strict";


var EscrowItem = function(jsonData) {
    if(jsonData) {
        var tempJson = JSON.parse(jsonData);
        
        this.id = tempJson.id;
        
        this.timestamp = tempJson.timestamp;
        
        this.initiatedBy = tempJson.initiatedBy;
        this.buyer = tempJson.buyer;//nas address
        this.seller = tempJson.seller; //nas address

        this.buyerEmail = tempJson.buyerEmail; 
        this.sellerEmail = tempJson.sellerEmail; 
        
        
        //In NAS
        this.price = tempJson.price; 
        
        this.title =  tempJson.title; 
        
        this.notes = tempJson.notes; 

        
        this.product = {
            "type" : tempJson.product.type,
            "description" : tempJson.product.description,
            "odometer" : tempJson.product.odometer,
            "vin" : tempJson.product.vin,
            "manDate" : tempJson.product.manDate,
            "model" : tempJson.product.model,
            "make" : tempJson.product.make
        };
        
        this.shipping = {
            "whoPays" : tempJson.shipping.whoPays,
            "cost" : tempJson.shipping.cost,
            "trackingNumber" : tempJson.shipping.trackingNumber,
            "operator" : tempJson.shipping.operator,
            "info" : tempJson.shipping.info,
            "address" : tempJson.shipping.address,
        };

        this.inspectionPeriod = tempJson.inspectionPeriod; 
        
        //0-pending, 1-accepted, 2-released funds, 3-dispute, 4-refunded, 5 - rejected
        this.status = tempJson.status; 
        
        this.fundsDeposit = tempJson.fundsDeposit; 
        
        this.disputeComments = tempJson.disputeComments;
        this.whoInitiatedDispute = tempJson.whoInitiatedDispute;
        
        this.messages = tempJson.messages;
        this.history = tempJson.history;
        
    } else {
        //Unique escrow id identifier which is going the be the TxHash
        this.id = "";
        
        //TxHash timestamp
        this.timestamp = "";
        
        //Who initiated the request: buyer/seller
        this.initiatedBy = "buyer";
        
        this.buyer = ""; //Buyer NAS address
        this.seller = ""; //Seller NAS address
        
        //Buyer/Seller email address, used for notifying the request
        this.buyerEmail = "";
        this.sellerEmail = "";
        
        
        //Transaction NAS price
        this.price = "";
        
        //Transaction request title
        this.title = "";
        
        //Terms and description of the escrow request, including all relevant information about the prodict
        this.notes = "";
        
        
        this.product = {
            "type" : "",//vehicle or other
            "description" : "", //description for all the product types
            "odometer" : "", // odometer for the vehicle type requst
            "vin" : "", //vin for the vehicle type request
            "manDate" : "", //manufacturing date for the vehicle type request
            "model" : "", //model value for the vehicle type request
            "make" : "" //make value for the vehicle type request
        };
        
        this.shipping = {
            "whoPays" : "", //who pays the shipping taxes: seller, buyer, 50/50 allowed values
            "cost" : "", //the shipping cost in NAS
            "trackingNumber": "", //shipping tracking number if existant
            "operator": "", //shipping method
            "info": "", //Other info
            "address" : ""
        };
        
        
        //The number of days the buyer should inspect the product and release/dispute funds
        this.inspectionPeriod = "3"; //Days
        
        // 0-pending
        // 1-accepted
        // 2-released funds
        // 3-dispute
        // 4-refunded
        // 5 - rejected
        // 6 - in shipping status
        // 7 - seller accepted -> initiated by the buyer, after seller acception
        // the buyer has to deposit funds
        this.status = 0;
        
        
        //Flag that specifies that the required funds have been deposited
        this.fundsDeposit = 0;
        
        this.disputeComments = "";
        
        this.whoInitiatedDispute = "";
        
        this.shippingAddress = "";
        
        this.messages = [];
        this.history = [];
    }
}

EscrowItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Escrow = function() {
    LocalContractStorage.defineMapProperty(this, "escrowArrayMap");
    LocalContractStorage.defineProperty(this, "escrowNr");
    LocalContractStorage.defineMapProperty(this, "escrows", {
        parse: function(text) {
            return new EscrowItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    
    
    LocalContractStorage.defineMapProperty(this, "disputeArray");
    LocalContractStorage.defineProperty(this, "disputeNr");
    LocalContractStorage.defineMapProperty(this, "disputeArrayMap");
    
    LocalContractStorage.defineMapProperty(this, "balance", {
        parse: function(value) {
            return new BigNumber(value);
        },
        stringify: function(o) {
            return o.toString(10);
        }
    });
};


Escrow.prototype = {
    init: function() {
        this.escrowNr = 0;  
        this.disputeNr = 1;
        
        this.disputeArray.put(this.disputeNr, 'genesis');
        //Developer dispute address, at the moment only him can dspute a transaction
        this.disputeArrayMap.put('genesis', 'n1TJfk7sQ1mJXBPeHccS5QcFBbwW4SCAvqG');
    },
    
    _validateEmail: function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    
    initiateDispute: function(escrowHash, reason) {
        //who initiated dispute
        var from = Blockchain.transaction.from;
        
        if(reason.length < 5) {
            throw new Error("Please provice a reason for dispute.")
        }
        
        var escrow = this.escrows.get(escrowHash);
        
        if(escrow == null) {
            throw new Error("Escrow hash does not exist");
        }
        
        //Only the seller or the buyer can dispute
        if(escrow.seller !== from && escrow.buyer !== from) {
            throw new Error("Only the seller or the buyer can dispute")
        }
        
        //Only shipped/ accepted and funds deposited statuses can be disputed
        if(escrow.status !== 1 && escrow.status !== 6) {
            throw new Error("Only an accepted or shipped transaction can be disputed");
        }
        
        if(escrow.fundsDeposit !== 1) {
            throw new Error("Transaction without deposit can't be disputed.");
        }
        
        escrow.history.push({"when" : new Date(), "action" : "Initiated a dispute", "tag" : "dispute", "who" : from});
        
        escrow.disputeComments = reason;        
        escrow.whoInitiatedDispute = from;      
        escrow.status = 3;       
        this.escrows.put(escrow.id, escrow);   
        return true;
    },
    
    initiateEscrow: function(
            initiator, addr, buyerEmail, sellerEmail, price, title, notes, 
            productType, productDescription, productOdometer, productVin, productManDate, productModel, productMake,
            shippingWhoPays, shippingCost, inspectionPeriod, shippingAddress
    ) {
        var escrow = new EscrowItem();
        //The unique escrow id will be the transaction hash
        escrow.id = Blockchain.transaction.hash;
        var nasPrice = new BigNumber(price);
        var from = Blockchain.transaction.from;
        
        //Arguments validation
        if(initiator != "seller" && initiator != "buyer") {
            throw new Error("Initiator must be either seller or buyer");
        } else if (nasPrice.lessThan(new BigNumber(0))) {
            throw new Error("Price amount must be greater than 0");
        } else if (!Blockchain.verifyAddress(addr)) {
            throw new Error("Seller/Buyer address is not valid Nebulas addresses");
        } else if(!this._validateEmail(buyerEmail) || !this._validateEmail(sellerEmail)) {
            throw new Error("Seller/Buyer emails are not valid");
        } else if(title.length < 6) {
            throw new Error("Title must be at least 6 characters long");
        } else if(productType != 'vehicle' && productType != 'other') {
            throw new Error("Not supported prodct Type");
        } else if(productDescription.length < 25) {
            throw new Error("Product description must be longer than 25 characters");
        } else if(productType == "vehicle" && productOdometer == "") {
            throw new Error("Vehicle odometer must be provided");
        } else if(productType == "vehicle" && productVin == "") {
            throw new Error("Vehicle VIN must be provided");
        } else if(productType == "vehicle" && productManDate == "") {
            throw new Error("Vehicle manufacturing date must be provided");
        } else if(productType == "vehicle" && productModel == "") {
            throw new Error("Vehicle model must be provided");
        } else if(productType == "vehicle" && productMake == "") {
            throw new Error("Vehicle make must be provided");
        } else if(shippingWhoPays != 'seller' && shippingWhoPays != 'buyer' && shippingWhoPays != '50/50') {
            throw new Error("Who pays the shipping must be either seller, buyer or 50/50");
        } else if(shippingCost < 0) {
            throw new Error("Shipping cost must pe positive");
        } else if (parseInt(inspectionPeriod) != inspectionPeriod) {
            throw new Error("Inspection period must be a valid number of days");
        } else if(initiator === "seller" && addr === from) {
            throw new Error("Can't use the same buyer adress");
        } else if(initiator === "buyer" && addr === from) {
            throw new Error("Can't use the same seller adress");
        }
        
            
        escrow.price = nasPrice;
        escrow.initiatedBy = initiator;
        //escrow.buyer = buyerAddr;
        //escrow.seller = sellerAddr;
        escrow.buyerEmail = buyerEmail;
        escrow.sellerEmail = sellerEmail;
        escrow.title = title;
        escrow.notes = notes;
        escrow.timestamp = Blockchain.transaction.timestamp;
        
        if(initiator === "seller") {
            escrow.seller = from;
            escrow.buyer = addr;
        } else if (initiator === "buyer") {
            escrow.buyer = from;
            escrow.seller = addr;
        }
        
        escrow.product.type = productType;
        escrow.product.description = productDescription;
        escrow.product.odometer = productOdometer;
        escrow.product.vin = productVin;
        escrow.product.manDate = productManDate;
        escrow.product.model = productModel;
        escrow.product.make = productMake;
        
        escrow.shipping.whoPays = shippingWhoPays;
        escrow.shipping.address = shippingAddress;
        escrow.shipping.cost = new BigNumber(shippingCost);
        
        escrow.history.push({"when" : new Date(), "action" : "Started new escrow transaction", "tag" : "init", "who" : from});
        
        //["seller","n1TRnZdXE7uy5FD5CNZu66EZf1rXaQcaUrG","test@test.com","hospinky01@gmail.com","0.01","transaction title","notes","vehicle","productDescriptionproductDescriptionproductDescriptionproductDescription","productOdometer","productVin","productManDate","productModel","productMake","50/50","0.001","3"]
        this.escrows.put(escrow.id, escrow);
        this.escrowNr += 1;
        this.escrowArrayMap.put(this.escrowNr, escrow.id);
        
        return escrow.id;        
        
    },
    
    message: function(escrowHash, message) {
        var from = Blockchain.transaction.from;
        
        var escrow = this.escrows.get(escrowHash);
        if(escrow == null) {
            throw new Error("Escrow hash does not exist");
        }
        
        if(message.length < 2) {
            throw new Error("Please provide a longer message");
        }
        
        var inDispute = false;
        if(this._isValidDisputeAddress() && escrow.status === 3) {
            inDispute = true;
        }
        
        if(escrow.seller !== from && escrow.buyer !== from && inDispute === false) {
            throw new Error("You can't post a message on this transaction");
        }
        
        var today = new Date();
        escrow.messages.push({"id" : Blockchain.transaction.hash, "message": message, "who" : from, "when" : today, "read" : 0});
        escrow.history.push({"when" : new Date(), "action" : "Added a new message", "tag" : "msg", "who" : from});
        
        this.escrows.put(escrow.id, escrow);
        return true;
    },
    
    markMessageAsRead: function(escrowHash, messageHash) {
        var from = Blockchain.transaction.from;
        
        var escrow = this.escrows.get(escrowHash);
        if(escrow == null) {
            throw new Error("Escrow hash does not exist");
        }
        var inDispute = false;
        if(this._isValidDisputeAddress() && escrow.status === 3) {
            inDispute = true;
        }
        
        if(escrow.seller !== from && escrow.buyer !== from && inDispute === false) {
            throw new Error("You can't post a message on this transaction");
        }
        
        var messages = [];
        
        for(var i = 0; i < escrow.messages.length; i++) {
            if(escrow.messages[i].id === messageHash && from !== escrow.messages[i].who) {
                messages.push({"id" : escrow.messages[i].id, "message": escrow.messages[i].message, "who" : escrow.messages[i].who, "when" : escrow.messages[i].when, "read" : 1})
            } else {
                messages.push({"id" : escrow.messages[i].id, "message": escrow.messages[i].message, "who" : escrow.messages[i].who, "when" : escrow.messages[i].when, "read" : escrow.messages[i].read})
            }
        }
        escrow.messages = messages;
        
        this.escrows.put(escrow.id, escrow);
        return escrow;
    },
     
   
    //Only the !initiator can reject the escrow request
    rejectEscrow: function(escrowHash) {
        
        //rejection address action
        var from = Blockchain.transaction.from;
        
        var escrow = this.escrows.get(escrowHash);
        if(escrow == null) {
            throw new Error("Escrow hash does not exist");
        }
        //Only a pending escrow can be rejected
        if(escrow.status != 0) {
            throw new Error("Only a pending escrow request can be rejected");
        }
        
        //Only the !initiator can reject the escrow request
        if (escrow.initiatedBy == "seller" && escrow.buyer != from) {
            throw new Error("On a seller initiated escrow, only the same buyer can reject the transaction, different buyer address given");
        } else if (escrow.initiatedBy == "buyer" && escrow.seller != from) {
            throw new Error("On a buyer initiated escrow, only the same seller can reject the transaction, different seller address given");
        }
        
        //change the status to rejected status which is 5
        escrow.status = 5;
        
        escrow.history.push({"when" : new Date(), "action" : "Rejected an escrow transaction", "tag" : "reject", "who" : from});
        
        this.escrows.put(escrow.id, escrow);
        return escrow;
    },
    
    acceptEscrow: function(escrowHash) {
        //acceptance address action
        var from = Blockchain.transaction.from;
        
        var escrow = this.escrows.get(escrowHash);
        
        if(escrow == null) {
            throw new Error("Escrow hash does not exist");
        }
        
        //Only a pending escrow can be accepted
        if(escrow.status !== 0 && escrow.status !== 7) {
            throw new Error("Only a pending escrow request can be accepted");
        }
        
        //Only the !initiator can accept the escrow request
        if (escrow.initiatedBy == "seller" && escrow.buyer != from ) {
            throw new Error("On a seller initiated escrow, only the same buyer can accept the transaction, different buyer address given");
        } else if (escrow.initiatedBy == "buyer" && escrow.seller != from) {
            throw new Error("On a buyer initiated escrow, only the same seller can accept the transaction, different seller address given");
        }
        
        
        //Only the buyer that accepts the escrow has to deposit the amount when accepting it
        if(escrow.buyer === from && escrow.fundsDeposit === 0) {
            if(this.depositFunds(escrow.id)) {
                escrow.fundsDeposit = 1;
            } else {
                throw new Error("The deposited amount is not valid");
                return false;
            }
        }
        
        escrow.status = 1;
        
        if(escrow.seller === from) {
            escrow.status = 7;
            
        }
        
        escrow.history.push({"when" : new Date(), "action" : "Accepted transaction", "tag" : "accept", "who" : from});
        this.escrows.put(escrowHash, escrow);
        return escrow;
        
    },
    
    
    depositFunds: function(escrowHash) {
        //If shipping cost is split, or the buyer has to pay the shipping, 
        //this has to be added to the deposit value
        var from = Blockchain.transaction.from;
        var escrow = this.escrows.get(escrowHash);
        
        if(escrow == null) {
            return false;
        }
        
        if(escrow.buyer != from) {
            return false;
        }
        
        
        if(escrow.fundsDeposit == 1) {
            return false;
        }
        
        var value = new BigNumber(Blockchain.transaction.value);
        var escrowPrice = escrow.price;
        var shippingAmount = this.getShippingAmount(escrow.id, "buyer");
        var amountPlusShipping = new BigNumber(parseFloat(escrowPrice) + parseFloat(shippingAmount));
        
        //Check if the deposited value is the same with the escrow information
        //if( amount != amountPlusShipping) {
        if( value.dividedBy(new BigNumber(10).pow(18)).comparedTo(amountPlusShipping) != 0) {
            throw new Error("The amount deposited is not the same as the request. Should receive a total of: " 
                    + amountPlusShipping + " , shipping: " + shippingAmount + " , given: " + value.dividedBy(new BigNumber(10).pow(18)));
        }
        
        var toBalance = this.balance.get(Blockchain.transaction.to) || new BigNumber(0);
        this.balance.set(Blockchain.transaction.to, toBalance.add(amountPlusShipping));
        
        escrow.status = 1;   
        escrow.fundsDeposit = 1;
        
        escrow.history.push({"when" : new Date(), "action" : "Deposited funds", "tag" : "deposit", "who" : from});
        
        this.escrows.put(escrowHash, escrow);
        
        return true;
    },
    
    _isValidDisputeAddress: function() {
        for( var i = 1; i <= this.disputeNr; i++) {
            var key = this.disputeArray.get(i);
            var val = this.disputeArrayMap.get(key);
            if(val === Blockchain.transaction.from); {
                return true;
            }
        }
        return false;
    },
    
    //Only the seller can release the funds in case of a rejection/abandon and if 
    //the funds have been deposited, in which case the funds will be sent back to the buyer
    refund: function(escrowHash) {
        var from = Blockchain.transaction.from;
        var dappAddress = Blockchain.transaction.to;
        var escrow = this.escrows.get(escrowHash);
        
        if(escrow == null) {
            return false;
        }
        
        var inDispute = false;
        if(this._isValidDisputeAddress() && escrow.status === 3) {
            inDispute = true;
        }
        
        //Only the seller can abandon and send back the funds to the buyer
        if(escrow.seller != from && inDispute === false) {
            return false;
        }
        
        if(escrow.fundsDeposit !== 1 && inDispute === false) {
            return false;
        }
        
        if(escrow.status !== 1 && inDispute === false) {
            return false;
        }
        
        //Get the amount to be transfered back
        var value = new BigNumber(parseFloat(escrow.price) + parseFloat(this.getShippingAmount(escrow.id, "buyer")));
        
        /*var value = new BigNumber(Blockchain.transaction.value);
        var amount = new BigNumber(value);
        var escrowPrice = new BigNumber(escrow.price);
        var shippingAmount = new BigNumber(this.getShippingAmount(escrow.id, "buyer"));*/
        
        var balance = new BigNumber(this.balance.get(dappAddress));
        
        if(balance.comparedTo(value) >= 0) {
            var result = Blockchain.transfer(escrow.buyer, value.times(new BigNumber(10).pow(18)));
            if (!result) {
                //throw new Error(result);
                throw new Error("Transfer failed");
                return false;
            }
        } else {
            throw new Error("Contract has not sufficient funds.");
        }
        
         Event.Trigger("EscrowFundsReleaseAfterAbandon", {
            Transfer: {
                from: dappAddress,
                to: escrow.buyer,
                value: value.toString()
            }
        });
        escrow.history.push({"when" : new Date(), "action" : "Initiated a refund", "tag" : "refund", "who" : from});
        escrow.status = 4;
        this.escrows.put(escrow.id, escrow);
        return escrow;
        
        
    },
    
    ship: function(escrowHash, tracking, operator, info) {
        var from = Blockchain.transaction.from;
        var escrow = this.escrows.get(escrowHash);
        
        if(tracking == "" || operator == "") {
            throw new Error("Please provide a tracking number and the operator name");
        }
        
        if(escrow == null) {
            return false;
        }
        
        //only the seller can change the shipping status and add tracking number
        if(escrow.seller != from) {
            throw new Error("Only the seller can change the shipping status");
        }
        
        //Change the status only from the accepted + funds deposited
        if(escrow.status === 1 && escrow.fundsDeposit === 1) {
            escrow.shipping.trackingNumber = tracking;
            escrow.shipping.operator = operator;
            escrow.shipping.info = info;
            
            //Change status to shipped
            escrow.status = 6;
            escrow.history.push({"when" : new Date(), "action" : "Has shipped the item", "tag" : "shipping", "who" : from});
            
            this.escrows.put(escrow.id, escrow);
            return escrow;
            
        }
        
        return false;
        
    },
    
    releaseFunds: function(escrowHash) {
        var from = Blockchain.transaction.from;
        var dappAddress = Blockchain.transaction.to;
        var escrow = this.escrows.get(escrowHash);
        
        
        if(escrow == null) {
            return false;
        }
        
         var inDispute = false;
        if(this._isValidDisputeAddress() && escrow.status === 3) {
            inDispute = true;
        }
        
        //Only the buyer can release the funds to the seller
        if(escrow.buyer != from && inDispute === false) {
            return false;
        }
        
        if(escrow.fundsDeposit !== 1 && inDispute === false) {
            return false;
        }
        
        //Only after the product has been shipped the buyer can release the funds
        if(escrow.status !== 6 && inDispute === false) {
            return false;
        }
        
        
        var value = new BigNumber(parseFloat(escrow.price) + parseFloat(this.getShippingAmount(escrow.id, "buyer")));
        var balance = new BigNumber(this.balance.get(dappAddress));
        
        if(balance.comparedTo(value) >= 0) {
            var result = Blockchain.transfer(escrow.seller, value.times(new BigNumber(10).pow(18)));
            if (!result) {
                throw new Error("Transfer failed");
                return false;
            }
        } else {
            throw new Error("Contract has not sufficient funds.");
        }
        
        
         Event.Trigger("EscrowFundsRelease", {
            Transfer: {
                from: dappAddress,
                to: escrow.seller,
                value: value.toString()
            }
        });
        
        escrow.history.push({"when" : new Date(), "action" : "Released the funds", "tag" : "fund-release", "who" : from});
        
        escrow.status = 2;
        this.escrows.put(escrow.id, escrow);
        return escrow;
       
    },
    
    
    
    getShippingAmount: function(escrowHash, whoAsks) {
        var escrow = this.escrows.get(escrowHash);
        if(escrow == null) {
            return 0;
        }
        
        if(escrow.shipping.whoPays == "seller") {
            return 0;
        }
        
        if(escrow.shipping.whoPays == "buyer") {
            if(whoAsks == "buyer") {
                return escrow.shipping.cost;
            } else {
                return 0;
            }
        }
        
        
        if(escrow.shipping.whoPays == "50/50") {
            return escrow.shipping.cost/2;
        }
    },
    
    getAllEscrows: function(limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        
        if(offset > this.escrowNr){
           throw new Error("Offset is not valid");
        }
        
        var number = offset+limit;
        if(number > this.escrowNr){
          number = this.escrowNr;
        }
        
        var result = [];
        
        for(var i = offset; i <= number; i++){
            var key = this.escrowArrayMap.get(i);
            var object = this.escrows.get(key);
            result.push(object);
        }
        return result;
    },
    
    
    //Get the current address associated escrows
    getEscrows: function() {
        var from = Blockchain.transaction.from;
        
        var result = [];
        
        for(var i = 1; i <= this.escrowNr; i++){
            var key = this.escrowArrayMap.get(i);
            var object = this.escrows.get(key);
            if(object.buyer === from || object.seller === from) {
                result.push(object);
            }
            
        }
        return result;
    },
    
    getEscrow: function(txHash) {
        return this.escrows.get(txHash);
    },
    
    getContractBalance: function() {
        return this.balance.get(Blockchain.transaction.to);
    },
    
    
    getBalance: function(txHash) {
        var from = Blockchain.transaction.to;
        return this.balance.get(from);
    }
    
    

};

module.exports = Escrow;