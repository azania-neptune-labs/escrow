<?php

                                                                  
$data_string = '{"from":"n1XVQAmgHrdtvCLbPk9GxWizAcaxNLuhTAP","to":"n1iD87PzD1VMnLcfpqC6NmfkKbEQn6DAf7i","value":"0","nonce":3,"gasPrice":"1000000","gasLimit":"2000000","contract":{"function":"getEscrows","args":"[]"}}';                                                                              
                                                                                                                     
$ch = curl_init('http://mainnet.nebulas.io/v1/user/call');                                                                      
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($data_string))                                                                       
);                                                                                                                   
                                                                                                                     
$result = curl_exec($ch);
var_dump($result);
if(!curl_exec($ch)){
    die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
}

var_dump($result);
// Close request to clear up some resources
curl_close($ch);