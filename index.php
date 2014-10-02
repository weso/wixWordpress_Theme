<?php
 	require_once(__DIR__.'/inc/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;
	
	get_header();
	
	echo $renderer->renderTemplate('index');
	
	get_footer(); 
?>
