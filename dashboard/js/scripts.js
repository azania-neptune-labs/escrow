dapp = "n1qo58xtUWzNHd5NdijRyBLEwHooApCbFgg";
reqUrl = "https://mainnet.nebulas.io";


serialNumber = "";
txTimer = null;

var nebulas = require("nebulas"),
Account = nebulas.Account,
neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest(reqUrl));

var NebPay = require("nebpay");
var nebPay = new NebPay();

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
    
});


function getEscrowsListener(resp) {
    console.log(resp);
    if(resp == "Error: Transaction rejected by user") {
        return false;
    }
    
    if(resp.result !== null)
    {   
        var currentAddr = localStorage.getItem("currentAddr");
        console.log('raspuns');
        console.log(resp.result);
		console.log(resp);
		if(resp.result == 'Unexpected token < in JSON at position 0') {
			toggleLoading();
			alert("Blockchain did not respond, please refresh the page and try again.");
			return false;
		}
        
        var escrows = JSON.parse(resp.result);
		
		
		console.log(escrows);
        
        var notAllowed = false;
        for (var i = 0; i < escrows.length; i++) {
            if(escrows[i].seller != currentAddr && escrows[i].buyer != currentAddr) {
                notAllowed = true;
            }
        }
        toggleLoading();
		
		if(escrows.length == 0) {
			$("#errors").html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No escrow transactions at this time.</div>');
			return false;
		}
		
        if(notAllowed === false) {
            localStorage.setItem("escrows", JSON.stringify(escrows));
            populateData();
            var escrows = JSON.parse(localStorage.getItem("escrows"));
			if(escrows != undefined && escrows.length > 0 )
				escrows = escrows.reverse();
            
            //update escrows page
            $("#accordion").html('');
            if($("#accordion") !== undefined) {
                if(escrows.length > 0) {
                    for(var i = 0; i < escrows.length; i++) {
                        $("#accordion").append(generateEscrowHtml(escrows[i]));
                    }
                } else {
                    $("#errors").html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No escrow transactions at this time.</div>');
                }
            }
            
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
	if(escrows != undefined && escrows.length > 0 )
		escrows = escrows.reverse();
    
    
    $("#loginBox").html('');
    
    //Show login CTA in case of user is logged out
    if(currentAddr === undefined || currentAddr == null || currentAddr == '') {
        
        var loginBoxHtml = '';
        
        loginBoxHtml += '<div class="row">';
            
            loginBoxHtml += '<div class="col-lg-12 portlets">';
            loginBoxHtml += '<div class="panel panel-default">';
              loginBoxHtml += '<div class="panel-heading">';
                loginBoxHtml += '<div class="pull-left">&nbsp;</div>';
                loginBoxHtml += '<div class="clearfix"></div>';
              loginBoxHtml += '</div>';
              loginBoxHtml += '<div class="panel-body">';
                  loginBoxHtml += '<div class="alert alert-block alert-danger fade in">';
                  loginBoxHtml += 'In order to initiate or view your escrows you must first sign in. Thank you!';
              loginBoxHtml += '</div>';
                loginBoxHtml += '<div class="padd">';
                      loginBoxHtml += '<div class="form-group">';
                        loginBoxHtml += '<div class="col-lg-9">';
                            loginBoxHtml += '<button type="button" onclick="login();" class="btn btn-primary">Click here to <strong>Login NAS</strong></button>';
                        loginBoxHtml += '</div>';
                      loginBoxHtml += '</div>';


                loginBoxHtml += '</div>';
                loginBoxHtml += '<div class="widget-foot">';
                loginBoxHtml += '</div>';
              loginBoxHtml += '</div>';
            loginBoxHtml += '</div>';

          loginBoxHtml += '</div>';
        loginBoxHtml += '</div>';
        $("#loginBox").html(loginBoxHtml);
        
    }
    
    
    
    
    
    //Top right hash ICON
    var hash = currentAddr;
    var data = new Identicon(hash).toString();
    $('.username').html(currentAddr);
    $("#profileAvatar").html('<img width="35" src="data:image/png;base64,' + data + '">');
    
	if(escrows == null || escrows == undefined || escrows.length == 0) {
        return false;
    }
    
    
    //Unread messages and latest history action to be displayed on top right corner
    var unreadMessages = [];
    var unreadMessagesTitles = [];
    var latestHistory = [];
    var latestHistoryIds = [];
	$("#escrowHashList").html('');
    for(var i=0; i < escrows.length; i++) {
        
        $("#escrowHashList").append('<option value="'+escrows[i].id+'">'+escrows[i].title+'</option>');
        
        if(escrows[i].history !== undefined && escrows[i].history.length > 0) {
            latestHistory.push(escrows[i].history.pop());
            latestHistoryIds.push(escrows[i].id);
        }
        
        if(escrows[i].messages.length > 0) {
            for(var j = 0; j < escrows[i].messages.length; j++) {
                if(escrows[i].messages[j].read == 0 && escrows[i].messages[j].who != currentAddr) {
                    unreadMessages.push(escrows[i].messages[j]);
                    unreadMessagesTitles.push(escrows[i].title);
                }
            }
        }
    }
    
	
	$("#latestTransactions").html('');
    
    //Latest transaction history list to be displayed on index
    if(latestHistory.length > 0) {
        for(var i = 0 ; i < latestHistory.length; i++) {
            
            
            var history = '';
            
            
            history += '<tr>';
            history += '<td>' + latestHistory[i].when + '</td>';
            history += '<td>';
              history += latestHistory[i].action;
            history += '</td>';
            history += '<td>';
            
            
            if(latestHistory[i].tag == "init") {
              history += '<span class="badge bg-info">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "dispute") {
              history += '<span class="badge bg-warning">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "msg") {
              history += '<span class="badge bg-info">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "reject") {
              history += '<span class="badge bg-inverse">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "accept") {
              history += '<span class="badge bg-primary">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "deposit") {
              history += '<span class="badge bg-important">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "refund") {
              history += '<span class="badge bg-primary">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "shipping") {
              history += '<span class="badge bg-primary">' + latestHistory[i].tag + '</span>';
            } else if(latestHistory[i].tag == "fund-release") {
              history += '<span class="badge bg-success">' + latestHistory[i].tag + '</span>';
            } 
              
            history += '</td>';
            history += '<td>';
            
            var hash = latestHistory[i].who;
            var data = new Identicon(hash).toString();
            
            
            history += '<span class="profile-ava">';
            history += '<img width="30" src="data:image/png;base64,' + data + '">';
            history += '</span>';
                           
            history += '</td>';
            history += '</tr>';
            $("#latestTransactions").append(history);
        }
    } else {
        $("#latestTransactions").parent().parent().append('<div class="panel-body"><div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No transaction history.</div></div>');
    }
    
	
	$("#unreadMessagesPanel").html('');
	$( "#messagesDropdownHeader" ).parent().nextAll().remove();
    
    //$( "#messagesDropdownHeader" ).parent().html('');
    //Unread messages list  on top right corner
    if(unreadMessages.length > 0) {
        $("#unreadMessages").html(unreadMessages.length);
        $("#messagesDropdownHeader").html("You have " + unreadMessages.length + " new messages");
        
        
        for(var i=0; i < unreadMessages.length; i++) {
            $( "#messagesDropdownHeader" ).parent().after( "" );
            var hash = unreadMessages[i].who;
            var data = new Identicon(hash).toString();
            $( "#messagesDropdownHeader" ).parent().after( '<li><a href="messages.html?id=' + unreadMessages[i].id + '"><span class="photo"><img width="35" src="data:image/png;base64,' + data + '"></span><span class="subject"><span class="from">' + unreadMessagesTitles[i] + '</span></span><span class="message">'+unreadMessages[i].message.substring(0, 30)+' [...]</span></a></li>' );
            
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
        $("#unreadMessagesPanel").parent().html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No new message at this time.</div>');
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
    
    //Number of escrow types for each box on index page
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
        
        
        if(escrows[i].status == 0) {
            if ( (escrows[i].initiatedBy == 'seller' && escrows[i].buyer === currentAddr) ||
                    (escrows[i].initiatedBy == 'buyer' &&  escrows[i].seller === currentAddr) ) {
                pendingEscrows.push(escrows[i]);
            }
        } else if(escrows[i].status == 1) {
            if(escrows[i].fundsDeposit == 0) {
                if (escrows[i].initiatedBy == 'seller' && escrows[i].buyer === currentAddr) {
                   pendingEscrows.push(escrows[i]);
                } else if(escrows[i].initiatedBy == 'buyer' &&  escrows[i].buyer === currentAddr) {
                   pendingEscrows.push(escrows[i]);
                }
            } else if (escrows[i].fundsDeposit == 1) {
                if(escrows[i].initiatedBy == 'seller' && escrows[i].seller === currentAddr) {
                    pendingEscrows.push(escrows[i]);
                } else if (escrows[i].initiatedBy == 'buyer' &&  escrows[i].seller === currentAddr) {
                    pendingEscrows.push(escrows[i]);
                }

            }
        } else if(escrows[i].status == 6) {
            if (escrows[i].initiatedBy == 'seller' && escrows[i].buyer === currentAddr) {
                pendingEscrows.push(escrows[i]);
            } else if(escrows[i].initiatedBy == 'buyer' &&  escrows[i].buyer === currentAddr) {
                pendingEscrows.push(escrows[i]);
            }
        } else if(escrows[i].status == 7) {
            if(escrows[i].buyer == currentAddr) {
                pendingEscrows.push(escrows[i]);
            }
        }
        if(escrows[i].status == 3) {
            var complete = 40;
            var action = 'Escrow under dispute';
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
    
	$("#pendingEscrows").html('');
	$("#pendingEscrowsHeader").html('You have 0 pending escrows');
	$( "#pendingEscrowsHeader" ).parent().nextAll().remove();
    //Pending escrow list on top right corner of the main menu
    if(pendingEscrows.length > 0) {
        $("#pendingEscrows").html(pendingEscrows.length);
        $("#pendingEscrowsHeader").html('You have ' + pendingEscrows.length + ' pending escrows');
        
        var htmlPendingEscrows = '';
        
        for(var i = 0; i < pendingEscrows.length; i++) {
            
            if(pendingEscrows[i].status == 0) {
                if (pendingEscrows[i].initiatedBy == 'seller' && pendingEscrows[i].buyer === currentAddr) {
                    var complete = 10;
                    var action = 'You have to accept the transaction';
                } else if (pendingEscrows[i].initiatedBy == 'buyer' &&  pendingEscrows[i].seller === currentAddr) {
                    var complete = 10;
                    var action = 'You have to accept the transaction';
                }
            } else if(pendingEscrows[i].status == 1) {
                if(pendingEscrows[i].fundsDeposit == 0) {
                    if (pendingEscrows[i].initiatedBy == 'seller' && pendingEscrows[i].buyer === currentAddr) {
                       var complete = 20;
                        var action = 'You have to deposit the funds';
                    } else if(pendingEscrows[i].initiatedBy == 'buyer' &&  pendingEscrows[i].buyer === currentAddr) {
                       var complete = 20;
                       var action = 'You have to deposit the funds';
                    }
                } else if (pendingEscrows[i].fundsDeposit == 1) {
                    if(pendingEscrows[i].initiatedBy == 'seller' && pendingEscrows[i].seller === currentAddr) {
                        var complete = 30;
                        var action = 'You have to ship the products';
                    } else if (pendingEscrows[i].initiatedBy == 'buyer' &&  pendingEscrows[i].seller === currentAddr) {
                        var complete = 30;
                        var action = 'You have to ship the products';
                    }

                }
            } else if(pendingEscrows[i].status == 6) {
                if (pendingEscrows[i].initiatedBy == 'seller' && pendingEscrows[i].buyer === currentAddr) {
                    var complete = 80;
                    var action = 'You have to accept the items and release the funds';
                } else if(pendingEscrows[i].initiatedBy == 'buyer' &&  pendingEscrows[i].buyer === currentAddr) {
                    var complete = 80;
                    var action = 'You have to accept the items and release the funds';
                }
            } else if(pendingEscrows[i].status == 7) {
                if(pendingEscrows[i].buyer == currentAddr) {
                    var complete = 20;
                    var action = 'You have to deposit the funds';
                }
            }
            if(pendingEscrows[i].status == 3) {
                var complete = 40;
                var action = 'Escrow under dispute';
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
    
	
	var allMessages = [];
    var allMessagesProductTitle = [];
    var allEscrowsHashes = [];
    
    for( var i = 0; i < escrows.length; i++ ) {
        for( var j = 0; j < escrows[i].messages.length; j++) {
            allMessages.push(escrows[i].messages[j]);
            allMessagesProductTitle.push(escrows[i].title);
            allEscrowsHashes.push(escrows[i].id);
        }
    }
    
    
    if(allMessages.length > 0) {
        
        var messagesHtml = '';
        var modalHtml = '';
        
        for( var i = 0; i < allMessages.length; i++ ) {
            
            var hash = allMessages[i].who;
            var data = new Identicon(hash).toString();
            
            var read = 0;
            
            if(allMessages[i].read == 1 || allMessages[i].who == localStorage.getItem("currentAddr")) {
                read = 1;
            }
            
            messagesHtml += '<tr data-toggle="modal" href="#myModal'+i+'">';
                messagesHtml += '<td class="read'+read+'">'+allMessages[i].message.substring(0, 30)+'</td>';
                messagesHtml += '<td class="read'+read+'"><span class="badge bg-info">'+allMessagesProductTitle[i]+'</span></td>';
                messagesHtml += '<td class="read'+read+'" style="text-align:right;">'+allMessages[i].when+'</td>';
                messagesHtml += '<td class="read'+read+'"><span class="profile-ava"><img width="30" src="data:image/png;base64,' + data + '"></span></td>';
            messagesHtml += '</tr>';
            
            modalHtml += '<div class="modal fade" id="myModal'+i+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel'+i+'" aria-hidden="true">';
              modalHtml += '<div class="modal-dialog">';
                modalHtml += '<div class="modal-content">';
                  modalHtml += '<div class="modal-header">';
                    modalHtml += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
                    modalHtml += '<h4 class="modal-title">'+allMessagesProductTitle[i]+'</h4>';
                  modalHtml += '</div>';
                  modalHtml += '<div class="modal-body">';

                    modalHtml += allMessages[i].message;

                  modalHtml += '</div>';
                  modalHtml += '<div class="modal-footer">';
                  if(allMessages[i].read == 0 && allMessages[i].who !== localStorage.getItem("currentAddr")) {
                        modalHtml += '<button class="btn btn-success" type="button" onclick="markAsRead(\''+allEscrowsHashes[i]+'\',\''+allMessages[i].id+'\', $(this));">Mark as read</button>';
                    }
                    modalHtml += '<button data-dismiss="modal" class="btn btn-default" type="button">Close</button>';
                  modalHtml += '</div>';
                modalHtml += '</div>';
              modalHtml += '</div>';
            modalHtml += '</div>';
            
        }
        $("#latestMessages").html(messagesHtml);
        $("#latestMessages").parent().parent().append(modalHtml);
        //console.log(modalHtml);
    } else {
        $("#latestMessages").parent().html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No new message at this time.</div>');
    }
    
    //Initiate calendar from index
    initCalendar();
    
    
}


function generateEscrowHtml(escrowObj) {
    
    var html = '';
    
    var currentAddr = localStorage.getItem("currentAddr");
    
    html += '<div class="panel panel-default">';
        html += '<div class="panel-heading">';
            html += '<h5 class="panel-title collapsed" class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#'+escrowObj.id+'">';
              html += '<table width="100%">';
                  html += '<tr>';
                    if(escrowObj.initiatedBy == 'buyer' && escrowObj.buyer === currentAddr) {
                        html += '<td width="60%"><i style="color:blue;" class="fa fa-arrow-circle-left"></i><span style="font-size: 24px">'+escrowObj.title+'</span></td>';
                    } else if(escrowObj.initiatedBy == 'buyer' && escrowObj.seller === currentAddr) {
                        html += '<td width="60%"><i style="color:green;" class="fa fa-arrow-circle-right"></i><span style="font-size: 24px">'+escrowObj.title+'</span></td>';
                    } else if(escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) {
                        html += '<td width="60%"><i style="color:blue;" class="fa fa-arrow-circle-left"></i><span style="font-size: 24px">'+escrowObj.title+'</span></td>';
                    } else if(escrowObj.initiatedBy == 'seller' && escrowObj.seller === currentAddr) {
                        html += '<td width="60%"><i style="color:green;" class="fa fa-arrow-circle-right"></i><span style="font-size: 24px">'+escrowObj.title+'</span></td>';
                    }
                    
                    
                    html += '<td style="text-align:center;" width="5%"><span class="label label-primary">'+escrowObj.price+' NAS</span></td>';
                    html += '<td style="text-align:center;" width="5%"><span class="label label-info">'+escrowObj.messages.length+' messages</span></td>';
                    
                    
                    var canReject = 0;
                    var canDispute = 0;
                    var canRefund = 0;
                    var canShip = 0;
                    
                    var amount = parseFloat(escrowObj.price);
                    
                    if(escrowObj.shipping.whoPays == 'seller' && escrowObj.seller == currentAddr) {
                        amount += parseFloat(escrowObj.shipping.cost);
                    } else if(escrowObj.shipping.whoPays == 'buyer' && escrowObj.buyer == currentAddr) {
                        amount += parseFloat(escrowObj.shipping.cost);
                    } else if(escrowObj.shipping.whoPays == '50/50') {
                        amount += parseFloat(escrowObj.shipping.cost/2);
                    }
                    
                    
                    if(escrowObj.status == 0) {
                        if(escrowObj.initiatedBy == 'seller' && escrowObj.seller === currentAddr) {
                            var todo = 'The buyer must accept the transaction and deposit the funds';
                        } else if (escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) {
                            var action = 'must be accepted';
                            var label = 'success';
                            var cta = 'Click here to Accept the transaction and deposit the funds!';
							var onclick = 'acceptEscrow(\''+escrowObj.id+'\',\''+amount+'\');';
                            var canReject = 1;
                        } else if(escrowObj.initiatedBy == 'buyer' &&  escrowObj.buyer === currentAddr) {
                            var todo = 'The seller must accept the transaction';
                        } else if (escrowObj.initiatedBy == 'buyer' &&  escrowObj.seller === currentAddr) {
                            var action = 'must be accepted';
                            var label = 'success';
                            var cta = 'Click here to Accept the transaction!';
							var onclick = 'acceptEscrow(\''+escrowObj.id+'\', 0);';
							
                            var canReject = 1;
                        }
                    } else if(escrowObj.status == 1) {
                        if(escrowObj.fundsDeposit == 0) {
                            if(escrowObj.initiatedBy == 'seller' && escrowObj.seller === currentAddr) {
                                var todo = 'The buyer must deposit the funds';
                            } else if (escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) {
                                var action = 'deposit needed';
                                var label = 'primary';
                                var cta = 'Click here to Deposit the funds!';
                                var onclick = 'depositFunds(\''+escrowObj.id+'\',\''+amount+'\');';
                            } else if(escrowObj.initiatedBy == 'buyer' &&  escrowObj.buyer === currentAddr) {
                                var action = 'deposit needed';
                                var label = 'primary';
                                var cta = 'Click here to Deposit the funds!';
                                var onclick = 'depositFunds(\''+escrowObj.id+'\',\''+amount+'\');';
                            } else if (escrowObj.initiatedBy == 'buyer' &&  escrowObj.seller === currentAddr) {
                                var todo = 'The buyer must deposit the funds';
                            }
                        } else if (escrowObj.fundsDeposit == 1) {
                            if(escrowObj.initiatedBy == 'seller' && escrowObj.seller === currentAddr) {
                                var action = 'must be shipped';
                                var label = 'warning';
                                //var cta = 'Click here to Ship the product!';
                                //var onclick = 'ship(\''+escrowObj.id+'\');';
                                var canDispute = 1;
                                var canRefund = 1;
                                var canShip = 1;
                            } else if (escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) {
                                var todo = 'The seller must ship the item';
                            } else if(escrowObj.initiatedBy == 'buyer' &&  escrowObj.buyer === currentAddr) {
                                var todo = 'The seller must ship the item';
                                var canDispute = 1;
                            } else if (escrowObj.initiatedBy == 'buyer' &&  escrowObj.seller === currentAddr) {
                                var action = 'must be shipped';
                                var label = 'warning';
                                //var cta = 'Click here to Ship the product!';
                                //var onclick = 'ship(\''+escrowObj.id+'\');';
                                var canDispute = 1;
                                var canRefund = 1;
                                var canShip = 1;
                            }
                            
                        }
                    } else if(escrowObj.status == 2) {
                        var action = 'funds released';
                        var label = 'success';
                        var todo = 'The transaction has been completed';
                        
                    } else if(escrowObj.status == 3) {
                        var action = 'dispute';
                        var label = 'danger';
                        var todo = 'The transaction is being disputed';
                        
                    } else if(escrowObj.status == 4) {
                        var action = 'refunded';
                        var label = 'warning';
                        var todo = 'The transaction has been completed by being refunded';
                        
                    } else if(escrowObj.status == 5) {
                        var action = 'rejected';
                        var label = 'warning';
                        var todo = 'The transaction has been completed by being rejected';
                    } else if(escrowObj.status == 6) {
                        if(escrowObj.initiatedBy == 'seller' && escrowObj.seller === currentAddr) {
                            var todo = 'The buyer must accept the product and release the funds';
                            var canRefund = 1;
                        } else if (escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) {
                            var action = 'must be accepted';
                            var label = 'info';
                            var cta = 'Click here to release the funds!';
                            var onclick = 'releaseFunds(\''+escrowObj.id+'\');';
                        } else if(escrowObj.initiatedBy == 'buyer' &&  escrowObj.buyer === currentAddr) {
                            var action = 'must be accepted';
                            var label = 'info';
                            var cta = 'Click here to release the funds!';
                            var onclick = 'releaseFunds(\''+escrowObj.id+'\');';
                        } else if (escrowObj.initiatedBy == 'buyer' &&  escrowObj.seller === currentAddr) {
                            var todo = 'The buyer must accept the product and release the funds';
                            var canRefund = 1;
                        }
                        var canDispute = 1;
                    } else if(escrowObj.status == 7) {
                        if(escrowObj.buyer == currentAddr) {
                            var action = 'deposit needed';
                            var label = 'primary';
                            var cta = 'Click here to Deposit the funds!';
                            var onclick = 'depositFunds(\''+escrowObj.id+'\',\''+amount+'\');';
                            var canReject = 0;
                        } else if(escrowObj.seller == currentAddr) {
                            var todo = 'The buyer must deposit the funds';
                        }
                    }
                    
                    /*if( (escrowObj.status == 0 && escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) || 
                           (escrowObj.status == 0 && escrowObj.initiatedBy == 'buyer' && escrowObj.seller === currentAddr) ) {
                        var action = 'must be accepted';
                        var label = 'accept';
                        var cta = 'Click here to Accept the transaction!';
                        var onclick = '';
                    } else if( (escrowObj.status == 0 && escrowObj.initiatedBy == 'buyer' && escrowObj.seller === currentAddr) ||
                            (escrowObj.status == 0 && escrowObj.initiatedBy == 'seller' && escrowObj.buyer === currentAddr) ) {
                        var todo = 'The buyer must accept the transaction';
                    }

                    if(escrowObj.status == 1 && escrowObj.seller === currentAddr && escrowObj.fundsDeposit == 1) {
                        var action = 'must pe shipped';
                        var label = 'warning';
                        var cta = 'Click here to Ship the product!';
                        var onclick = '';
                    } else if(escrowObj.status == 1 && escrowObj.buyer === currentAddr && escrowObj.fundsDeposit == 1){
                        var todo = 'The seller must ship the product!';
                    }

                    if(escrowObj.status == 1 && escrowObj.buyer === currentAddr && escrowObj.fundsDeposit == 0) {
                        var action = 'funds must pe deposited';
                        var label = 'primary';
                        var cta = 'Click here to Deposit the funds!';
                        var onclick = '';
                    } else if (escrowObj.status == 1 && escrowObj.seller === currentAddr && escrowObj.fundsDeposit == 0) {
                        var todo = 'The buyer must deposit the funds!';
                    }

                    if(escrowObj.status == 7 && escrowObj.buyer === currentAddr && escrowObj.fundsDeposit == 0) {
                        var action = 'funds must pe deposited';
                        var label = 'primary';
                        var cta = 'Click here to Deposit the funds!';
                        var onclick = '';
                    } else if (escrowObj.status == 7 && escrowObj.seller === currentAddr && escrowObj.fundsDeposit == 0) {
                        var todo = 'The buyer must deposit the funds!';
                    }

                    if(escrowObj.status == 3) {
                        var action = 'disputed';
                        var label = 'danger';
                        var cta = 'Click here to Dispute the transaction!';
                        var onclick = '';
                    } 

                    if(escrowObj.status == 6 && escrowObj.buyer === currentAddr) {
                        var action = 'must release the funds';
                        var label = 'info';
                        var cta = 'Click here to Release the funds!';
                        var onclick = '';
                    } else if (escrowObj.status == 6 && escrowObj.seller === currentAddr) {
                        var todo = 'The buyer must release the funds!';
                    }*/
                    
                    if(action != undefined && action.length > 0) {
                        html += '<td style="text-align:center;" width="5%"><span class="label label-'+label+'">'+action+'</span></td>';
                    }
                    
                    if(escrowObj.fundsDeposit == 1) {
                        html += '<td style="text-align:center;" width="5%"><span class="label label-success">funds deposited</span></td>';
                    }

                  html += '</tr>';
              html += '</table>';
            html += '</h5>';
        html += '</div>';
        
        html += '<div id="'+escrowObj.id+'" class="panel-collapse collapse" style="background: #d1ded9">';
          html += '<div class="panel-body">';

              html += '<div class="row">';
                html += '<div class="col-lg-12  m-bot15">';
                  html += '<section class="panel panel-default">';
                    html += '<header class="panel-heading">';
                        var date = new Date(escrowObj.timestamp*1000);
                        html += 'Escrow transaction details <span class="pull-right">'+date+'</span>';
                    html += '</header>';
                    html += '<div class="panel-body">';

                        html += '<div class="form-group m-bot15">';
                          html += '<label class="col-sm-4 control-label">Seller</label>';
                          html += '<div class="col-sm-8">';
                          if(currentAddr === escrowObj.seller) {
                              html += '<a href="https://explorer.nebulas.io/#/address/'+escrowObj.seller+'" target="_blank"><span class="label label-success">'+escrowObj.seller+'</span></a>';
                          } else {
                              html += '<a href="https://explorer.nebulas.io/#/address/'+escrowObj.seller+'" target="_blank"><span class="label label-info">'+escrowObj.seller+'</span></a>';
                          }
                          html += '</div>';
                          html += '<div class="clearfix"></div>';
                        html += '</div>';
                        
                        html += '<div class="form-group m-bot15">';
                          html += '<label class="col-sm-4 control-label">Buyer</label>';
                          html += '<div class="col-sm-8">';
                            if(currentAddr === escrowObj.buyer) {
                              html += '<a href="https://explorer.nebulas.io/#/address/'+escrowObj.buyer+'" target="_blank"><span class="label label-success">'+escrowObj.buyer+'</span></a>';
                            } else {
                                html += '<a href="https://explorer.nebulas.io/#/address/'+escrowObj.buyer+'" target="_blank"><span class="label label-info">'+escrowObj.buyer+'</span></a>';
                            }
                              
                          html += '</div>';
                          html += '<div class="clearfix"></div>';
                        html += '</div>';

                        html += '<div class="form-group m-bot15">';
                          html += '<label class="col-sm-4 control-label">The initiator is the</label>';
                          html += '<div class="col-sm-8">';
                              html += escrowObj.initiatedBy;
                          html += '</div>';
                          html += '<div class="clearfix"></div>';
                        html += '</div>';

                         html += '<div class="form-group m-bot15">';
                          html += '<label class="col-sm-4 control-label">Seller Email address</label>';
                          html += '<div class="col-sm-8">';
                              html += escrowObj.sellerEmail;
                          html += '</div>';
                          html += '<div class="clearfix"></div>';
                        html += '</div>';

                          html += '<div class="form-group m-bot15">';
                          html += '<label class="col-sm-4 control-label">Buyer Email address</label>';
                          html += '<div class="col-sm-8">';
                            html += escrowObj.buyerEmail;
                          html += '</div>';
                          html += '<div class="clearfix"></div>';
                        html += '</div>';


                          html += '<div class="form-group">';
                              html += '<label class="col-sm-4 control-label">Transaction agreements</label>';
                              html += '<div class="col-lg-8">';
                                  html += escrowObj.notes;
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';


                    html += '</div>';
                  html += '</section>';

                html += '</div>';

                //if(cta != undefined && cta.length > 0) {
                    html += '<div class="col-lg-12  m-bot15">';
                        html += '<section class="panel panel-default">';
                          html += '<header class="panel-heading">';
                              html += 'Transaction status';
                          html += '</header>';
                          html += '<div class="panel-body">';
                            if(cta != undefined && cta.length > 0) {
                                html += '<a id="add-sticky" class="btn btn-'+label+' btn-lg" href="javascript:;" onclick="'+onclick+'">'+cta+'</a><br /><br />';
                            } else {
								if(todo != undefined && todo.length > 0) {
									html += todo + '<br /><br />';
								}
                            }
                            
                            if (canShip == 1) {
                                //var label = 'warning';
                                //var cta = 'Click here to Ship the product!';
                                //var onclick = 'ship(\''+escrowObj.id+'\');';
                                
                                html += '<a class="btn btn-warning  btn-lg" data-toggle="modal" href="#sp'+escrowObj.id+'">Click here to Ship the product!</a><br /><br />';
                                

                                html += '<div class="modal fade" id="sp'+escrowObj.id+'" tabindex="-1" role="dialog" aria-labelledby="spr'+escrowObj.id+'" aria-hidden="true">';
                                  html += '<div class="modal-dialog">';
                                    html += '<div class="modal-content">';
                                      html += '<div class="modal-header">';
                                        html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
                                        html += '<h4 class="modal-title">Shipping details</h4>';
                                      html += '</div>';
                                      html += '<div class="modal-body">';
                                      
                                      html += '<div class="form-group m-bot15">';
                                        html += '<label class="col-sm-2 control-label">Tracking No.:</label>';
                                        html += '<div class="col-sm-10">';
                                            html += '<input name="tracking" id="tracking'+escrowObj.id+'" class="form-control input-lg" placeholder="DHL, UPS, FedEx or other tracking number" type="text">';
                                        html += '</div>';
                                        html += '<div class="clearfix"></div>';
                                      html += '</div>';

                                        html += '<div class="form-group m-bot15">';
                                        html += '<label class="col-sm-2 control-label">Shipping Operator:</label>';
                                        html += '<div class="col-sm-10">';
                                            html += '<input name="operator" id="operator'+escrowObj.id+'" class="form-control input-lg" placeholder="Shipping method" type="text">';
                                        html += '</div>';
                                        html += '<div class="clearfix"></div>';
                                      html += '</div>';

                                        html += '<div class="form-group m-bot15">';
                                        html += '<label class="col-sm-2 control-label">Other info:</label>';
                                        html += '<div class="col-sm-10">';
                                            html += '<input name="info" id="info'+escrowObj.id+'" class="form-control input-lg" placeholder="Other information" type="text">';
                                        html += '</div>';
                                        html += '<div class="clearfix"></div>';
                                      html += '</div>';
                              
                                      html += '</div>';
                                      html += '<div class="modal-footer">';
                                        html += '<button class="btn btn-success" type="button" onclick="ship(\''+escrowObj.id+'\',$(\'#tracking'+escrowObj.id+'\').val(),$(\'#operator'+escrowObj.id+'\').val(),$(\'#info'+escrowObj.id+'\').val());">Set the transaction as shipped</button>';
                                        html += '<button data-dismiss="modal" class="btn btn-default" type="button">Close</button>';
                                      html += '</div>';
                                    html += '</div>';
                                  html += '</div>';
                                html += '</div>';
                            }
                            
                            if(canRefund == 1) {
                                html += '<a id="add-sticky" class="btn btn-info btn-lg" href="javascript:;" onclick="refundEscrow(\''+escrowObj.id+'\');">Refund transaction</a><br /><br />';    
                            }
                            if(canReject == 1) {
                                html += '<a id="add-gritter-light" class="btn btn-warning  btn-lg" href="javascript:;" onclick="rejectEscrow(\''+escrowObj.id+'\');">Reject the transaction</a><br /><br />';
                            }
                            
                            
                            if(canDispute == 1) {
                                
                                html += '<a id="remove-all" class="btn btn-danger  btn-lg" data-toggle="modal" href="#dp'+escrowObj.id+'">Click here to Dispute the transaction</a><br /><br />';
                                

                                html += '<div class="modal fade" id="dp'+escrowObj.id+'" tabindex="-1" role="dialog" aria-labelledby="dpr'+escrowObj.id+'" aria-hidden="true">';
                                  html += '<div class="modal-dialog">';
                                    html += '<div class="modal-content">';
                                      html += '<div class="modal-header">';
                                        html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
                                        html += '<h4 class="modal-title">Dispute reason</h4>';
                                      html += '</div>';
                                      html += '<div class="modal-body"><textarea id="disputeReason'+escrowObj.id+'" name="notes" class="col-lg-12 input-lg form-control"></textarea></div>';
                                      html += '<div class="modal-footer">';
                                        html += '<button class="btn btn-success" type="button" onclick="initiateDispute(\''+escrowObj.id+'\',$(\'#disputeReason'+escrowObj.id+'\').val());">Start dispute</button>';
                                        html += '<button data-dismiss="modal" class="btn btn-default" type="button">Close</button>';
                                      html += '</div>';
                                    html += '</div>';
                                  html += '</div>';
                                html += '</div>';
                                
                            }
                              //html += '<a id="add-sticky" class="btn btn-info btn-lg" href="javascript:;" onclick="acceptTransaction();">Click here to Release the funds!</a>';
                              //html += '<a id="add-gritter-light" class="btn btn-warning  btn-lg" href="javascript:;">Click here to Ship the product</a>';

                              //html += '<a id="add-sticky" class="btn btn-primary btn-lg" href="javascript:;" onclick="acceptTransaction();">Click here to Deposit the funds!</a>';
                              //html += '<a id="remove-all" class="btn btn-danger  btn-lg" href="#">Click here to Dispute the transaction</a>';

                          html += '</div>';
                        html += '</section>';

                    html += '</div>';
                //}

                   html += '<div class="col-lg-6">';
                      html += '<section class="panel panel-default">';
                        html += '<header class="panel-heading">';
                          html += 'Product details';
                        html += '</header>';
                        html += '<div class="panel-body">';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Title</label>';
                              html += '<div class="col-sm-8">';
                                html += escrowObj.title;
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Price</label>';
                              html += '<div class="col-sm-8">';
                                html += '<span class="label label-primary">'+escrowObj.price+' NAS</span>';
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';



                             html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Type</label>';
                              html += '<div class="col-sm-8">';
                                  html += escrowObj.product.type;
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Description</label>';
                              html += '<div class="col-sm-8">'+escrowObj.product.description+'</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';
                            
                            if(escrowObj.product.type == 'vehicle') {
                                html += '<div id="vehicleType">';

                                  html += '<div class="form-group m-bot15">';
                                    html += '<label class="col-sm-4 control-label">Odometer</label>';
                                    html += '<div class="col-sm-8">';
                                      html += escrowObj.product.odometer;
                                    html += '</div>';
                                    html += '<div class="clearfix"></div>';
                                  html += '</div>';

                                   html += '<div class="form-group m-bot15">';
                                    html += '<label class="col-sm-4 control-label">VIN</label>';
                                    html += '<div class="col-sm-8">';
                                      html += escrowObj.product.vin;
                                    html += '</div>';
                                    html += '<div class="clearfix"></div>';
                                  html += '</div> ';

                                    html += '<div class="form-group m-bot15">';
                                      html += '<label class="control-label col-sm-4">Manufacturing date</label>';
                                      html += '<div class="col-sm-8">';
                                        html += escrowObj.product.manDate;
                                      html += '</div>';
                                      html += '<div class="clearfix"></div>';
                                   html += ' </div>';


                                    html += '<div class="form-group m-bot15">';
                                    html += '<label class="col-sm-4 control-label">Model</label>';
                                    html += '<div class="col-sm-8">';
                                      html += escrowObj.product.model;
                                    html += '</div>';
                                    html += '<div class="clearfix"></div>';
                                  html += '</div>';

                                    html += '<div class="form-group m-bot15">';
                                    html += '<label class="col-sm-4 control-label">Make</label>';
                                    html += '<div class="col-sm-8">';
                                      html += escrowObj.product.make;
                                    html += '</div>';
                                    html += '<div class="clearfix"></div>';
                                  html += '</div>';
                                html += '</div>';
                            }

                        html += '</div>';
                      html += '</section>';

                  html += '</div>';




                  html += '<div class="col-lg-6">';
                      html += '<section class="panel panel-default">';
                        html += '<header class="panel-heading">';
                          html += 'Shipping details';
                        html += '</header>';
                        html += '<div class="panel-body">';

                             html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Who pays the shipping</label>';
                              html += '<div class="col-sm-8">';
                                  html += escrowObj.shipping.whoPays;
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Shipping cost</label>';
                              html += '<div class="col-sm-8">';
                                html += '<span class="label label-primary">'+escrowObj.shipping.cost+' NAS</span>';
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Inspection period</label>';
                              html += '<div class="col-sm-8">';
                                html += ''+escrowObj.inspectionPeriod+' days';
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            if(escrowObj.shipping.address != undefined && escrowObj.shipping.address.length > 0) {
                                html += '<div class="form-group m-bot15" id="shippingAddress">';
                                  html += '<label class="col-sm-4 control-label">Shipping address</label>';
                                  html += '<div class="col-sm-8">'+escrowObj.shipping.address+'';
                                  html += '</div>';
                                  html += '<div class="clearfix"></div>';
                                html += '</div>';
                            }

                            if(escrowObj.shipping.trackingNumber != undefined && escrowObj.shipping.trackingNumber.length > 0) {
                                html += '<div class="form-group m-bot15" id="shippingAddress">';
                                  html += '<label class="col-sm-4 control-label">Tracking number</label>';
                                  html += '<div class="col-sm-8">'+escrowObj.shipping.trackingNumber+'';
                                  html += '</div>';
                                  html += '<div class="clearfix"></div>';
                                html += '</div>';
                            }
                            
                            if(escrowObj.shipping.operator != undefined && escrowObj.shipping.operator.length > 0) {
                                html += '<div class="form-group m-bot15" id="shippingAddress">';
                                  html += '<label class="col-sm-4 control-label">Shipping operator</label>';
                                  html += '<div class="col-sm-8">'+escrowObj.shipping.operator+'';
                                  html += '</div>';
                                  html += '<div class="clearfix"></div>';
                                html += '</div>';
                            }

                            if(escrowObj.shipping.info != undefined && escrowObj.shipping.info.length > 0) {
                                html += '<div class="form-group m-bot15" id="shippingAddress">';
                                  html += '<label class="col-sm-4 control-label">Other info</label>';
                                  html += '<div class="col-sm-8">'+escrowObj.shipping.info+'';
                                  html += '</div>';
                                  html += '<div class="clearfix"></div>';
                                html += '</div>';
                            }

                        html += '</div>';
                      html += '</section>';

                  html += '</div>';

                  html += '<div class="clearfix m-bot15"></div>';
                  
                  if(escrowObj.status == 3) {
                    html += '<div class="col-lg-12  m-bot15">';
                      html += '<section class="panel panel-default">';
                        html += '<header class="panel-heading">';
                            html += 'Dispute';
                        html += '</header>';
                        html += '<div class="panel-body">';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Who initiated the dispute</label>';
                              html += '<div class="col-sm-8">';
                                  html += '<a href="https://explorer.nebulas.io/#/address/'+escrowObj.whoInitiatedDispute+'" target="_blank"><span class="label label-info">'+escrowObj.whoInitiatedDispute+'</span></a>';
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                            html += '<div class="form-group m-bot15">';
                              html += '<label class="col-sm-4 control-label">Dispute comments</label>';
                              html += '<div class="col-sm-8">';
                                  html += escrowObj.disputeComments;
                              html += '</div>';
                              html += '<div class="clearfix"></div>';
                            html += '</div>';

                        html += '</div>';
                      html += '</section>';

                    html += '</div>';
                }

              html += '</div>';


                html += '<div class="row">';
                
                  html += '<div class="col-lg-6 portlets">';
                    html += '<div class="panel panel-default">';
                      html += '<div class="panel-heading">';
                        html += '<div class="pull-left">Messages</div>';
                        html += '<div class="clearfix"></div>';
                      html += '</div>';

                      html += '<div class="panel-body">';
                        html += '<div class="padd scroll">';
                        if(escrowObj.messages.length == 0) {
                            html += '<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No new message at this time.</div>';
                        } else {

                            html += '<ul class="chats" id="">';
							if(escrowObj.messages != undefined && escrowObj.messages.length > 0 )
								escrowObj.messages = escrowObj.messages.reverse();
                            
                            for(var j = 0; j < escrowObj.messages.length; j++) {
                                var hash = escrowObj.messages[j].who;
                                var data = new Identicon(hash).toString();
                                
                                if(escrowObj.messages[j].who === currentAddr) {
                                    html += '<li class="by-other">';
                                    html += '<div class="avatar pull-right">';
                                } else {
                                    html += '<li class="by-me">';
                                    html += '<div class="avatar pull-left">';
                                }
                                
                                
                                  html += '<img width="45" src="data:image/png;base64,' + data + '">';
                                html += '</div>';

                                html += '<div class="chat-content">';
                                  html += '<div class="chat-meta">' + escrowObj.title + '<span class="pull-right">'+escrowObj.messages[j].when+'</span></div>';
                                  html += escrowObj.messages[j].message;
                                  html += '<div class="clearfix"></div>';
                                html += '</div>';
                              html += '</li>';
                            }   
                                
                                
                            html += '</ul>';
                        }
                        html += '</div>';
                      html += '</div>';


                    html += '</div>';
                  html += '</div>';

                  html += '<div class="col-lg-6">';
                    html += '<section class="panel panel-default">';
                      html += '<div class="panel-heading">';
                        html += '<div class="row">';
                          html += '<div class="col-lg-8 task-progress pull-left">';
                            html += 'History';
                          html += '</div>';

                        html += '</div>';
                      html += '</div>';
                      
                      
                      if(escrowObj.history.length > 0) {
                        html += '<table class="table table-hover personal-task">';
                        html += '<tbody id="latestTransactions1">';                      
                        
						if(escrowObj.history.length > 0) 
							escrowObj.history = escrowObj.history.reverse();

                        for(var j = 0 ; j < escrowObj.history.length; j++) {


                            var history = '';


                            history += '<tr>';
                            history += '<td style="border-left: 1px solid #ccc;">' + escrowObj.history[j].when + '</td>';
                            history += '<td>';
                              history += escrowObj.history[j].action;
                            history += '</td>';
                            history += '<td>';


                            if(escrowObj.history[j].tag == "init") {
                              history += '<span class="badge bg-info">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "dispute") {
                              history += '<span class="badge bg-warning">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "msg") {
                              history += '<span class="badge bg-info">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "reject") {
                              history += '<span class="badge bg-inverse">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "accept") {
                              history += '<span class="badge bg-primary">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "deposit") {
                              history += '<span class="badge bg-important">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "refund") {
                              history += '<span class="badge bg-primary">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "shipping") {
                              history += '<span class="badge bg-primary">' + escrowObj.history[j].tag + '</span>';
                            } else if(escrowObj.history[j].tag == "fund-release") {
                              history += '<span class="badge bg-success">' + escrowObj.history[j].tag + '</span>';
                            } 

                            history += '</td>';
                            history += '<td style="border-right: 1px solid #ccc;">';

                            var hash = escrowObj.history[j].who;
                            var data = new Identicon(hash).toString();


                            history += '<span class="profile-ava">';
                            history += '<img width="30" src="data:image/png;base64,' + data + '">';
                            history += '</span>';

                            history += '</td>';
                            history += '</tr>';
                            html += history;
                        }
                        
                        html += '</tbody>';
                        html += '</table>';
                    } else {
                        html += '<div class="panel-body"><div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No transaction history.</div></div>';
                    }
                      
                      
                      
                      
                      
                    html += '</section>';
                  html += '</div>';
                  
                html += '</div><!--row-->';
                
           html += '</div>';
         html += '</div>';
       html += '</div>';
       return html;
}


function getAllMessages() {
    
    //Refresh data
    updateData();
    
    var escrows = JSON.parse(localStorage.getItem("escrows"));
	if(escrows != undefined && escrows.length > 0)
		escrows = escrows.reverse();
    
    
    
}



function getAllEscrows() {
    
    //Refresh data
    updateData();
    
    
    
}

function markAsReadListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    //alert(receipt.execute_result);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    
                    toggleLoading();
                    clearInterval(txTimer);
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}

function markAsRead(escrowHash, messageHash, element) {
    var args = "[\"" + escrowHash +"\",\"" + messageHash +"\"]";
    serialNumber = nebPay.call(dapp, 0, "markMessageAsRead", args, {
        qrcode: {
            showQRCode: false
        },
        listener: markAsReadListener
    });
    $(element).parent().parent().parent().parent().parent().find('.read0').removeClass('read0').addClass('read1');
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
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                if(receipt.execute_result != '') {
                    clearInterval(txTimer);
                    localStorage.setItem("currentAddr", receipt.from);
					console.log(receipt);
					
					
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
                    localStorage.setItem("currentAddr", receipt.from);
                    updateData();
                    $(window).scrollTop(0);
                    clearInterval(txTimer);
                    
                    
                    var to = '';
                    
                    if ($("input[name=initiator]").val() === 'seller') {
                        to = $("input[name=buyerEmail]").val();
                    } else {
                        to = $("input[name=sellerEmail]").val();
                    }
                    
                    notifyEmail(
                        "New nas-escrow transaction!", 
                        "Click here to accept it!", 
                        to, 
                        "New nas-escrow transaction", 
                        "You have a new escrow transaction initiated by: <br /><br /><b>" + receipt.from + "</b><br />", 
                        $("input[name=title]").val() + " - " + $("textarea[name=notes]").val()
                    );
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
                    
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "Nas-escrow new message!", 
                                "Get to dashboard and read it!", 
                                to, 
                                "Nas-escrow new message!", 
                                "You have a new escrow message initiated by: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                "<strong>Message: </strong>" + $('#messageContent').val()
                            );
                    
                            break;
                        }
                    }
                    
                    
                    
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
    
    if (initiator === 'seller') {
        var tmp = sellerEmail;
        sellerEmail = buyerEmail;
        buyerEmail = tmp;
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
    $("#escrowId").val(id);
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


/*function updateData() {
    serialNumber = nebPay.simulateCall(dapp, 0, "getEscrows", "", {
        qrcode: {
            showQRCode: false
        },
        listener: getEscrowsListener
    });
}*/

function updateData() {

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
	
    var contract = {
        "function": 'getEscrows',
        "args": "[]"
    }
	
    neb.api.call(localStorage.getItem('currentAddr'), dapp, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        if(resp.result)
		{
			var currentAddr = localStorage.getItem("currentAddr");
			
			
			var escrows = JSON.parse(resp.result);
			
			
			console.log(escrows);
			console.log(currentAddr);
			
			var notAllowed = false;
			for (var i = 0; i < escrows.length; i++) {
				if(escrows[i].seller != currentAddr && escrows[i].buyer != currentAddr) {
					notAllowed = true;
				}
			}
			toggleLoading();
			if(escrows.length == 0) {
				$("#errors").html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No escrow transactions at this time, click the Initiate Escrow from the menu to start a new one.</div>');
				populateData();
				return false;
			}
			if(notAllowed === false) {
				localStorage.setItem("escrows", JSON.stringify(escrows));
				populateData();
				var escrows = JSON.parse(localStorage.getItem("escrows"));
				if(escrows != undefined && escrows.length > 0)
					escrows = escrows.reverse();
				
				//update escrows page
				$("#accordion").html('');
				if($("#accordion") !== undefined) {
					if(escrows.length > 0) {
						for(var i = 0; i < escrows.length; i++) {
							$("#accordion").append(generateEscrowHtml(escrows[i]));
						}
					} else {
						$("#errors").html('<div class="alert alert-info fade in"><button data-dismiss="alert" class="close close-sm" type="button"><i class="icon-remove"></i></button>No escrow transactions at this time.</div>');
					}
				}
				
			} else {
				localStorage.removeItem("escrows");
				alert("Current address has escrows which he is not allowed to.")
			}
		}
    }).catch(function (err) {
		toggleLoading();
		alert(err + " - Please refresh the page");
    })
}






function initCalendar() {
    
    var escrows = JSON.parse(localStorage.getItem("escrows"));
	$('#calendar').html('');
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



function acceptEscrow(escrowHash, amount) {
    $("#escrowId").val(escrowHash);
    var args = "[\"" + addslashes(escrowHash) +"\"]";

    serialNumber = nebPay.call(dapp, amount, "acceptEscrow", args, {
        qrcode: {
            showQRCode: false
        },
        listener: acceptEscrowListener
    });
}


function acceptEscrowListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">Escrow has been accepted</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "Your escrow transaction has been accepted!", 
                                "Get to dashboard to view details!", 
                                to, 
                                "Accepted escrow transaction", 
                                "Your escrow transaction has been accepted: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                ""
                            );
                    
                            break;
                        }
                    }
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}




function rejectEscrow(escrowHash) {
    $("#escrowId").val(escrowHash);
    var args = "[\"" + addslashes(escrowHash) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "rejectEscrow", args, {
        qrcode: {
            showQRCode: false
        },
        listener: rejectEscrowListener
    });
}


function rejectEscrowListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">Escrow has been rejected</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "Rejected escrow transaction", 
                                "Get to dashboard", 
                                to, 
                                "Rejected escrow transaction", 
                                "Your escrow transaction has been rejected by: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                ""
                            );
                    
                            break;
                        }
                    }
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}




function depositFunds(escrowHash, amount) {
    
    var args = "[\"" + addslashes(escrowHash) +"\"]";

    serialNumber = nebPay.call(dapp, amount, "depositFunds", args, {
        qrcode: {
            showQRCode: false
        },
        listener: depositFundsListener
    });
}


function depositFundsListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">The funds have been deposited</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}



function ship(escrowHash, tracking, operator, info) {
    
    $("#escrowId").val(escrowHash);
    
    var args = "[\"" + addslashes(escrowHash) +"\",\"" + addslashes(tracking) +"\",\"" + addslashes(operator) +"\",\"" + addslashes(info) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "ship", args, {
        qrcode: {
            showQRCode: false
        },
        listener: shipListener
    });
}


function shipListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">The product has been shipped</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "The products have been shipped/delivered", 
                                "Get to dashboard to view details!", 
                                to, 
                                "Delievered escrow transaction", 
                                "The products have been shipped/delivered by: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                ""
                            );
                    
                            break;
                        }
                    }
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}



function initiateDispute(escrowHash, reason) {
    $("#escrowId").val(escrowHash);
    var args = "[\"" + addslashes(escrowHash) +"\",\"" + addslashes(reason) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "initiateDispute", args, {
        qrcode: {
            showQRCode: false
        },
        listener: initiateDisputeListener
    });
}


function initiateDisputeListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">The dispute has been initiated</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "Disputed escrow transaction", 
                                "Get to dashboard", 
                                to, 
                                "Dispute initiation", 
                                "Your escrow transaction has been disputed by: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                "<strong>Reason: </strong>" + $('#disputeReason'+escrowId).val()
                            );
                    
                            break;
                        }
                    }
                    
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}



function refundEscrow(escrowHash) {
    
    $("#escrowId").val(escrowHash);
    
    var args = "[\"" + addslashes(escrowHash) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "refund", args, {
        qrcode: {
            showQRCode: false
        },
        listener: refundEscrowListener
    });
}


function refundEscrowListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">The escrow has been refunded</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "The escrow transaction has been refunded", 
                                "Get to dashboard to view details!", 
                                to, 
                                "Refunded escrow transaction", 
                                "Your escrow transaction has been refunded: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                ""
                            );
                    
                            break;
                        }
                    }
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}



function releaseFunds(escrowHash) {
    
    $("#escrowId").val(escrowHash);
    
    var args = "[\"" + addslashes(escrowHash) +"\"]";

    serialNumber = nebPay.call(dapp, 0, "releaseFunds", args, {
        qrcode: {
            showQRCode: false
        },
        listener: releaseFundsListener
    });
}


function releaseFundsListener(resp) {
    toggleLoading();
    if(resp == "Error: Transaction rejected by user") {
        toggleLoading();
        return false;
    }
    
    if(resp !== null && resp.txhash !== null)
    {   
        clearInterval(txTimer);

        txTimer = setInterval(function() {
            
            neb.api.getTransactionReceipt({hash: resp.txhash}).then(function(receipt) {
                console.log(receipt);
                console.log(receipt.execute_result);
                if(receipt.execute_result.indexOf("Error") !== -1) {
                    $("#errors").html('<div class="alert alert-block alert-danger fade in">' + receipt.execute_result + '</div>');
                    $(window).scrollTop(0);
                    toggleLoading();
                    clearInterval(txTimer);
                } else if(receipt.execute_result != "") {
                    $("#errors").html('<div class="alert alert-block alert-success fade in">The funds have been released and the transaction has been completed!</div>');
                    $(window).scrollTop(0);
                    updateData();
                    clearInterval(txTimer);
                    
                    var escrowId = $("#escrowId").val();
                    var escrows = JSON.parse(localStorage.getItem('escrows'));
                    
                    for (var i=0; i < escrows.length; i++) {
                        if(escrows[i].id === escrowId) {
                            var to = '';
                            
                            var currentEscrow = escrows[i];
                            if(receipt.from == currentEscrow.sellerEmail) {
                                to = currentEscrow.buyerEmail;
                            } else { 
                                to = currentEscrow.sellerEmail;
                            }
                            
                            console.log(to);
                            
                            notifyEmail(
                                "Congratulations, the funds have been released!", 
                                "Get to dashboard to view details!", 
                                to, 
                                "Released escrow transaction", 
                                "Your escrow transaction has been completed and the funds have been credited to your account by: <br /><br /> <b>" + receipt.from + "</b><br />", 
                                ""
                            );
                    
                            break;
                        }
                    }
                }
            }); 
        }, 1000);
    } else {
        alert("Could not find transaction");
    }
}


function notify(escrow, action, who) {
    var data = JSON.stringify(escrow);
    $.ajax({
        type: "POST",
        url: "notify.php",
        data: {"data": data, "action" : action, "who" : who},
        success: function(data) {
            if (data.response == "success") {
                // if api.php returns success, redirect to homepage
            } else {
                // if api.php returns failure, display error
            }  
        },
        error: function(jqXHR, textStatus, errorThrown, data) {
            //error handling
        },
        dataType: "json"
    });
}


function updateWalletAddress(callback) {
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");

    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) 
		{
            if (e.data.data.account) {
				localStorage.setItem("currentAddr", e.data.data.account);
				
                callback();

            }else{
            }
        }else{
        }
    });
}



function notifyEmail(subject, cta, to, preheader, content, description) {
    $.ajax({
        type: 'POST',
        url: 'notify.php',
        headers: {
            "CsrfToken" : $("#csrfToken").val(),
        },
        data: {
            cta: cta, 
            to: to,
            preheader: preheader,
            content: content,
            description: description,
            subject: subject
        }
    }).done(function(data) { 
        console.log(data);
    });
}