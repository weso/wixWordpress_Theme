<?php
	require_once(__DIR__.'/../inc/lightncandy/lightncandy.php');

	class Compiler {
		
		// singleton
		private static $instance;
		
		private $settings;
		
		private $templatesPath;
		private $compiledTemplatesPath;
		
		private function __construct($settings) {
			$this->settings = $settings;
			
			$this->templatesPath = __DIR__ . '/..' . $this->settings['templatesPath'];
			$this->compiledTemplatesPath = __DIR__ . '/..' . $this->settings['compiledTemplatesPath'];
		}

		public static function getInstance($settings) {
			if (!self::$instance) {
				self::$instance = new static($settings);
			}

			return self::$instance;
		}

		public function compileTemplates() {
			$pages = scandir($this->templatesPath);
			self::compileTemplate('header', true);
			self::compileTemplate('footer', true);
			self::compileTemplate('by', true);
			
			foreach ($pages as $page) {
				self::compileTemplate($page, false);
			}
		}

		public function compileTemplate($templateName, $partial) {
			if ($partial) {
				$templatePath = $this->templatesPath."partials/".$templateName.'.hbs';			
			} else {
				$templatePath = $this->templatesPath.$templateName;			
			}
			
			if (file_exists($templatePath)) {
				$template = file_get_contents($templatePath);

				$compiledTemplate = LightnCandy::compile($template, Array(
   					'flags' => LightnCandy::FLAG_STANDALONE,
    					'basedir' => Array(
        					$this->templatesPath,
							$this->templatesPath.'partials/',
    					),
    					'fileext' => Array(
        					'.tmpl',
        					'.mustache',
        					'.hbs',
    					)
				));

				file_put_contents($this->compiledTemplatesPath.explode('.', $templateName)[0], $compiledTemplate);
			} else {
				error_log(date("Y-m-d H:i:s").': File: '.$templatePath.' does not exists');
			}	
		}
		
	}
?>
