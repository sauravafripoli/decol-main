<?php
/**
 * Decolonising Development Theme Configuration
 */

if (!defined('IN_GS')) { die('you cannot load this page directly.'); }

// URLs
// URLs for internal pages resolved from GetSimple page metadata.
// This keeps the link aligned with the page's current parent/slug structure.
$toolPageData = function_exists('menu_data') ? menu_data('decolonise') : null;
$reportsPageData = function_exists('menu_data') ? menu_data('reports') : null;
$sitePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/\\');
if ($sitePath === '/') {
	$sitePath = '';
}

$toolPageUrl = (is_array($toolPageData) && !empty($toolPageData['slug']))
	? find_url($toolPageData['slug'], $toolPageData['parent_slug'] ?? '', 'relative')
	: $sitePath . '/index.php?id=decolonise';
$reportsPageUrl = (is_array($reportsPageData) && !empty($reportsPageData['slug']))
	? find_url($reportsPageData['slug'], $reportsPageData['parent_slug'] ?? '', 'relative')
	: $sitePath . '/index.php?id=reports';

define('TOOL_PAGE_URL', $toolPageUrl);
define('REPORTS_PAGE_URL', $reportsPageUrl);

?>
