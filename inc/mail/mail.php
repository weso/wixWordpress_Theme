<?php

    $from = "test@test.com"; // sender
    $subject = "I dunno";
    $message = "Just testing stuff";
    
	// message lines should not exceed 70 characters (PHP rule), so wrap it
    $message = wordwrap($message, 70);
    
	// send mail
    mail("kazeborja@gmail.com",$subject,$message,"From: $from\n");
    
	echo "Thank you for sending us feedback";
?>