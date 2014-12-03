<?php

/**
 * Test function to render specific pages.
 *
 */

require_once(get_stylesheet_directory()."/inc/twitter/Twitter.php");
require_once(get_stylesheet_directory().'/inc/simplehtmldom/simple_html_dom.php');

class Renderer {

	private static $instance;

	private $settings;
	
	private $compiledTemplatesPath;
	private $labelsPath;
	
	private function __construct($settings) {
		$this->settings = $settings;
		
		$this->compiledTemplatesPath = get_stylesheet_directory().$this->settings['compiledTemplatesPath'];
		$this->visualisationsPath = get_stylesheet_directory().$this->settings['visualisationsPath'];
		$this->api_url = $this->settings['apiUrl'];
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
				$visualisation["fullurl"] = get_stylesheet_directory_uri().$visualisation["fullurl"];
			}

			$pageContent["labels"] = $this->loadLabels("en");
			$pageContent["path"] = get_stylesheet_directory_uri();
			$pageContent["host"] = get_site_url();		
			$pageContent["title"] = wp_title('|', false, 'right');
			$pageContent["api"] = $this->api_url;
			
			return $renderer($pageContent, true);
		} else {
	
			return false;
		}
	}
	
	private function loadData($templateName) {
		$templateName = preg_replace("/[^A-Za-z]/", '', $templateName);
		
		if (file_exists(__DIR__.'/models/'.$templateName.'.php')) {	
			require_once(__DIR__.'/models/'.$templateName.'.php');
		}
	
		try {
			$className = ucfirst($templateName) . "Model";
			$modelClass = new ReflectionClass($className);
			$modelObj = $modelClass->newInstanceArgs();
		
			/*$methodParameters = (new ReflectionMethod($className, 'get'))->getParameters();
			
			$parameters = array();
			foreach ($methodParameters as $parameter) {
				$parameters[$parameter->name] = $this->{$parameter->name};
			}*/
			
			if ($templateName == 'index') {
				return $modelObj->get($this->api_url, $this->visualisationsPath);
			} else {
				return $modelObj->get();
			}
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
?>

