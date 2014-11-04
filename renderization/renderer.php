<?php

/**
 * Test function to render specific pages.
 *
 */
 
class Renderer {

	private static $instance;

	private $settings;
	
	private $compiledTemplatesPath;
	private $labelsPath;
	
	private function __construct($settings) {
		$this->settings = $settings;
		
		$this->compiledTemplatesPath = get_stylesheet_directory().$this->settings['compiledTemplatesPath'];
		$visualisationsPath = get_stylesheet_directory().$this->settings['visualisationsPath'];
		$api_url = $this->settings['apiUrl'];
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
		$data = array();
		$templateName = preg_replace("/[^A-Za-z]/", '', $templateName);
		
		require_once('models/'.$templateName.'.php');
		try {
			
			$className = ucfirst($templateName) . "Model";
			$modelClass = new ReflectionClass($className);
			$modelObj = $modelClass->newInstanceArgs();
			
			data = $modelObj->get($this->api_url, $this->visualisationsPath);
		} catch (ReflectionException $e) {
		}

		$data["visualisations"] = $this->loadVisualisations();

		return $data;
	}	
	
	private function loadVisualisations() {
		global $visualisationsPath;
		$visualisations = array();

		$visualisationsFile = $visualisationsPath."settings.json";
		
		if (file_exists($visualisationsFile)) {
			$visualisations = json_decode(file_get_contents($visualisationsFile), true);
			
			foreach ($visualisations as &$visualisation) {
			$visualisation["url"] = get_stylesheet_directory_uri().$visualisation["url"];
			}
		}

		return $visualisations;
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

