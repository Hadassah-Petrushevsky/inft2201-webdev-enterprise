<?php
use PHPUnit\Framework\TestCase;
use Application\Mail;

class MailTest extends TestCase {
    protected PDO $pdo;

    protected function setUp(): void
    {
        $dsn = "pgsql:host=" . getenv('DB_TEST_HOST') . ";dbname=" . getenv('DB_TEST_NAME');
        $this->pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'));
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Clean and reinitialize the table
        $this->pdo->exec("DROP TABLE IF EXISTS mail;");
        $this->pdo->exec("
            CREATE TABLE mail (
                id SERIAL PRIMARY KEY,
                subject TEXT NOT NULL,
                body TEXT NOT NULL
            );
        ");
    }

    public function testCreateMail() {
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Alice", "Hello world");
        $this->assertIsInt($id);
        $this->assertEquals(1, $id);
    }

    public function testGetMail(){
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Hunter", "Get Test");
        $result = $mail->getMail($id);
        $this->assertIsArray($result);
        $this->assertEquals("Hunter", $result['subject']);
        $this->assertEquals("Get Test", $result['body']);
    }

    public function testgetAllMail(){
        $mail = new Mail($this->pdo);
        $mail->createMail("James", "Hello, How are you");
        $mail->createMail("Liam", "Doing Good");
        $result = $mail->getAllMail();
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals("James", $result[0]['subject']);
        $this->assertEquals("Hello, How are you", $result[0]['body']);
        $this->assertEquals("Liam", $result[1]['subject']);
        $this->assertEquals("Doing Good", $result[1]['body']);     
    }

    public function testUpdateMail(){
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Pluto", "Come Back");
        $result = $mail->updateMail($id, "PlutoAgain", "Im Here");
        $this->assertTrue($result);
        $updated = $mail->getMail($id);
        $this->assertEquals("PlutoAgain", $updated['subject']);
        $this->assertEquals("Im Here", $updated['body']);        
    }

    
    public function testDeleteMail(){
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Mars", "Eat all of Earth");
        $result = $mail->deleteMail($id);
        $this->assertTrue($result);
        $deleted = $mail->getMail($id);
        $this->assertFalse($deleted);        
    }
}