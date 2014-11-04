<?php
 	require_once(get_stylesheet_directory().'/renderization/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;

	echo $renderer->renderTemplate("error");
?>
