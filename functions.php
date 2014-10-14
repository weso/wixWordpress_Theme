<?php

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
    'before_widget' => '<aside class="left-bar"><h1>Blog</h1>',
    'after_widget' => '</aside>',
    'before_title' => '<span class="hidden">',
    'after_title' => '</span>'));
}

?>

