<?php
/**
 * Plugin Name:       Janam Kundali Calculator
 * Plugin URI:        https://github.com/your-repo/janam-kundali
 * Description:       Embed a fully-featured Vedic birth-chart (Janam Kundali) calculator on any page or post using the [janam_kundali] shortcode. Powered by accurate JPL Keplerian ephemeris calculations.
 * Version:           1.0.0
 * Requires at least: 5.9
 * Requires PHP:      7.4
 * Author:            Your Name
 * License:           GPL v2 or later
 * Text Domain:       janam-kundali
 */

defined( 'ABSPATH' ) || exit;

define( 'JK_VERSION',    '1.0.0' );
define( 'JK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'JK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/* ─────────────────────────────────────────────────────────────────────────
 * Admin settings page — lets the site owner set the app URL once
 * ───────────────────────────────────────────────────────────────────────── */

add_action( 'admin_menu', 'jk_add_settings_page' );
function jk_add_settings_page() {
    add_options_page(
        __( 'Janam Kundali Settings', 'janam-kundali' ),
        __( 'Janam Kundali', 'janam-kundali' ),
        'manage_options',
        'janam-kundali',
        'jk_render_settings_page'
    );
}

add_action( 'admin_init', 'jk_register_settings' );
function jk_register_settings() {
    register_setting( 'jk_settings_group', 'jk_app_url', [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => '',
    ] );
    register_setting( 'jk_settings_group', 'jk_default_height', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 900,
    ] );

    add_settings_section( 'jk_main', '', '__return_false', 'janam-kundali' );

    add_settings_field(
        'jk_app_url',
        __( 'App URL', 'janam-kundali' ),
        'jk_field_app_url',
        'janam-kundali',
        'jk_main'
    );
    add_settings_field(
        'jk_default_height',
        __( 'Default iFrame Height (px)', 'janam-kundali' ),
        'jk_field_height',
        'janam-kundali',
        'jk_main'
    );
}

function jk_field_app_url() {
    $val = esc_attr( get_option( 'jk_app_url', '' ) );
    echo '<input type="url" name="jk_app_url" value="' . $val . '"
           class="regular-text" placeholder="https://your-app.replit.app" />';
    echo '<p class="description">' .
         esc_html__( 'Full URL of your deployed Janam Kundali app (e.g. your Replit deployment URL).', 'janam-kundali' ) .
         '</p>';
}

function jk_field_height() {
    $val = absint( get_option( 'jk_default_height', 900 ) );
    echo '<input type="number" name="jk_default_height" value="' . $val . '"
           class="small-text" min="400" max="2000" step="50" /> px';
}

function jk_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Janam Kundali Settings', 'janam-kundali' ); ?></h1>

        <?php if ( empty( get_option( 'jk_app_url' ) ) ) : ?>
        <div class="notice notice-warning">
            <p>
                <?php esc_html_e( 'Please enter your app URL below before using the shortcode.', 'janam-kundali' ); ?>
            </p>
        </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php
            settings_fields( 'jk_settings_group' );
            do_settings_sections( 'janam-kundali' );
            submit_button();
            ?>
        </form>

        <hr>
        <h2><?php esc_html_e( 'How to use', 'janam-kundali' ); ?></h2>
        <p><?php esc_html_e( 'Add the shortcode to any page or post:', 'janam-kundali' ); ?></p>
        <table class="widefat" style="max-width:640px">
            <thead><tr><th><?php esc_html_e( 'Shortcode', 'janam-kundali' ); ?></th><th><?php esc_html_e( 'Description', 'janam-kundali' ); ?></th></tr></thead>
            <tbody>
                <tr><td><code>[janam_kundali]</code></td><td><?php esc_html_e( 'Embed with default height from settings.', 'janam-kundali' ); ?></td></tr>
                <tr><td><code>[janam_kundali height="1000"]</code></td><td><?php esc_html_e( 'Embed with a custom height (in pixels).', 'janam-kundali' ); ?></td></tr>
                <tr><td><code>[janam_kundali url="https://…" height="900"]</code></td><td><?php esc_html_e( 'Override the app URL for this specific embed.', 'janam-kundali' ); ?></td></tr>
            </tbody>
        </table>
    </div>
    <?php
}

/* ─────────────────────────────────────────────────────────────────────────
 * Shortcode  [janam_kundali]
 * ───────────────────────────────────────────────────────────────────────── */

add_shortcode( 'janam_kundali', 'jk_shortcode' );
function jk_shortcode( $atts ) {
    $defaults = [
        'url'    => get_option( 'jk_app_url', '' ),
        'height' => get_option( 'jk_default_height', 900 ),
        'title'  => __( 'Janam Kundali Calculator', 'janam-kundali' ),
    ];
    $atts = shortcode_atts( $defaults, $atts, 'janam_kundali' );

    $url    = esc_url( $atts['url'] );
    $height = absint( $atts['height'] );
    $title  = esc_attr( $atts['title'] );

    if ( empty( $url ) ) {
        if ( current_user_can( 'manage_options' ) ) {
            return '<p style="color:red;font-weight:bold;">' .
                   esc_html__( '[Janam Kundali] App URL is not configured. Please set it in Settings → Janam Kundali.', 'janam-kundali' ) .
                   '</p>';
        }
        return '';
    }

    // Enqueue the responsive-iframe helper CSS (only once per page)
    wp_enqueue_style( 'jk-embed', JK_PLUGIN_URL . 'assets/embed.css', [], JK_VERSION );

    $uid = 'jk-' . wp_unique_id();

    ob_start();
    ?>
    <div class="jk-wrapper" id="<?php echo esc_attr( $uid ); ?>" style="--jk-height:<?php echo $height; ?>px">
        <iframe
            src="<?php echo $url; ?>"
            title="<?php echo $title; ?>"
            class="jk-iframe"
            loading="lazy"
            allow="geolocation"
            referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
    </div>
    <?php
    return ob_get_clean();
}

/* ─────────────────────────────────────────────────────────────────────────
 * REST endpoint — proxy for the Kundali API (optional, avoids CORS issues)
 * Call: POST /wp-json/janam-kundali/v1/generate
 * Forwards to the configured app URL's /api/kundali/generate endpoint.
 * ───────────────────────────────────────────────────────────────────────── */

add_action( 'rest_api_init', 'jk_register_rest_routes' );
function jk_register_rest_routes() {
    register_rest_route( 'janam-kundali/v1', '/generate', [
        'methods'             => 'POST',
        'callback'            => 'jk_proxy_generate',
        'permission_callback' => '__return_true',
    ] );
}

function jk_proxy_generate( WP_REST_Request $request ) {
    $app_url = get_option( 'jk_app_url', '' );
    if ( empty( $app_url ) ) {
        return new WP_Error( 'no_url', __( 'App URL not configured.', 'janam-kundali' ), [ 'status' => 503 ] );
    }

    $api_url  = trailingslashit( $app_url ) . 'api/kundali/generate';
    $body     = $request->get_body();
    $response = wp_remote_post( $api_url, [
        'headers'     => [ 'Content-Type' => 'application/json' ],
        'body'        => $body,
        'timeout'     => 30,
        'data_format' => 'body',
    ] );

    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'proxy_error', $response->get_error_message(), [ 'status' => 502 ] );
    }

    $code        = wp_remote_retrieve_response_code( $response );
    $remote_body = wp_remote_retrieve_body( $response );

    return new WP_REST_Response( json_decode( $remote_body, true ), $code );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Activation / Deactivation hooks
 * ───────────────────────────────────────────────────────────────────────── */

register_activation_hook( __FILE__, 'jk_activate' );
function jk_activate() {
    if ( false === get_option( 'jk_app_url' ) ) {
        add_option( 'jk_app_url', '' );
    }
    if ( false === get_option( 'jk_default_height' ) ) {
        add_option( 'jk_default_height', 900 );
    }
}

register_deactivation_hook( __FILE__, 'jk_deactivate' );
function jk_deactivate() {
    // Nothing to clean up; settings are intentionally kept on deactivation.
}
