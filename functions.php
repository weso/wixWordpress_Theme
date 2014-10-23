<?php
add_action( 'wp_enqueue_scripts', 'enqueue_child_theme_styles', PHP_INT_MAX);
function enqueue_child_theme_styles() {
    wp_enqueue_style( 'parent-style', get_template_directory_uri().'/style.css' );
    wp_enqueue_style( 'child-style', get_stylesheet_uri(), array('parent-style')  );
}

// Rewrite rules when accessing data
function add_rewrite_rules($aRules) {
  $aNewRules = array('data/?indicator$' => 'index.php?pagename=data');
  $aRules = $aNewRules + $aRules;
  
  return $aRules;
}

// hook add_rewrite_rules function
add_filter('rewrite_rules_array', 'add_rewrite_rules');

add_action('widgets_init', 'wi_unregister_sidebar', 11);
function wi_unregister_sidebar() {
  unregister_sidebar('sidebar-5');
}

// Register a new sidebar space
if ( function_exists('register_sidebar') ) {
  register_sidebar(array(
    'name' => 'Blog sidebar',
    'id' => 'blog-sidebar',
    'description' => 'Sidebar for the blog section.',
    'before_widget' => '',
    'after_widget' => '',
    'before_title' => '<div class="sidebar-title line-behind-text"><span class="hidden">',
    'after_title' => '</span></div>'));
}

?>

