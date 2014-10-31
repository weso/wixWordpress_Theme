<?php

/**
 * Test function to render specific pages.
 *
 */

$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME']);
require_once( str_replace('index.php', '', $parse_uri[0]).'wp-load.php');
require_once(get_stylesheet_directory()."/inc/twitter/Twitter.php");
 
class Renderer {

	private static $instance;

	private $settings;
	
	private $compiledTemplatesPath;
	private $labelsPath;
	
	private $menu = Array(Array("path"=>"", "label"=>"Home"),
						Array("path"=>"report", "label"=>"The Report"),
						Array("path"=>"data", "label"=>"The Data"),
						Array("path"=>"blog", "label"=>"Blog"),
						Array("path"=>"media-centre", "label"=>"Media Centre"),
						Array("path"=>"about", "label"=>"About"));
	
	private function __construct($settings) {
		$this->settings = $settings;
		
		$this->compiledTemplatesPath = get_stylesheet_directory().$this->settings['compiledTemplatesPath'];
		$this->visualisationsPath = get_stylesheet_directory().$this->settings['visualisationsPath'];
		$this->labelsPath = get_stylesheet_directory().$this->settings['labelsPath'];
	}

	public static function getInstance($settings) {
		if (!self::$instance) {
			self::$instance = new static($settings);
		}

		return self::$instance;
	}	

	public function renderTemplate($templateName) {
		$fileCompiledTemplate = $this->compiledTemplatesPath.$templateName;
		
		if (file_exists($fileCompiledTemplate)) {
			$renderer = include($fileCompiledTemplate);
			
			$navigation = wp_nav_menu( array( 'theme_location' => 'primary', 'echo' => 0 ) );
			
			$pageContent = Array();
			$pageContent["navigation"] = $navigation;

			$pageContent["data"] = $this->loadData($templateName);
			$pageContent["data"]["visualisations"] = $this->loadVisualisations();
			
			foreach ($pageContent["data"]["visualisations"] as &$visualisation) {
				$visualisation["url"] = get_stylesheet_directory_uri().$visualisation["url"];
			}

			$pageContent["labels"] = $this->loadLabels("en");
			$pageContent["path"] = get_stylesheet_directory_uri();
			$pageContent["host"] = get_site_url();		
			$pageContent["title"] = wp_title('|', false, 'right');

			return $renderer($pageContent, true);
		} else {
	
			return false;
		}
	}
	
	private function loadData($templateName) {
		try {
			$templateName = preg_replace("/[^A-Za-z]/", '', $templateName);
			
			$className = ucfirst($templateName) . "Model";
			$modelClass = new ReflectionClass($className);
			$modelObj = $modelClass->newInstanceArgs();
			
			return $modelObj->get();
		} catch (ReflectionException $e) {
			return array();
		}
	}	
	
	private function loadVisualisations() {
		$visualisationsFile = $this->visualisationsPath."settings.json";
		
		if (file_exists($visualisationsFile)) {
			return json_decode(file_get_contents($visualisationsFile), true);
		} else {
			return Array();
		}
	}

	private function loadLabels($lang) {
		$labelsFile = $this->labelsPath.$lang.".json";
		$defaultLabelsFile = $this->labelsPath."en.json";
		
		if (file_exists($labelsFile)) {
	
			return json_decode(file_get_contents($labelsFile), true);
		} else if (file_exists($defaultLabelsFile)) {
		
			return json_decode(file_get_contents($defaultLabelsFile), true);
		} else {
			
			return null;
		}
	}
} 

class AboutModel {
    
    function AboutModel() {
    }

    function get() {
		global $wpdb;
		
		$data = Array();
		$chapters = Array();
		
		// Obtain the post id through its name
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = 'about'");
		
		// Obtain the post through its id
		$post = get_post($id); 
		
		// Filter the post content
		$post_content = apply_filters('the_content', $post->post_content);

		$chapter_counter = 0;
		$html = "";
		
		foreach($this->sliceHtmlIntoChapters($post_content) as $chapter) {
			$chapter_counter++;
			
			$article = str_get_html($chapter);
			
			$section_counter = 0;
			foreach($article->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', $this->formatTitleToAnchor($h2->innertext));
			}
			
			$chapters['chapter_'.$chapter_counter] = $article;
			$html .= $article;
		}
		
		$slices = $this->generateSideBar($chapters);
		
		$data["about"]["content"] = $html;
		$data["about"]["ul"] = $slices["sidebar"];
		
		return $data;
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

}

class ContactModel {
	function ContactModel() {
	}

	function get() {
		return Array();
	}
}

class ErrorModel {
	function ErrorModel() {
	}

	function get() {
		global $wpdb;
		$data = Array();
	
		$data["search"] = get_search_form(false);
		
		return $data;
	}
}

require_once('simplehtmldom/simple_html_dom.php');

class ReportModel {
	
	function ReportModel() {
	}
	
	function get() {
		global $wpdb;
		
		$data = Array();
		$chapters = Array();
		
		// Obtain the post id through its name
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = 'report'");
		
		// Obtain the post through its id
		$post = get_post($id); 
		
		// Filter the post content
		$post_content = apply_filters('the_content', $post->post_content);

		$chapter_counter = 0;
		$html = "";
		
		foreach($this->sliceHtmlIntoChapters($post_content) as $chapter) {
			$chapter_counter++;
			
			$article = str_get_html($chapter);
			
			$section_counter = 0;
			$tags = "";

			foreach($article->find('h2') as $h2) {
				$section_counter++;
				$h2->setAttribute('id', $this->formatTitleToAnchor($h2->innertext));
				
				$content = $h2->innertext;
				$id = $h2->id;
				$tags .= "<li><a href='#$id'>$content</a></li>";
			}
			
			$nav = "<nav><ul class='tags'>$tags</ul></nav>";
		
			$title = $article->find('h1', 0);

                        if ($title)
                                $title->outertext = $title->outertext . $nav;
	
			$chapters['chapter_'.$chapter_counter] = $article;
			$html .= $article;
		}
		
		$slices = $this->generateSideBar($chapters);
		
		$data["report"]["content"] = $html;
		$data["report"]["ul"] = $slices["sidebar"];
		
		return $data;
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
			
			$title = $processed_article->find('h1', 0);
			
			if ($title)
				$title->outertext = $title->outertext;
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
}

class IndexModel {
	function IndexModel(){
	}
	
	function get() {
	  $twitter = new Twitter();

      	$data = Array();
	$data["news"] = $this->getPostsByCategory('news');
      	$data["tweets"] = $twitter->loadDefaultAccountTweets();
	return $data;
	}
	
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
}

class LegacyModel {
	function LegacyModel(){
	}

	function get() {
                $slug = "legacy";
                $data = Array();

                $data[$slug] = Array();

                $children = $this->getChildPages($slug);

                foreach ($children as $page) {
                        $formatted_name = str_replace('-', '_', $page->post_name);
			$formatted_content = $this->generateSubSections($slug, apply_filters('the_content', $page->post_content));
                        $data[$slug][$formatted_name] = $formatted_content;
                }

                return $data;

        }

	function generateSubSections($post_slug, $content) {
		$children = $this->getChildPaged($post_slug);
		$article = str_get_html($content);

		$tags = "";
		foreach ($children as $page) {
			$title = $page->title;
			$link = $page->permalink;

			$tags .= "<li><a href='$link'>$title</a></li>";
		}

                $nav = "<nav><ul class='tags'>$tags</ul></nav>";

                $title = $article->find('h1', 0);

                if ($title)
                	$title->outertext = $title->outertext . $nav;

                return $article;
	}

        function getChildPages($post_slug) {
                global $wpdb;
                $my_wp_query = new WP_Query();

                $id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");
                $all_wp_pages = $my_wp_query->query(array('post_type' => 'page'));

                return get_page_children($id, $all_wp_pages);
        }
}

class MediaModel {
	
	function MediaModel(){
	}

	function get() {
		$slug = "media";
		$data = Array();

		$data[$slug] = Array();
			
		$children = $this->getChildPages($slug);
		foreach ($children as $page) {
			$formatted_name = str_replace('-', '_', $page->post_name);
			$data[$slug][$formatted_name] = apply_filters('the_content', $page->post_content);
		}
	
		return $data;
	}

	function getChildPages($post_slug) {
		global $wpdb;
		$my_wp_query = new WP_Query();	
	
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");
		$all_wp_pages = $my_wp_query->query(array('post_type' => 'page'));
		return get_page_children($id, $all_wp_pages);
	}

	function getPostContent($post_slug) {	
		global $wpdb;
		
		$id = $wpdb->get_var("SELECT ID FROM $wpdb->posts WHERE post_name = '$post_slug'");

		// Obtain the post through its id
		$post = get_post($id);

		// Filter the post content
		$content = apply_filters('the_content', $post->post_content);

		return $content;
	}
	
	function generateSidebar(&$sections) {
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
}
?>

