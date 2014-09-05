<?php
/**
 * Template Name: Web index Page
 *
 * @package WordPress
 * @subpackage Wen index
 * @since 1.0
 */
	require_once('/var/www/wordpress/wp-content/themes/wixWordpress_Theme/inc/renderer.php');	

	global $post;
	$post_slug = $post->post_name;

	$html = renderTemplate('about');
	
	if (!$html) {
		echo '404';
	} else {
		echo $html;
	}
?>
