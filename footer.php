<?php
 	require_once(__DIR__.'/inc/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;
	
	echo $renderer->renderTemplate("footer");
?>
