<?php
/**
 * Template Name: Web index Page
 *
 * @package WordPress
 * @subpackage Wen index
 * @since 1.0
 */
	require_once(__DIR__.'/../inc/controller.php');	

	$controller = Controller::getInstance();
	$renderer = $controller->renderer;

	global $post;
	$post_slug = $post->post_name;

	$html = $renderer->renderTemplate($post_slug);
	
	if (!$html) {
		echo '404';
	} else {
		echo $html;
	}
	
	die();
?>
