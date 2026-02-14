// Step 6: Extract ID from URL
// In api/mail/id/index.php, you can extract the ID like this:
<?php
require __DIR__.'/../../../vendor/autoload.php';

use Application\Mail;
use Application\Page;

$dsn = "pgsql:host=" . getenv('DB_PROD_HOST') . ";dbname=" . getenv('DB_PROD_NAME');
try {
    $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo "Database connection failed: " . $e->getMessage();
    exit;
}



$uri = $_SERVER['REQUEST_URI'];
$parts = explode('/', trim($uri, '/'));
$id = end($parts);
$id = (int) $id;

$mail = new Mail($pdo);
$page = new Page();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $item = $mail->getMail($id);

    if ($item){
        $page->item($item);
    } else {
        $page->notFound();
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!isset($data['subject']) || !isset($data['body'])){
        $page->badRequest();
        exit;
    }
    $updated = $mail->updateMail($id, $data['subject'], $data['body']);

    if ($updated){
        $page->item($mail->getMail($id));
    } else {
        $page->notFound();
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE'){
    $deleted = $mail->deleteMail($id);

    if ($deleted) {
        http_response_code(200);
        echo json_encode(["message" => "Deleted successfully"]);
    } else {
        $page->notFound();
    }
    exit;
}

$page->badRequest();
