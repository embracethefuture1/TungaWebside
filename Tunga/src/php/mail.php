<?php
// UTF-8 karakter setini ayarla
header('Content-Type: text/html; charset=utf-8');

// CORS ayarları - geliştirme aşamasında
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Form verilerini al
$firstName = $_POST['firstName'] ?? '';
$lastName = $_POST['lastName'] ?? '';
$senderEmail = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Alıcı e-posta adresi (sabit)
$to = "oguzh4nn@gmail.com";

// E-posta başlığı
$subject = "TUNGA SAYE - Yeni İletişim Formu Mesajı";

// E-posta içeriği (HTML formatında)
$htmlContent = "
<html>
<head>
<title>Yeni İletişim Formu Mesajı</title>
</head>
<body>
<h2>TUNGA SAYE İletişim Formu</h2>
<p><strong>Gönderen:</strong> {$firstName} {$lastName}</p>
<p><strong>E-posta:</strong> {$senderEmail}</p>
<p><strong>Mesaj:</strong><br>
{$message}</p>
</body>
</html>
";

// E-posta başlıkları
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: {$firstName} {$lastName} <{$senderEmail}>\r\n";
$headers .= "Reply-To: {$senderEmail}\r\n";

// E-postayı gönder
$success = mail($to, $subject, $htmlContent, $headers);

// JSON yanıtı döndür
header('Content-Type: application/json');
if ($success) {
    echo json_encode(['status' => 'success', 'message' => 'Mesajınız başarıyla gönderildi.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Mesaj gönderilirken bir hata oluştu.']);
}
?>