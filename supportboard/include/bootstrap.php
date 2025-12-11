<?php
/**
 * Bootstrap utilities to configure Support Board without config.php.
 */

if (!function_exists('sb_initialize_environment')) {
    function sb_initialize_environment() {
        if (!function_exists('get_option')) {
            $wp_load = dirname(__DIR__, 5) . '/wp-load.php';
            if (file_exists($wp_load)) {
                require_once $wp_load;
            }
        }

        if (!function_exists('get_option')) {
            return;
        }

        $config = get_option('supportboard_config', []);
        global $wpdb;

        if (!defined('SB_URL') && function_exists('plugins_url')) {
            define('SB_URL', plugins_url() . '/supportboard/supportboard');
        }

        if (!defined('SB_DB_NAME') && defined('DB_NAME')) {
            define('SB_DB_NAME', DB_NAME);
        }

        if (!defined('SB_DB_USER') && defined('DB_USER')) {
            define('SB_DB_USER', DB_USER);
        }

        if (!defined('SB_DB_PASSWORD') && defined('DB_PASSWORD')) {
            define('SB_DB_PASSWORD', DB_PASSWORD);
        }

        if (!defined('SB_DB_HOST') && defined('DB_HOST')) {
            define('SB_DB_HOST', DB_HOST);
        }

        if (!defined('SB_DB_PORT') && defined('DB_PORT')) {
            define('SB_DB_PORT', DB_PORT);
        }

        if (!defined('SB_WP_PREFIX') && isset($wpdb)) {
            define('SB_WP_PREFIX', $wpdb->prefix);
        }

        if (!function_exists('wp_upload_dir')) {
            return;
        }

        $upload_directory = wp_upload_dir();
        if ($upload_directory && is_array($upload_directory)) {
            $upload_path = $upload_directory['basedir'] . '/sb';
            $upload_url = $upload_directory['baseurl'] . '/sb';
            if (!file_exists($upload_path)) {
                wp_mkdir_p($upload_path);
            }
            if (!defined('SB_UPLOAD_PATH')) {
                define('SB_UPLOAD_PATH', $upload_path);
            }
            if (!defined('SB_UPLOAD_URL')) {
                define('SB_UPLOAD_URL', $upload_url);
            }
        }
    }
}

sb_initialize_environment();
