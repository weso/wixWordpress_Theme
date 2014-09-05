<?php
require_once('compiler.php'); 

/**
 * Test function to render specific pages.
 *
 */
function renderTemplate($templateName) {
	$compiler = Compiler::getInstance();
	$fileCompiledTemplate = $compiler->getCompiledTemplatesPath().$templateName;
	
	if (file_exists($fileCompiledTemplate)) {
		$renderer = include($fileCompiledTemplate);
		
		return $renderer(Array('name' => 'John', 'value' => 10000));
	} else {

		return false;
	}
} 
?>
