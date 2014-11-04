<?php
	echo '0';
 	require_once(get_stylesheet_directory().'/renderization/controller.php');
	echo '1';
        $controller = Controller::getInstance();
	
	echo '2';
        $renderer = $controller->renderer;

	get_header();
	
	echo $renderer->renderTemplate("index");

	get_footer(); 
?>
