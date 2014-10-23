<?php
/**
 * The Template for displaying all single posts
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */
  require_once(__DIR__.'/inc/controller.php');
  $controller = Controller::getInstance();
  $renderer = $controller->renderer;
  
get_header(); ?>

<main class="content">
	<?php echo $renderer->renderTemplate("by"); ?>
	<div class="container" role="main">
		<section class="articles">
			<?php
				// Start the Loop.
				while ( have_posts() ) : the_post();

					/*
					 * Include the post format-specific template for the content. If you want to
					 * use this in a child theme, then include a file called called content-___.php
					 * (where ___ is the post format) and that will be used instead.
					 */
					get_template_part( 'content', get_post_format() );

					// Previous/next post navigation.
					twentyfourteen_post_nav();

					// If comments are open or we have at least one comment, load up the comment template.
					/*if ( comments_open() || get_comments_number() ) {
						comments_template();
					}*/
				endwhile;
			?>
		</section>
	</div><!-- #content -->
</main><!-- #primary -->

<?php
get_footer();
