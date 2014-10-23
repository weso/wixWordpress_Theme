<?php
 	require_once(get_stylesheet_directory().'/inc/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;

	get_header();
	
	echo $renderer->renderTemplate("index");

	get_footer(); 
?>
