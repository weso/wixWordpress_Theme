<?php
  require_once('PHPMailer/PHPMailerAutoload.php);

  if (isset($_POST['Send'], $_POST['name'], $_POST['email'], $_POST['type'], $_POST['comment']) {
	
	// Load connection settings
	$settings = json_decode(file_get_contents('settings.php'), true);

	// Create the mail object
	$mail = new PHPMailer();

	// Configure SMTP authentication
	$mail->IsSMTP();
	$mail->SMTDebug = 1;
	$mail->SMTPAuth = true;
	$mail->SMTPSecure = 'ssl';

	// Configure SMTP account
	$mail->Host = $settings['SMTPHost'];
	$mail->Port = $settings['SMTPPort'];
	$mail->Username = $settings['username'];
	$mail->Password = $settings['password'];
	$mail->SetFrom($_POST['email'], $_POST['name']);
	$mail->Subject = $_POST['type'];
	$mail->Body = $_POST['comment'];
	
	$mail->AddAddress($settings['mailReceiver']);

	if($mail->Send()) {
		header('Location: '.$successURL);
		die();
	}else {
		header('Location: '.$errorURL);
	}
  } else {
	header('Location: '.$errorURL);	
  }
?>
