<?php
/**
 * Theme: Decolonising Development
 * Description: A vibrant, dynamic landing page for critical development studies
 * Version: 1.0
 * Author: Decolonising Development Team
 * Author URL: 
 * 
 * This file provides theme metadata and should not be executed directly.
 * It's here for documentation and CMS integration purposes.
 */

return [
    // Theme Metadata
    'name'        => 'Decolonising Development',
    'version'     => '1.0',
    'author'      => 'Decolonising Development Team',
    'url'         => '',
    'description' => 'A vibrant, dynamic landing page theme featuring animated backgrounds, interactive cards, and African-inspired design. Perfect for literature tools and critical studies platforms.',
    
    // Theme Capabilities
    'features' => [
        'responsive-design',
        'animations',
        'parallax-effects',
        'accessibility-wcag-aa',
        'mobile-optimized',
        'touch-friendly',
    ],
    
    // Color Palette
    'colors' => [
        'primary-gold'   => '#FFD700',
        'primary-red'    => '#E63946',
        'primary-green'  => '#2A9D8F',
        'primary-purple' => '#7209B7',
        'primary-orange' => '#FB5607',
        'dark-bg'        => '#1A1A1A',
        'light-fg'       => '#F8F9FA',
    ],
    
    // Typography
    'fonts' => [
        'display'  => 'Playfair Display',
        'body'     => 'Inter',
        'provider' => 'Google Fonts',
    ],
    
    // File Manifest
    'files' => [
        'template'     => 'template.php',
        'functions'    => 'functions.php',
        'css'          => [
            'variables' => 'css/variables.css',
            'base'      => 'css/base.css',
        ],
        'js'           => [],
    ],
    
    // Browser Support
    'browser-support' => [
        'chrome'   => '90+',
        'firefox'  => '88+',
        'safari'   => '14+',
        'edge'     => '90+',
        'mobile'   => 'all modern browsers',
    ],
    
    // Customization Keys
    'customizable' => [
        'site_title',
        'tagline',
        'description',
        'colors',
        'fonts',
        'animations',
        'parallax',
        'cards',
        'navigation_urls',
    ],
    
    // Theme Components
    'components' => [
        'hero-section',
        'feature-cards',
        'animated-background',
        'scroll-indicator',
        'responsive-grid',
        'interactive-buttons',
    ],
    
    // Accessibility
    'accessibility' => [
        'wcag-2.1-aa' => true,
        'keyboard-navigation' => true,
        'screen-reader-support' => true,
        'color-contrast' => true,
        'responsive-text' => true,
        'focus-indicators' => true,
    ],
];
?>
