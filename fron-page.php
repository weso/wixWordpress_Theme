<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package WordPress
 * @subpackage Twenty_Eleven
 */


get_header(); ?>

                <div id="webindex">

                </div>


		<div id="primary">
			<div id="content" role="main">
				<img src="<? echo dirname(get_stylesheet_uri()); ?>/images/slogan.png" id="slogan"/>

			<?php if ( have_posts() ) : ?>
  <?php /*twentyeleven_content_nav( 'nav-above' ); */?>

				<?php /* Start the Loop */ ?>
				<?php while ( have_posts() ) : the_post(); ?>
					<?php get_template_part( 'content', get_post_format() ); ?>
				<?php endwhile; ?>
  <?php /* twentyeleven_content_nav( 'nav-below' ); */ ?>

			<?php endif; ?>

			</div><!-- #content -->
		</div><!-- #primary -->

                <div id="secondary"><ul>
<?php dynamic_sidebar('homepage-sidebar'); ?>
                </ul></div><!-- #secondary -->

<?php get_footer(); ?>
