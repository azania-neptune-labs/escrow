dapp = "n1iF2bhBSgZz9fNmVULDPQfDvWrSxXtdGte";
reqUrl = "https://testnet.nebulas.io";


serialNumber = "";
NebPay = require("nebpay");
nebPay = new NebPay();
txTimer = null;
HttpRequest = require("nebulas").HttpRequest;
Neb = require("nebulas").Neb;
Account = require("nebulas").Account;
Transaction = require("nebulas").Transaction;
Unit = require("nebulas").Unit;
neb = new Neb();

function toggleLoading() {
    $("#loading").toggle();
}

function changeProductType(element) {
    $("#vehicleType").toggle();
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}




function initializeJS() {

    //tool tips
    jQuery('.tooltips').tooltip();

    //popovers
    jQuery('.popovers').popover();

    //custom scrollbar
        //for html
    jQuery("html").niceScroll({styler:"fb",cursorcolor:"#007AFF", cursorwidth: '6', cursorborderradius: '10px', background: '#F7F7F7', cursorborder: '', zindex: '1000'});
        //for sidebar
    jQuery("#sidebar").niceScroll({styler:"fb",cursorcolor:"#007AFF", cursorwidth: '3', cursorborderradius: '10px', background: '#F7F7F7', cursorborder: ''});
        // for scroll panel
    jQuery(".scroll-panel").niceScroll({styler:"fb",cursorcolor:"#007AFF", cursorwidth: '3', cursorborderradius: '10px', background: '#F7F7F7', cursorborder: ''});
    
    //sidebar dropdown menu
    jQuery('#sidebar .sub-menu > a').click(function () {
        var last = jQuery('.sub-menu.open', jQuery('#sidebar'));        
        jQuery('.menu-arrow').removeClass('arrow_carrot-right');
        jQuery('.sub', last).slideUp(200);
        var sub = jQuery(this).next();
        if (sub.is(":visible")) {
            jQuery('.menu-arrow').addClass('arrow_carrot-right');            
            sub.slideUp(200);
        } else {
            jQuery('.menu-arrow').addClass('arrow_carrot-down');            
            sub.slideDown(200);
        }
        var o = (jQuery(this).offset());
        diff = 200 - o.top;
        if(diff>0)
            jQuery("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            jQuery("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });

    // sidebar menu toggle
    jQuery(function() {
        function responsiveView() {
            var wSize = jQuery(window).width();
            if (wSize <= 768) {
                jQuery('#container').addClass('sidebar-close');
                jQuery('#sidebar > ul').hide();
            }

            if (wSize > 768) {
                jQuery('#container').removeClass('sidebar-close');
                jQuery('#sidebar > ul').show();
            }
        }
        jQuery(window).on('load', responsiveView);
        jQuery(window).on('resize', responsiveView);
    });

    jQuery('.toggle-nav').click(function () {
        if (jQuery('#sidebar > ul').is(":visible") === true) {
            jQuery('#main-content').css({
                'margin-left': '0px'
            });
            jQuery('#sidebar').css({
                'margin-left': '-180px'
            });
            jQuery('#sidebar > ul').hide();
            jQuery("#container").addClass("sidebar-closed");
        } else {
            jQuery('#main-content').css({
                'margin-left': '180px'
            });
            jQuery('#sidebar > ul').show();
            jQuery('#sidebar').css({
                'margin-left': '0'
            });
            jQuery("#container").removeClass("sidebar-closed");
        }
    });

    //bar chart
    if (jQuery(".custom-custom-bar-chart")) {
        jQuery(".bar").each(function () {
            var i = jQuery(this).find(".value").html();
            jQuery(this).find(".value").html("");
            jQuery(this).find(".value").animate({
                height: i
            }, 2000)
        })
    }

}

jQuery(document).ready(function(){
    initializeJS();
    if(typeof(webExtensionWallet) === "undefined"){
        $("#extensionAlert").show();
        return false;
    }  
    
    populateData();
    initCalendar();
});


function getEscrowsListener(resp) {
    console.log(resp);
    if(resp == "Error: Transaction rejected by user") {
        return false;
    }
    
    if(resp.result !== null)
    {   
        var currentAddr = localStorage.getItem("currentAddr");
        toggleLoading();
        console.log(JSON.parse(resp.result));
        
        var escrows = JSON.parse(resp.result);
        
        var notAllowed = false;
        for (var i = 0; i < escrows.length; i++) {
            if(escrows[i].seller != currentAddr && escrows[i].buyer != currentAddr) {
                notAllowed = true;
            }
        }
        
        if(notAllowed === false) {
            localStorage.setItem("escrows", JSON.stringify(escrows));
            populateData();
        } else {
            localStorage.removeItem("escrows");
            alert("Current address has escrows which he is not allowed to.")
        }
    } else {
        alert("could not find transaction");
    }
    
}


function populateData() {
    var currentAddr = localStorage.getItem("currentAddr");
    var escrows = JSON.parse(localStorage.getItem("escrows"));
    if(currentAddr === undefined || currentAddr == null || currentAddr == '') {
        alert("Please login.");
    }
    
    
    var hash = currentAddr;
    var data = new Identicon(hash).toString();
    $('.username').html(currentAddr);
    $("#profileAvatar").html('<img width="35" src="data:image/png;base64,' + data + '">');
    
    var unreadMessages = [];
    var unreadMessagesTitles = [];
    var latestHistory = [];
    var latestHistoryIds = [];
    for(var i=0; i < escrows.length; i++) {
        
        $("#escrowHashList").append('<option value="'+escrows[i].id+'">'+escrows[i].title+'</option>');
        
        latestHistory.push(escrows.history.pop());
        latestHistoryIds.push(escrows.id);
        
        if(escrows[i].messages.length > 0) {
            for(var j = 0; j < escrows[i].messages.length; j++) {
                if(escrows[i].messages[j].read == 0 && escrows[i].messages[j].who != currentAddr) {
                    unreadMessages.push(escrows[i].messages[j]);
                    unreadMessagesTitles.push(escrows[i].title);
                }
            }
        }
    }
    
    
    if(latestHistory.length > 0) {
        var history = '';
        history += '<tr>';
        history += '<td>Today</td>';
        history += '<td>';
          history += 'web design';
        history += '</td>';
        history += '<td>';
          history += '<span class="badge bg-important">Upload</span>';
        history += '</td>';
        history += '<td>';
          history += '<span class="profile-ava">';
                            history += '<img alt="" class="simple" src="img/avatar1_small.jpg">';
                       history += '</span>';
        history += '</td>';
        history += '</tr>';
        $("#latestTransactions").append(history);
    }
    
    if(unreadMessages.length > 0) {
        $("#unreadMessages").html(unreadMessages.length);
        $("#messagesDropdownHeader").html("You have " + unreadMessages.length + " new messages");
        
        
        for(var i=0; i < unreadMessages.length; i++) {
            $( "#messagesDropdownHeader" ).parent().after( "" );
            var hash = unreadMessages[i].who;
            var data = new Identicon(hash).toString();
            $( "#messagesDropdownHeader" ).parent().after( '<li><a href="messages.html?id=' + unreadMessages[i].id + '"><span class="photo"><img width="35" src="data:image/png;base64,' + data + '"></span><span class="subject"><span class="from">' + unreadMessagesTitles[i] + '</span></span><span class="message">'+unreadMessages[i].message+'</span></a></li>' );
            
            var msg = '';
            msg += '<li class="by-me">';
              msg += '<div class="avatar pull-left">';
                msg += '<img width="45" src="data:image/png;base64,' + data + '">';
              msg += '</div>';

              msg += '<div class="chat-content">';
                msg += '<div class="chat-meta">' + unreadMessagesTitles[i] + '<span class="pull-right">'+unreadMessages[i].when+'</span></div>';
                msg += unreadMessages[i].message;
                msg += '<div class="clearfix"></div>';
              msg += '</div>';
            msg += '</li>';
            $("#unreadMessagesPanel").append(msg);
        }   
        
        
       
    } else {
        $("#unreadMessagesPanel").parent().html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button">No new mesages at the moment</div>');
    }
    
    
    
    
    // 0-pending
    // 1-accepted
    // 2-released funds
    // 3-dispute
    // 4-refunded
    // 5 - rejected
    // 6 - in shipping status
    // 7 - seller accepted -> initiated by the buyer, after seller acception the buyer has to deposit funds
    var pendingEscrows = [];
    
    var completedEscrows = 0;
    var disputedEscrows = 0;
    var refundedEscrows = 0;
    var pendingEscrowsNr = 0;
    
    for(var i=0; i < escrows.length; i++) {
        
        if(escrows[i].status == 3) {
            disputedEscrows += 1;
        }
        if(escrows[i].status == 2) {
            completedEscrows += 1;
        }
        if(escrows[i].status == 4 || escrows[i].status == 5) {
            refundedEscrows += 1;
        }
        if(escrows[i].status == 0 || escrows[i].status == 7 || escrows[i].status == 1 || escrows[i].status == 6 ) {
            pendingEscrowsNr += 1;
        }
        
        if(escrows[i].status == 0 && escrows[i].initiatedBy == 'seller' && escrows[i].buyer === currentAddr) {
            pendingEscrows.push(escrows[i]);
        }
        
        if(escrows[i].status == 1 && escrows[i].seller === currentAddr && escrows[i].fundsDeposit == 1) {
            pendingEscrows.push(escrows[i]);
        }
        
        if(escrows[i].status == 1 && escrows[i].buyer === currentAddr && escrows[i].fundsDeposit == 0) {
            pendingEscrows.push(escrows[i]);
        }
        
        if(escrows[i].status == 7 && escrows[i].buyer === currentAddr && escrows[i].fundsDeposit == 0) {
            pendingEscrows.push(escrows[i]);
        }
        
        if(escrows[i].status == 3) {
            pendingEscrows.push(escrows[i]);
        }
        
        if(escrows[i].status == 6 && escrows[i].buyer === currentAddr) {
            pendingEscrows.push(escrows[i]);
        }
    }
    
    $("#startedEscrows").html(disputedEscrows);
    $("#receivedEscrows").html(refundedEscrows);
    $("#pendingEscrowsStat").html(pendingEscrowsNr);
    $("#completedEscrows").html(completedEscrows);
    
    if(pendingEscrows.length > 0) {
        $("#pendingEscrows").html(pendingEscrows.length);
        $("#pendingEscrowsHeader").html('You have ' + pendingEscrows.length + ' pending escrows');
        
        var htmlPendingEscrows = '';
        
        for(var i = 0; i < pendingEscrows.length; i++) {
            if(escrows[i].status == 0 && escrows[i].initiatedBy == 'seller' && escrows[i].buyer === currentAddr) {
                var complete = 10;
                var action = 'You have to accept the transaction';
            }

            if(pendingEscrows[i].status == 1 && pendingEscrows[i].seller === currentAddr && pendingEscrows[i].fundsDeposit == 1) {
                var complete = 30;
                var action = 'You have to ship the products';
            }

            if(pendingEscrows[i].status == 1 && pendingEscrows[i].buyer === currentAddr && pendingEscrows[i].fundsDeposit == 0) {
                var complete = 20;
                var action = 'You have to deposit the funds';
            }

            if(pendingEscrows[i].status == 7 && pendingEscrows[i].buyer === currentAddr && pendingEscrows[i].fundsDeposit == 0) {
                var complete = 20;
                var action = 'You have to deposit the funds';
            }

            if(pendingEscrows[i].status == 3) {
                var complete = 40;
                var action = 'Escrow under dispute';
            }

            if(pendingEscrows[i].status == 6 && pendingEscrows[i].buyer === currentAddr) {
                var complete = 80;
                var action = 'You have to accept the items and release the funds';
            }
            
            htmlPendingEscrows += '<li>'
                htmlPendingEscrows += '<a href="escrows.html?id=' + pendingEscrows[i].id + '">'
                  htmlPendingEscrows += '<div class="task-info">'
                    htmlPendingEscrows += '<div class="desc">'+pendingEscrows[i].title+'</div>'
                    htmlPendingEscrows += '<div class="percent">'+complete+'%</div>'
                  htmlPendingEscrows += '</div>'
                  htmlPendingEscrows += '<div class="progress progress-striped active">'
                    htmlPendingEscrows += '<div class="progress-bar" role="progressbar" aria-valuenow="'+complete+'" aria-valuemin="0" aria-valuemax="100" style="width: '+complete+'%">'
                      htmlPendingEscrows += '<span class="sr-only">'+action+'</span>'
                    htmlPendingEscrows += '</div>'
                  htmlPendingEscrows += '</div>'

                htmlPendingEscrows += '</a>'
              htmlPendingEscrows += '</li>'
        }
        $( "#pendingEscrowsHeader" ).parent().after(htmlPendingEscrows);
    }
    
    
}

function getEscrowsListenerCall(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.setRequest(new HttpRequest(reqUrl));
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result != '') {
                    clearInterval(txTimer);
                    localStorage.setItem("currentAddr", receipt.from);
                    serialNumber = nebPay.simulateCall(dapp, 0, "getEscrows", "", {
                        qrcode: {
                            showQRCode: false
                        },
                        listener: getEscrowsListener
                    });
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}


function initiateEscrowListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.setRequest(new HttpRequest(reqUrl));
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    //alert(receipt.execute_result);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">Escrow has been submited</div>');
                    $(window).scrollTop(0);
                    //alert("Escrow has been submited");
                    toggleLoading();
                    clearInterval(txTimer);
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}



function sendMessageListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.setRequest(new HttpRequest(reqUrl));
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#messageAlerts").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#messageAlerts").html('<div class="alert alert-block alert-success fade in">Message has been saved.</div>');
                    toggleLoading();
                    clearInterval(txTimer);
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}


function addslashes(string) {
    return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
}

function initiateEscrow(data) {
    console.log(data);
    
    /*initiator, addr, buyerEmail, sellerEmail, price, title, notes, 
            productType, productDescription, productOdometer, productVin, productManDate, productModel, productMake,
            shippingWhoPays, shippingCost, inspectionPeriod, shippingAddress*/
    for(var i = 0; i < data.length; i++) {
        if (data[i].name == 'initiator') {
            var initiator = data[i].value;
        } else if (data[i].name == 'addr') {
            var addr = data[i].value
        } else if (data[i].name == 'buyerEmail') {
            var buyerEmail = data[i].value
        } else if (data[i].name == 'sellerEmail') {
            var sellerEmail = data[i].value
        } else if (data[i].name == 'price') {
            var price = data[i].value
        } else if (data[i].name == 'title') {
            var title = data[i].value
        } else if (data[i].name == 'notes') {
            var notes = data[i].value
        } else if (data[i].name == 'productType') {
            var productType = data[i].value
        } else if (data[i].name == 'productDescription') {
            var productDescription = data[i].value
        } else if (data[i].name == 'productOdometer') {
            var productOdometer = data[i].value
        } else if (data[i].name == 'productVin') {
            var productVin = data[i].value
        } else if (data[i].name == 'productManDate') {
            var productManDate = data[i].value
        } else if (data[i].name == 'productModel') {
            var productModel = data[i].value
        } else if (data[i].name == 'productMake') {
            var productMake = data[i].value
        } else if (data[i].name == 'shippingWhoPays') {
            var shippingWhoPays = data[i].value
        } else if (data[i].name == 'shippingCost') {
            var shippingCost = data[i].value
        } else if (data[i].name == 'inspectionPeriod') {
            var inspectionPeriod = data[i].value
        } else if (data[i].name == 'shippingAddress') {
            var shippingAddress = data[i].value
        }
    }
    var errors = [];
//Arguments validation
    if(initiator != "seller" && initiator != "buyer") {
        errors.push("Initiator must be either seller or buyer");
    } 
    if (price <= 0) {
        errors.push("Price amount must be greater than 0");
    }
    if(!validateEmail(buyerEmail) || !validateEmail(sellerEmail)) {
       errors.push("Seller/Buyer emails are not valid");
    }
    if(title.length < 6) {
        errors.push("Title must be at least 6 characters long");
    }
    if(productType != 'vehicle' && productType != 'other') {
        errors.push("Not supported prodct Type");
    }
    if(productDescription.length < 25) {
        errors.push("Product description must be longer than 25 characters");
    }
    if(productDescription.notes < 25) {
        errors.push("Transaction agreements must be longer than 25 characters");
    }
    if(productType == "vehicle" && productOdometer == "") {
        errors.push("Vehicle odometer must be provided");
    }
    if(productType == "vehicle" && productVin == "") {
        errors.push("Vehicle VIN must be provided");
    }
    if(productType == "vehicle" && productManDate == "") {
        errors.push("Vehicle manufacturing date must be provided");
    }
    if(productType == "vehicle" && productModel == "") {
        errors.push("Vehicle model must be provided");
    }
    if(productType == "vehicle" && productMake == "") {
        errors.push("Vehicle make must be provided");
    }
    if(shippingWhoPays != 'seller' && shippingWhoPays != 'buyer' && shippingWhoPays != '50/50') {
        errors.push("Who pays the shipping must be either seller, buyer or 50/50");
    }
    if(shippingCost < 0) {
        errors.push("Shipping cost must pe positive");
    }
    if (parseInt(inspectionPeriod) != inspectionPeriod) {
        errors.push("Inspection period must be a valid number of days");
    } 

    var errorHtml = '';
    for(var i = 0; i < errors.length; i++) {
        errorHtml += '<div class="alert alert-block alert-danger fade in">' + errors[i] + '</div>';
    }

    if(errors.length > 0) {
        $("#errors").html(errorHtml);
        $(window).scrollTop(0);
        return false;
    } else {
        $("#errors").html('');
    }
    var args = "[\"" + addslashes(initiator) +"\",\"" + addslashes(addr) +"\",\"" + addslashes(buyerEmail) +"\",\"" + addslashes(sellerEmail) +"\",\"" + addslashes(price) +"\",\"" + addslashes(title) +"\",\"" + addslashes(notes) +"\",\"" + addslashes(productType) +"\",\"" + addslashes(productDescription) +"\",\"" + addslashes(productOdometer) +"\",\"" + addslashes(productVin) +"\",\"" + addslashes(productManDate) +"\",\"" + addslashes(productModel) +"\",\"" + addslashes(productMake) +"\",\"" + addslashes(shippingWhoPays) +"\",\"" + addslashes(shippingCost) +"\",\"" + addslashes(inspectionPeriod) +"\",\"" + addslashes(shippingAddress) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "initiateEscrow", args, {
        qrcode: {
            showQRCode: false
        },
        listener: initiateEscrowListener
    });
    
}


function sendMessage(message, id) {
    $("#messageAlerts").html('');
    if(message.length > 0 && id != '') {
        serialNumber = nebPay.call(dapp, 0, "message", "[\""+id+"\", \""+addslashes(message)+"\"]", {
            qrcode: {
                showQRCode: false
            },
            listener: sendMessageListener
        });
    } else {
        $("#messageAlerts").html('<div class="alert alert-block alert-danger fade in">Please add a message content and select an escrow transaction</div>');
    }
}


function login() {
    localStorage.removeItem("currentAddr");
    localStorage.removeItem("escrows");
    serialNumber = nebPay.call(dapp, 0, "getEscrows", "", {
        qrcode: {
            showQRCode: false
        },
        listener: getEscrowsListenerCall
    });
    
}


function logout() {
    localStorage.removeItem("currentAddr");
    localStorage.removeItem("escrows");
    window.location.href = "index.html";
}




function initCalendar() {
    
    var escrows = JSON.parse(localStorage.getItem("escrows"));
    /* initialize the calendar
    -----------------------------------------------------------------*/
    if(escrows.length == 0) {
        return false;
    }
    
    var events = [];
    
    for(var i = 0; i < escrows.length; i++) {
        events.push({
               title: escrows[i].title,
               start: new Date(escrows[i].timestamp*1000)
           });
           
    }
    
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $('#calendar').fullCalendar({
       header: {
           left: 'prev,next today',
           center: 'title',
           right: 'month,basicWeek,basicDay'
       },
       editable: false,
       droppable: false, // this allows things to be dropped onto the calendar !!!
       
       events: events
    });
}