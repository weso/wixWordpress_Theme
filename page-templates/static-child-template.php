<?php
/**
 * Template Name: Static child page
 *
 * @package WordPress
 * @subpackage Web index
 * @since 1.0
 */

        require_once(get_stylesheet_directory().'/renderization/controller.php');

        $controller = Controller::getInstance();
        $renderer = $controller->renderer;

        echo $renderer->renderTemplate("error");

?>
