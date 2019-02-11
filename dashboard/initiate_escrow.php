<?php require_once 'csrf.php'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Creative - Bootstrap 3 Responsive Admin Template">
  <meta name="author" content="GeeksLabs">
  <meta name="keyword" content="Creative, Dashboard, Admin, Template, Theme, Bootstrap, Responsive, Retina, Minimal">
  <link rel="shortcut icon" href="img/favicon.png">

  <title>Azanian Escrow dashboard - Initiate the transaction</title>

  <!-- Bootstrap CSS -->
  <link href="css/bootstrap.min.css" rel="stylesheet">
  <!-- bootstrap theme -->
  <link href="css/bootstrap-theme.css" rel="stylesheet">
  <!--external css-->
  <!-- font icon -->
  <link href="css/elegant-icons-style.css" rel="stylesheet" />
  <link href="css/font-awesome.min.css" rel="stylesheet" />
  <!-- full calendar css-->
  <link href="assets/fullcalendar/fullcalendar/bootstrap-fullcalendar.css" rel="stylesheet" />
  <link href="assets/fullcalendar/fullcalendar/fullcalendar.css" rel="stylesheet" />
  <link href="css/elegant-icons-style.css" rel="stylesheet" />
  <link href="css/font-awesome.min.css" rel="stylesheet" />
  <link href="css/daterangepicker.css" rel="stylesheet" />
  <link href="css/bootstrap-datepicker.css" rel="stylesheet" />
  <link href="css/bootstrap-colorpicker.css" rel="stylesheet" />
  <!-- easy pie chart-->
  <link href="assets/jquery-easy-pie-chart/jquery.easy-pie-chart.css" rel="stylesheet" type="text/css" media="screen" />
  <!-- owl carousel -->
  <link rel="stylesheet" href="css/owl.carousel.css" type="text/css">
  <link href="css/jquery-jvectormap-1.2.2.css" rel="stylesheet">
  <!-- Custom styles -->
  <link rel="stylesheet" href="css/fullcalendar.css">
  <link href="css/widgets.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
  <link href="css/style-responsive.css" rel="stylesheet" />
  <link href="css/xcharts.min.css" rel=" stylesheet">
  <link href="css/jquery-ui-1.10.4.min.css" rel="stylesheet">
  <!-- =======================================================
    Theme Name: NiceAdmin
    Theme URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
    Author: BootstrapMade
    Author URL: https://bootstrapmade.com
  ======================================================= -->
</head>

<body>
    <input type="hidden" id="csrfToken" value="<?php echo $_SESSION['csrf_token']; ?>" />
    <input type="hidden" id="escrowId" value="" />
  <!-- container section start -->
  <section id="container" class="">
	<input type="hidden" name="addr" value="" id="txAddr" />


    <header class="header dark-bg">
      <div class="toggle-nav">
        <div class="icon-reorder tooltips" data-original-title="Toggle Navigation" data-placement="bottom"><i class="icon_menu"></i></div>
      </div>

      <!--logo start-->
      <a href="index.php" class="logo">Azania ESCROW <span class="lite">Control Panel</span></a>
      <!--logo end-->

      <!--<div class="nav search-row" id="top_menu">
        <ul class="nav top-menu">
          <li>
            <form class="navbar-form">
              <input class="form-control" placeholder="Search" type="text">
            </form>
          </li>
        </ul>
      </div>-->

      <div class="top-nav notification-row">
        <!-- notificatoin dropdown start-->
        <ul class="nav pull-right top-menu">

          <!-- task notificatoin start -->
          <li id="task_notificatoin_bar" class="dropdown">
            <a data-toggle="dropdown" class="dropdown-toggle" href="#">
                            <i class="icon-task-l"></i>
                            <span class="badge bg-important" id="pendingEscrows"></span>
                        </a>
            <ul class="dropdown-menu extended tasks-bar">
              <div class="notify-arrow notify-arrow-blue"></div>
              <li>
                  <p class="blue" id="pendingEscrowsHeader">You have no pending escrows</p>
              </li>
              
              <li class="external">
                <a href="escrows.php">See All Escrows</a>
              </li>
            </ul>
          </li>
          <!-- task notificatoin end -->
          <!-- inbox notificatoin start-->
          <li id="mail_notificatoin_bar" class="dropdown">
            <a data-toggle="dropdown" class="dropdown-toggle" href="#">
                            <i class="icon-envelope-l"></i>
                            <span class="badge bg-important" id="unreadMessages"></span>
                        </a>
            <ul class="dropdown-menu extended inbox">
              <div class="notify-arrow notify-arrow-blue"></div>
              <li>
                <p class="blue" id="messagesDropdownHeader">You have no new messages</p>
              </li>
              
              <li>
                <a href="messages.php">See all messages</a>
              </li>
            </ul>
          </li>
          <!-- inbox notificatoin end -->
          
          
          <!-- user login dropdown start-->
          <li class="dropdown">
            <a data-toggle="dropdown" class="dropdown-toggle" href="#">
                            <span class="profile-ava" id="profileAvatar">
                            </span>
                            <span class="username"></span>
                            <b class="caret"></b>
                        </a>
            <ul class="dropdown-menu extended logout">
              <div class="log-arrow-up"></div>
              <li>
                <a href="messages.php"><i class="icon_mail_alt"></i> Messages</a>
              </li>
              <li>
                <a href="escrows.php"><i class="icon_clock_alt"></i> Escrows</a>
              </li>
              <!--<li>
                  <a href="javascript:void(0);" onclick="logout();"><i class="icon_key_alt"></i> Log Out</a>
              </li>
              <li>
                <a  href="javascript:void(0);" onclick="login();"><i class="icon_key_alt"></i> Update info</a>
              </li>-->
            </ul>
          </li>
          <!-- user login dropdown end -->
        </ul>
        <!-- notificatoin dropdown end-->
      </div>
    </header>
    <!--header end-->

    <!--sidebar start-->
    <aside>
      <div id="sidebar" class="nav-collapse ">
        <!-- sidebar menu start-->
        <ul class="sidebar-menu">
          <li>
            <a class="" href="index.php">
                          <i class="icon_house_alt"></i>
                          <span>Dashboard</span>
                      </a>
          </li>
          <li>
              <a class=""  href="escrows.php">
                    <i class="icon_documents_alt"></i>
                    <span>Escrows</span>
                </a>
          </li>
          <li class="sub-menu">
            <a href="javascript:;" class="">
                          <i class="icon_pencil"></i>
                          <span>Messages</span>
                          <span class="menu-arrow arrow_carrot-right"></span>
                      </a>
            <ul class="sub">
              <li><a class="" href="add_message.php">Write one</a></li>
              <li><a class="" href="messages.php">View All</a></li>
            </ul>
          </li>
          <li class="active">
            <a class="" href="initiate_escrow.php">
                          <i class="icon_genius"></i>
                          <span>Initiate escrow</span>
                      </a>
          </li>
          <!--<li>
              <a class="" onclick="login();" href="javascript:void(0);">
                    <i class="icon_lock"></i>
                    <span>Login NAS</span>
                </a>
          </li>-->
          


        

        </ul>
        <!-- sidebar menu end-->
      </div>
    </aside>
    <!--sidebar end-->
    
    
    <div class="loading" style="display:none;" id="loading">Loading&#8230;</div>

    <!--main content start-->
    <section id="main-content">
      <section class="wrapper">
        <!--overview start-->
        <div class="row">
          <div class="col-lg-12">
            <h3 class="page-header">Escrow transaction</h3>
            <ol class="breadcrumb">
              <li><i class="fa fa-home"></i><a href="index.php">Home</a></li>
              <li><i class="fa fa-file-text-o"></i>Initiate escrow transaction</li>
            </ol>
          </div>
        </div>
        
        <form action="" method="GET" id="escrow" autocomplete="off">
        <div class="row">
          <div class="col-lg-12">
            <section class="panel">
              <header class="panel-heading">
                Start your product escrow
              </header>
              <div class="panel-body">
                
                  <div id="errors">
                      
                  </div>
                  
                <div class="alert alert-block alert-danger fade in" id="extensionAlert" style="display:none;">
                  In order to interact with Nebulas blockchain you have to install Nebulas extension wallet: <a style="font-weight: bold;" href="https://chrome.google.com/webstore/detail/nasextwallet/gehjkhmhclgnkkhpfamakecfgakkfkco" target="_blank">HERE</a>
                </div>
                  
                    
                    <div class="form-group m-bot15">
                    <label class="col-sm-2 control-label">Are you the buyer or the seller?</label>
                    <div class="col-sm-10">
                        <select name="initiator" class="form-control input-lg" onchange="$('#shippingAddress').toggle();">
                            <option value="seller">Seller</option>
                            <option value="buyer">Buyer</option>
                        </select>
                    </div>
                    <div class="clearfix"></div>
                  </div>
                    
                    <div class="form-group m-bot15">
                    <label class="col-sm-2 control-label">Other party NAS address</label>
                    <div class="col-sm-10">
                        <input name="addr" class="form-control input-lg" placeholder="Eg.: n1TRnZdXE7uy5FD5CNZu66EZf1rXaQcaUrG" type="text">
                      <span class="help-block">The other party Nebulas wallet address, not yours. Please make sure the NAS address is the correct one</span>
                    </div>
                    <div class="clearfix"></div>
                  </div>
                    
                    <div class="form-group m-bot15">
                    <label class="col-sm-2 control-label">Your Email</label>
                    <div class="col-sm-10">
                        <input name="buyerEmail" class="form-control input-lg" placeholder="Eg.: email@email.com" type="email">
                      <span class="help-block">The email address is used to notify in case of transaction status change</span>
                    </div>
                    <div class="clearfix"></div>
                  </div>
                    
                    <div class="form-group m-bot15">
                    <label class="col-sm-2 control-label">Other party Email</label>
                    <div class="col-sm-10">
                      <input name="sellerEmail" class="form-control input-lg" placeholder="Eg.: email@email.com" type="email">
                      <span class="help-block">The other party email address. It is used to notify the buyer/seller</span>
                    </div>
                    <div class="clearfix"></div>
                  </div>
                    
                    
                    <div class="form-group">
                        <label class="col-sm-2 control-label">Transaction agreements</label>
                        <div class="col-lg-10">
                          <textarea name="notes" class="col-lg-12 input-lg form-control"></textarea>
                          <span class="help-block">Please provide an accurate description of the escrow transaction. This will be checked and agreed before releasing the funds.</span>
                        </div>
                      </div>
                    
                    
              </div>
            </section>
              
          </div>
            
             <div class="col-lg-12">
                <section class="panel">
                  <header class="panel-heading">
                    Product details
                  </header>
                  <div class="panel-body">

                        <div class="form-group">
                        <label class="col-sm-2 control-label">Title</label>
                        <div class="col-sm-10">
                          <input name="title" class="form-control input-lg m-bot15" placeholder="What are you buying/selling?" type="text">
                        </div>
                      </div>

                    <div class="form-group">
                        <label class="col-sm-2 control-label">Price</label>
                        <div class="col-sm-10">
                          <input name="price" class="form-control input-lg m-bot15" placeholder="The product price in NAS" type="number">
                        </div>
                      </div>
                      
                      
                      
                       <div class="form-group m-bot15">
                        <label class="col-sm-2 control-label">Type</label>
                        <div class="col-sm-10">
                            <select name="productType" class="form-control input-lg" onchange="changeProductType(this);">
                                
                                <option value="other">Other</option>
                                <option value="vehicle" hidden="true">Motor-Vehicle</option>
                            </select>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <div class="form-group m-bot15">
                        <label class="col-sm-2 control-label">Description</label>
                        <div class="col-sm-10">
                          <input name="productDescription" class="form-control input-lg" placeholder="What are you buying/selling?" type="text">
                          <span class="help-block">Please provide an accurate description of the product. This will be checked and agreed before releasing the funds. Description should give be as accurate as possible to avoid disputes. </span>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <div id="vehicleType" style="display:none;">
                          
                        <div class="form-group m-bot15">
                          <label class="col-sm-2 control-label">Odometer</label>
                          <div class="col-sm-10">
                            <input name="productOdometer" class="form-control input-lg" placeholder="" type="text">
                          </div>
                          <div class="clearfix"></div>
                        </div>
                          
                         <div class="form-group m-bot15">
                          <label class="col-sm-2 control-label">VIN</label>
                          <div class="col-sm-10">
                            <input name="productVin" class="form-control input-lg" placeholder="" type="text">
                            <span class="help-block">Vehicle Identification Number</span>
                          </div>
                          <div class="clearfix"></div>
                        </div> 
                          
                          <div class="form-group m-bot15">
                            <label class="control-label col-sm-2">Manufacturing date</label>
                            <div class="col-sm-10">
                              <input name="productManDate" id="dp1" type="text" value="28-10-2013" size="16" class="form-control input-lg">
                            </div>
                            <div class="clearfix"></div>
                          </div>
                          
                          
                          <div class="form-group m-bot15">
                          <label class="col-sm-2 control-label">Model</label>
                          <div class="col-sm-10">
                            <input name="productModel" class="form-control input-lg" placeholder="Eg.: Samsung" type="text">
                          </div>
                          <div class="clearfix"></div>
                        </div>
                          
                          <div class="form-group m-bot15">
                          <label class="col-sm-2 control-label">Make</label>
                          <div class="col-sm-10">
                            <input name="productMake" class="form-control input-lg" placeholder="Eg.: S9" type="text">
                          </div>
                          <div class="clearfix"></div>
                        </div>
                      </div>

                  </div>
                </section>
              
            </div>
            
            
            
            
            <div class="col-lg-12">
                <section class="panel">
                  <header class="panel-heading">
                    Shipping details
                  </header>
                  <div class="panel-body">

                       <div class="form-group m-bot15">
                        <label class="col-sm-2 control-label">Who pays for shipping or service fees.</label>
                        <div class="col-sm-10">
                            <div class="radios">
                                <label class="label_radio r_on" for="radio-01">
                                                          <input name="shippingWhoPays" id="radio-01" value="buyer" checked="" type="radio"> Buyer
                                                      </label>
                                <label class="label_radio r_off" for="radio-02">
                                                          <input name="shippingWhoPays" id="radio-02" value="seller" type="radio"> Seller/ service provider
                                                      </label>
                                <label class="label_radio r_off" for="radio-03">
                                                          <input name="shippingWhoPays" id="radio-03" value="50/50" type="radio"> 50/50
                                                      </label>
                              </div>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <div class="form-group m-bot15">
                        <label class="col-sm-2 control-label">Shipping cost/service fees</label>
                        <div class="col-sm-10">
                          <input name="shippingCost" class="form-control input-lg m-bot15" placeholder="The total shipping cost in NAS" type="number">
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <div class="form-group m-bot15">
                        <label class="col-sm-2 control-label">Inspection period</label>
                        <div class="col-sm-10">
                          <input name="inspectionPeriod" class="form-control input-lg m-bot15" placeholder="days" type="number">
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <div class="form-group m-bot15" id="shippingAddress" style="display:none;">
                        <label class="col-sm-2 control-label">Shipping address</label>
                        <div class="col-sm-10">
                          <input name="shippingAddress" class="form-control input-lg" placeholder="Where will the product be shipped" type="text">
                          <span class="help-block">Shipping address: Country, City, Address</span>
                        </div>
                        <div class="clearfix"></div>
                      </div>
                      
                      <button onclick="initiateEscrow($('#escrow').serializeArray());" type="button" class="btn btn-primary centered">START Transaction!</button>
                      <button type="reset" class="btn btn-default">Reset form</button>

                  </div>
                </section>
              
            </div>
            
        </div>
        </form>
        <!-- Basic Forms & Horizontal Forms-->

      </section>
      <div class="text-right">
        <div class="credits">
          <!--
            All the links in the footer should remain intact.
            You can delete the links only if you purchased the pro version.
            Licensing information: https://bootstrapmade.com/license/
            Purchase the pro version form: https://bootstrapmade.com/buy/?theme=NiceAdmin
          -->
          Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>
    </section>
    <!--main content end-->
  </section>
  <!-- container section start -->

  <!-- javascripts -->
  <script src="js/jquery.js"></script>
  <script src="js/jquery-ui-1.10.4.min.js"></script>
  <script src="js/jquery-1.8.3.min.js"></script>
  <script type="text/javascript" src="js/jquery-ui-1.9.2.custom.min.js"></script>
  <!-- bootstrap -->
  <script src="js/bootstrap.min.js"></script>
  <!-- nice scroll -->
  <script src="js/jquery.scrollTo.min.js"></script>
  <script src="js/jquery.nicescroll.js" type="text/javascript"></script>
  <!-- charts scripts -->
  <script src="assets/jquery-knob/js/jquery.knob.js"></script>
  <script src="js/jquery.sparkline.js" type="text/javascript"></script>
  <script src="assets/jquery-easy-pie-chart/jquery.easy-pie-chart.js"></script>
  <script src="js/owl.carousel.js"></script>
  <!-- jQuery full calendar -->
  <<script src="js/fullcalendar.min.js"></script>
    <!-- Full Google Calendar - Calendar -->
    <script src="assets/fullcalendar/fullcalendar/fullcalendar.js"></script>
    <!--script for this page only-->
    <script src="js/calendar-custom.js"></script>
    <script src="js/jquery.rateit.min.js"></script>
    <!-- custom select -->
    <script src="js/jquery.customSelect.min.js"></script>
    <script src="assets/chart-master/Chart.js"></script>

    
    <!-- custom script for this page-->
    <script src="js/sparkline-chart.js"></script>
    <script src="js/easy-pie-chart.js"></script>
    <script src="js/jquery-jvectormap-1.2.2.min.js"></script>
    <script src="js/jquery-jvectormap-world-mill-en.js"></script>
    <script src="js/xcharts.min.js"></script>
    <script src="js/jquery.autosize.min.js"></script>
    <script src="js/jquery.placeholder.min.js"></script>
    <script src="js/gdp-data.js"></script>
    <script src="js/morris.min.js"></script>
    <script src="js/sparklines.js"></script>
    <script src="js/charts.js"></script>
    <script src="js/jquery.slimscroll.min.js"></script>
    <script src="js/contract/bignumber.js"></script>
    <script src="js/identicon/pnglib.js"></script>
    <script src="js/identicon/identicon.js"></script>
    
    <!-- NEBULAS -->
    <script src="js/nebulas/nebPay.js"></script>
    <script src="js/nebulas/nebulas.js"></script>
    
    <!--custome script for all page-->
    <script src="js/scripts.js"></script>
    <script>

        $(document).ready(function(){
        localStorage.removeItem("currentAddr");

localStorage.removeItem("escrows");
            updateWalletAddress(function(){
        	  	toggleLoading();
        		updateData();
        	});
        });

      
    </script>

</body>

</html>
