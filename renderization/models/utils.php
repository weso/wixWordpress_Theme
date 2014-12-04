<?php

function getPostsByCategory($categorySlug) {
	global $post;

	$posts = Array();
	$categoryId = get_category_by_slug($categorySlug)->term_id;
	
	$args = array('posts_per_page' => 5, 'category' => $categoryId);
	
	$myposts = get_posts( $args );
	
	foreach ( $myposts as $post ){
		setup_postdata( $post );

		$news = Array();
		$news['title'] = get_the_title();
		$news['time'] = get_the_date();
		$news['link'] = get_permalink();
		$news['content'] = get_the_content("Read more...");

		array_push($posts, $news);
	} 
	wp_reset_postdata();
	
	while (count($posts) < 3) {
		$post = Array();
		$post['title'] = "No more news";
		$post['content'] = "";

		array_push($posts, $post);
	}
	
	return $posts;
}

//////////////////////////////////////////////////////////////////////
//////////////////	Static pages 	//////////////////////////////
//////////////////////////////////////////////////////////////////////

function sliceHtmlIntoChapters($html) {
	$chapters = Array();
	$positions = Array();
	
	$article_class = 'text-article';
	$article_id = 'chapter_';
	
	$lastPos = 0;
	while (($lastPos = strpos($html, "<h1>", $lastPos))!== false) {
		$positions[] = $lastPos;
		$lastPos = $lastPos + strlen("<h1>");
	}
	
	for ($i=0; $i < count($positions); $i++) {
		$number = $i + 1;
		if ($i == (count($positions)-1)) {
			$article = substr($html, $positions[$i]);
		} else {
			$article = substr($html, $positions[$i], $positions[$i+1] - $positions[$i]);
		}
		$processed_article = str_get_html($article);
		$tags = "";
		
		foreach($processed_article->find('h2') as $h2) {
			$content = $h2->innertext();
			$id = getNodeText($h2);
			$tags .= "<li><a href='#$id'>$content</a></li>";
		}
		
		$nav = "<nav><ul class='tags'>$tags</ul></nav>";
		
		$title = $processed_article->find('h1', 0);
		
		if ($title) {
			$title->outertext = $title->outertext . $nav;
			$article_id = getNodeText($title);
		}
		
		$content = $processed_article->outertext;
		
		$chapters["chapter_".($i+1)] = "<article class='".$article_class."' id='".$article_id."'><p class='chapter'>$number</p>$content<hr /></article>";
	}
		
	return $chapters;
}
	
function generateSideBar($chapters) {
	$slices = Array();
	$subsections = Array();
	$sidebar = "";
	$subsection = "";
	
	foreach ($chapters as $article) {
		$article_element = $article->find('article', 0);
		$chapter_title = $article->find('h1', 0);
		$innertext = getSingleNodeText($chapter_title);
		$sidebar .= "<li><a href='#".$article_element->getAttribute('id')."'>".$innertext."</a><ul>";
		$subsection = "";
		
		foreach($article->find('h2') as $h2) {
			$innertext = getSingleNodeText($h2);
			$subsection .= "<li><a href='#".$h2->getAttribute('id')."'>".$innertext."</a></li>";
		}
		
		$subsections[$article_element->getAttribute('id')] = "<ul>".$subsection."</ul>";
		$sidebar .= $subsection."</ul></li>";
	}
	
	$slices["sidebar"] = $sidebar;
	$slices["subsections"] = $subsections;
	
	return $slices;
}

function getSingleNodeText($node) {
	$texts = $node->find('text');
	$texts = implode(",", $texts);
	return $texts;
}

function getNodeText($node) {
	return formatTitleToAnchor(getSingleNodeText($node));
}

function formatTitleToAnchor($title) {
	$anchor = strtolower(str_replace(' ', '_', trim($title)));
        
	return $anchor;
}

///////////////////////////////////////////////////////////////////////
/////////////////	Compound pages		///////////////////////
///////////////////////////////////////////////////////////////////////

function getChildPages($post_slug) {
	global $wpdb;

	$my_wp_query = new WP_Query();	

	$page = get_page_by_path($post_slug);
	$id = $page->ID;
	$args = array( 
        'child_of' => $page->ID, 
        'parent' => $page->ID,
        'hierarchical' => 0
	);

	return get_pages($args);
}

function getPostContent($post_slug) {	
	global $wpdb;

	// Obtain the post through its slug
	$post = get_page_by_path($post_slug);

	// Filter the post content
	$content = apply_filters('the_content', $post->post_content);

	return $content;
}

function generateCompoundSidebar(&$sections) {
	$sidebar = "<ul>";
	
	$chapter_counter = 0;
	foreach( $sections as &$section) {
		$chapter_counter++;
		$html = str_get_html($section);
		
		$chapter_title = $html->find('h1', 0);
		$chapter_title->setAttribute('id', 'chapter_'.$chapter_counter);
		
		$sidebar .= "<li><a href='#".$chapter_title->getAttribute('id')."'>".$chapter_title->innertext."</a><ul>";
		
		$section_counter = 0;
		foreach($html->find('h2') as $h2) {
			$section_counter++;
			$h2->setAttribute('id', 'chapter_'.$chapter_counter.'_section_'.$section_counter);
			$sidebar .= "<li><a href='#".$h2->getAttribute('id')."'>".$h2->innertext()."</a></li>";
		}
		
		$section = $html;
		$sidebar .= "</ul></li>";
	}
	$sidebar .= "</ul>";
	
	return $sidebar;
}
?>
