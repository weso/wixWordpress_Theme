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
			$id = $h2->id;
			$tags .= "<li><a href='#$id'>$content</a></li>";
		}
		
		$nav = "<nav><ul class='tags'>$tags</ul></nav>";
		
		$title = $processed_article->find('h1', 0);
		
		if ($title)
			$title->outertext = $title->outertext . $nav;
			$article_id = $this->formatTitleToAnchor($title->innertext);
		
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
		$sidebar .= "<li><a href='#".$article_element->getAttribute('id')."'>".$chapter_title->innertext."</a><ul>";
		
		foreach($article->find('h2') as $h2) {
			$subsection = "<li><a href='#".$h2->getAttribute('id')."'>".$h2->innertext()."</a></li>";
		}
		
		$subsections[$article_element->getAttribute('id')] = "<ul>".$subsection."</ul>";
		$sidebar .= $subsection."</ul></li>";
	}
	
	$slices["sidebar"] = $sidebar;
	$slices["subsections"] = $subsections;
	
	return $slices;
}

function formatTitleToAnchor($title) {
        $anchor = strtolower(str_replace(' ', '_', $title));

        return $anchor;
}
?>
