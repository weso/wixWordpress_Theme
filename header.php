<?php
 	require_once(__DIR__.'/renderization/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;
	echo $renderer->renderTemplate("header");
?>
