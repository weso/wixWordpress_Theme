<?php

	require_once('lightncandy.php');
	require_once('/var/www/wordpress/wp-load.php');

	class Compiler {
		
		// singleton
		private static $instance;

		private static $compiledTemplatesPath;
		private static $templatesPath;
		private static $themePath;

		private function __construct() {
			self::$themePath = '/var/www/wordpress/wp-content/themes/wixWordpress_Theme/';
			self::$templatesPath = self::$themePath.'views/';
			self::$compiledTemplatesPath = self::$themePath.'compiled-views/';
		}

		public static function getInstance() {
			if (!self::$instance) {
				self::$instance = new static();
			}

			return self::$instance;
		}

		public function compileTemplates() {
			$pages = get_pages();
			foreach ($pages as $page) {
				self::compileTemplate($page->post_name);
			}
		}

		public function compileTemplate($templateName) {
			$templatePath = self::$templatesPath.$templateName.'.tmpl';			

			if (file_exists($templatePath)) {
				$template = file_get_contents($templatePath);

				$compiledTemplate = LightnCandy::compile($template, Array(
   					'flags' => LightnCandy::FLAG_STANDALONE,
    					'basedir' => Array(
        					self::$templatesPath,
						self::$templatesPath.'partials/',
    					),
    					'fileext' => Array(
        					'.tmpl',
        					'.mustache',
        					'.handlebars',
    					)
				));

				file_put_contents(self::$compiledTemplatesPath.$templateName, $compiledTemplate);
			} else {
				echo 'File: '.$templatePath.' does not exists';
			}	
		}
		
		public function getCompiledTemplatesPath() {
			return self::$compiledTemplatesPath;
		}
		
		public function getThemePath() {
			return self::$themePath;
		}

	}
?>
