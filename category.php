<?php
/**
 * Template for displaying Category Archive pages
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
  	<div class="container">
		<aside class="left-bar"><h1>Blog</h1>
  		<?php dynamic_sidebar('blog-sidebar'); ?>
		</aside>
		<section id="primary" class="right-content blog-articles">

<?php if ( have_posts() ) : ?>

			<header class="archive-header">

				<?php
					// Show an optional term description.
					$term_description = term_description();
					if ( ! empty( $term_description ) ) :
						printf( '<div class="taxonomy-description">%s</div>', $term_description );
					endif;
				?>
			</header><!-- .archive-header -->

			<?php
					// Start the Loop.
					while ( have_posts() ) : the_post();

					/*
					 * Include the post format-specific template for the content. If you want to
					 * use this in a child theme, then include a file called called content-___.php
					 * (where ___ is the post format) and that will be used instead.
					 */
					get_template_part( 'content', get_post_format() );

					endwhile;
					// Previous/next page navigation.
					twentyfourteen_paging_nav();

				else :
					// If no content, include the "No posts found" template.
					get_template_part( 'content', 'none' );

				endif;
			?>
			</div><!-- #content -->
		</section><!-- #primary -->
	</div>
	<script src="/wp-content/themes/wixWordpress_Theme/scripts/left-bar.js"></script>
</main>

<?php get_footer(); ?>
