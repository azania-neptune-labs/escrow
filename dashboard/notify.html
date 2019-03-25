<?php
session_start();
header('Content-Type: application/json');

define('IS_AJAX', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
if (!IS_AJAX) {
    exit(json_encode(['error' => 'Restricted access']));    
}


if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(mt_rand());
}

$pos = strpos($_SERVER['HTTP_REFERER'],getenv('HTTP_HOST'));
if ($pos === false) {
    exit(json_encode(['error' => 'Restricted access']));  
}


$headers = apache_request_headers();
if (isset($headers['CsrfToken'])) {
    if ($headers['CsrfToken'] !== $_SESSION['csrf_token']) {
        exit(json_encode(['error' => 'Wrong CSRF token.']));
    }
} else {
    exit(json_encode(['error' => 'No CSRF token.']));
}



$emailTemplate = file_get_contents('email/template.html', true);

$status = htmlentities(trim(strip_tags($_POST['cta'])));
$to = filter_var(trim(strip_tags($_POST['to'])), FILTER_SANITIZE_EMAIL);

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    exit(json_encode(['error' => 'Invalid email address']));
}

$preheader = htmlentities(trim(strip_tags($_POST['preheader'])));
$description = htmlentities(trim(strip_tags($_POST['description'])));
$content = htmlentities(trim(strip_tags($_POST['content'])));
$subject = htmlentities(trim(strip_tags($_POST['subject'])));

$emailTemplate = preg_replace("/\{#CTA\}/si", $status, $emailTemplate);
$emailTemplate = preg_replace("/\{#PREHEADER\}/si", $preheader, $emailTemplate);
$emailTemplate = preg_replace("/\{#CONTENT\}/si", $content, $emailTemplate);
$emailTemplate = preg_replace("/\{#DESCRIPTION\}/si", $description, $emailTemplate);


$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
$headers .= "From: support@nas-escrow.com" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();


if (mail($to, $subject, $emailTemplate, $headers)) {
    exit(json_encode(['success' => 'Email sent.']));
}








