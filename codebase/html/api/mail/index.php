<?php
require  __DIR__ . '/../../../autoload.php';

use Application\Mail;
use Application\Database;
use Application\Page;
use Application\Verifier;

$database = new Database('prod');
$page = new Page();

$mail = new Mail($database->getDb());

// Check Authorization header
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization header missing']);
    exit();
}

try {
    $verifier = new Verifier();
    $verifier->decode($_SERVER['HTTP_AUTHORIZATION']);
    $userId = $verifier->userId;
    $role = $verifier->role;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (array_key_exists('name', $data) && array_key_exists('message', $data)) {
        // Determine which userId to assign
        if ($role === 'admin' && array_key_exists('userId', $data)) {
            $mailUserId = $data['userId']; 
        } else {
            $mailUserId = $userId;
        }

        $id = $mail->createMail($data['name'], $data['message'], $mailUserId);
        $page->item(array("id" => $id));
    } else {
        $page->badRequest();
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($role === 'admin') {
        $allMail = $mail->listMail();
    } else {
        $allMail = $mail->listMail($userId);
    }
    $page->item($allMail);
} else {
    $page->badRequest();
}