<?php
	require_once('Twitter.php');
	
	$twitter = new Twitter();
	
	echo var_dump($twitter->loadDefaultAccountTweets());
?>