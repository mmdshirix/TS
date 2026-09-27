<?php
/**
 * Plugin Name: Taxel AI Site Builder
 * Plugin URI:  https://talksell.ir
 * Description: «فقط بگو چی می‌خوای بسازیم» — یک باکس هوشمند که درخواست کاربر را می‌گیرد، چند سوال کوتاه می‌پرسد و سایت او را روی پلتفرم تاکسل می‌سازد. شورت‌کد: [taxel_builder]
 * Version:     1.0.0
 * Author:      Taxel
 * Author URI:  https://talksell.ir
 * License:     GPL-2.0+
 * Text Domain: taxel-ai-builder
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TAXEL_AI_BUILDER_VERSION', '1.0.0');
define('TAXEL_AI_BUILDER_URL', plugin_dir_url(__FILE__));
define('TAXEL_AI_BUILDER_PATH', plugin_dir_path(__FILE__));

final class Taxel_AI_Builder
{
    private static $instance = null;

    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        add_action('init', [$this, 'register_shortcode']);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('admin_menu', [$this, 'admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('widgets_init', function () {
            register_widget('Taxel_AI_Builder_Widget');
        });
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'action_links']);
    }

    /* ------------------------------------------------------------------ */
    /* Settings                                                            */
    /* ------------------------------------------------------------------ */

    public static function defaults()
    {
        return [
            'platform_url'   => 'https://platform-talksell.ir',
            'api_key'        => '',
            'title'          => 'فقط بگو چی می‌خوای بسازیم',
            'subtitle'       => 'سایت فروشگاهی، نوبت‌دهی مطب، داروخانه آنلاین… در چند کلیک با هوش مصنوعی تاکسل',
            'placeholder'    => 'مثلاً: یک سایت نوبت‌دهی برای مطب پوست می‌خوام…',
            'button_text'    => 'بساز',
            'accent'         => '#2563eb',
            'accent2'        => '#06b6d4',
            'theme'          => 'dark',
            'proxy_requests' => '1',
        ];
    }

    public static function get_settings()
    {
        $saved = get_option('taxel_ai_builder_settings', []);
        return wp_parse_args(is_array($saved) ? $saved : [], self::defaults());
    }

    public function register_settings()
    {
        register_setting('taxel_ai_builder', 'taxel_ai_builder_settings', [
            'type'              => 'array',
            'sanitize_callback' => [$this, 'sanitize_settings'],
        ]);
    }

    public function sanitize_settings($input)
    {
        $d = self::defaults();
        $out = [];
        $out['platform_url']   = isset($input['platform_url']) ? esc_url_raw(untrailingslashit(trim($input['platform_url']))) : $d['platform_url'];
        $out['api_key']        = isset($input['api_key']) ? sanitize_text_field($input['api_key']) : '';
        $out['title']          = isset($input['title']) ? sanitize_text_field($input['title']) : $d['title'];
        $out['subtitle']       = isset($input['subtitle']) ? sanitize_text_field($input['subtitle']) : $d['subtitle'];
        $out['placeholder']    = isset($input['placeholder']) ? sanitize_text_field($input['placeholder']) : $d['placeholder'];
        $out['button_text']    = isset($input['button_text']) ? sanitize_text_field($input['button_text']) : $d['button_text'];
        $out['accent']         = isset($input['accent']) ? sanitize_hex_color($input['accent']) : $d['accent'];
        $out['accent2']        = isset($input['accent2']) ? sanitize_hex_color($input['accent2']) : $d['accent2'];
        $out['theme']          = (isset($input['theme']) && in_array($input['theme'], ['dark', 'light'], true)) ? $input['theme'] : 'dark';
        $out['proxy_requests'] = !empty($input['proxy_requests']) ? '1' : '0';
        return $out;
    }

    public function admin_menu()
    {
        add_options_page('Taxel AI Builder', 'Taxel AI Builder', 'manage_options', 'taxel-ai-builder', [$this, 'render_settings_page']);
    }

    public function action_links($links)
    {
        $links[] = '<a href="' . esc_url(admin_url('options-general.php?page=taxel-ai-builder')) . '">' . esc_html__('تنظیمات', 'taxel-ai-builder') . '</a>';
        return $links;
    }

    public function render_settings_page()
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $s = self::get_settings();
        ?>
        <div class="wrap" dir="rtl" style="max-width:860px">
            <h1 style="display:flex;align-items:center;gap:10px">
                <span style="display:inline-grid;place-items:center;width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#06b6d4);color:#fff">✦</span>
                Taxel AI Builder
            </h1>
            <p>باکس هوشمند «فقط بگو چی می‌خوای بسازیم» را با شورت‌کد <code>[taxel_builder]</code> در هر برگه، نوشته یا ابزارک قرار دهید.</p>
            <form method="post" action="options.php">
                <?php settings_fields('taxel_ai_builder'); ?>
                <table class="form-table" role="presentation">
                    <tr><th scope="row">آدرس پلتفرم تاکسل</th><td><input type="url" dir="ltr" class="regular-text" name="taxel_ai_builder_settings[platform_url]" value="<?php echo esc_attr($s['platform_url']); ?>" placeholder="https://platform-talksell.ir" /><p class="description">آدرس نصب پلتفرم (بدون اسلش انتهایی).</p></td></tr>
                    <tr><th scope="row">کلید API</th><td><input type="text" dir="ltr" class="regular-text" name="taxel_ai_builder_settings[api_key]" value="<?php echo esc_attr($s['api_key']); ?>" placeholder="txl_..." /><p class="description">از خروجی <code>npm run db:setup</code> یا جدول <code>intake_api_keys</code> پلتفرم. برای اتصال لیدها به این سایت استفاده می‌شود.</p></td></tr>
                    <tr><th scope="row">ارسال از طریق سرور وردپرس</th><td><label><input type="checkbox" name="taxel_ai_builder_settings[proxy_requests]" value="1" <?php checked($s['proxy_requests'], '1'); ?> /> درخواست‌ها را از سرور وردپرس به پلتفرم بفرست (کلید API مخفی می‌ماند)</label></td></tr>
                    <tr><th scope="row">عنوان</th><td><input type="text" class="regular-text" name="taxel_ai_builder_settings[title]" value="<?php echo esc_attr($s['title']); ?>" /></td></tr>
                    <tr><th scope="row">زیرعنوان</th><td><input type="text" class="large-text" name="taxel_ai_builder_settings[subtitle]" value="<?php echo esc_attr($s['subtitle']); ?>" /></td></tr>
                    <tr><th scope="row">متن راهنمای باکس</th><td><input type="text" class="large-text" name="taxel_ai_builder_settings[placeholder]" value="<?php echo esc_attr($s['placeholder']); ?>" /></td></tr>
                    <tr><th scope="row">متن دکمه</th><td><input type="text" class="regular-text" name="taxel_ai_builder_settings[button_text]" value="<?php echo esc_attr($s['button_text']); ?>" /></td></tr>
                    <tr><th scope="row">رنگ اصلی</th><td><input type="color" name="taxel_ai_builder_settings[accent]" value="<?php echo esc_attr($s['accent']); ?>" /> <input type="color" name="taxel_ai_builder_settings[accent2]" value="<?php echo esc_attr($s['accent2']); ?>" /> <span class="description">گرادیان آبی پیش‌فرض</span></td></tr>
                    <tr><th scope="row">حالت</th><td><select name="taxel_ai_builder_settings[theme]"><option value="dark" <?php selected($s['theme'], 'dark'); ?>>تیره (پیشنهادی)</option><option value="light" <?php selected($s['theme'], 'light'); ?>>روشن</option></select></td></tr>
                </table>
                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
            <hr />
            <h2>استفاده</h2>
            <ul style="list-style:disc;padding-right:20px">
                <li><code>[taxel_builder]</code> — باکس کامل با عنوان</li>
                <li><code>[taxel_builder compact="1"]</code> — فقط باکس ورودی</li>
                <li><code>[taxel_builder title="..." subtitle="..." placeholder="..." theme="light"]</code> — سفارشی‌سازی</li>
            </ul>
            <h2>پیش‌نمایش</h2>
            <?php echo do_shortcode('[taxel_builder]'); ?>
        </div>
        <?php
    }

    /* ------------------------------------------------------------------ */
    /* Assets + shortcode                                                  */
    /* ------------------------------------------------------------------ */

    public function register_assets()
    {
        wp_register_style('taxel-ai-builder', TAXEL_AI_BUILDER_URL . 'assets/css/taxel-builder.css', [], TAXEL_AI_BUILDER_VERSION);
        wp_register_script('taxel-ai-builder', TAXEL_AI_BUILDER_URL . 'assets/js/taxel-builder.js', [], TAXEL_AI_BUILDER_VERSION, true);
    }

    public function register_shortcode()
    {
        add_shortcode('taxel_builder', [$this, 'render_shortcode']);
    }

    public function render_shortcode($atts = [])
    {
        $s = self::get_settings();
        $atts = shortcode_atts([
            'title'       => $s['title'],
            'subtitle'    => $s['subtitle'],
            'placeholder' => $s['placeholder'],
            'button'      => $s['button_text'],
            'theme'       => $s['theme'],
            'compact'     => '0',
            'accent'      => $s['accent'],
            'accent2'     => $s['accent2'],
        ], $atts, 'taxel_builder');

        wp_enqueue_style('taxel-ai-builder');
        wp_enqueue_script('taxel-ai-builder');

        $use_proxy = $s['proxy_requests'] === '1';
        wp_localize_script('taxel-ai-builder', 'TaxelBuilderConfig', [
            'endpoint'    => $use_proxy ? esc_url_raw(rest_url('taxel/v1')) : esc_url_raw($s['platform_url'] . '/api/intake'),
            'proxy'       => $use_proxy,
            'nonce'       => wp_create_nonce('wp_rest'),
            'apiKey'      => $use_proxy ? '' : $s['api_key'],
            'platformUrl' => esc_url_raw($s['platform_url']),
            'site'        => home_url(),
            'i18n'        => [
                'thinking'   => 'دارم می‌فهمم چی می‌خوای…',
                'nextStep'   => 'ادامه',
                'back'       => 'قبلی',
                'finish'     => 'دریافت سایت من',
                'error'      => 'خطایی رخ داد. دوباره تلاش کنید.',
                'stage'      => 'مرحله',
                'of'         => 'از',
                'detected'   => 'متوجه شدم!',
                'template'   => 'قالب پیشنهادی',
                'ready'      => 'همه چیز آماده است! برای دریافت سایت به تاکسل می‌روید.',
                'redirecting'=> 'در حال انتقال به تاکسل…',
                'examples'   => ['سایت نوبت‌دهی برای مطب پوست', 'فروشگاه برای پیج اینستاگرام مانتو', 'داروخانه آنلاین با ارسال دارو', 'فروشگاه عطر و ادکلن اورجینال', 'فروشگاه لوازم جانبی موبایل'],
            ],
        ]);

        $id = 'taxel-builder-' . wp_unique_id();
        $style = sprintf('--txl-accent:%s;--txl-accent2:%s;', esc_attr($atts['accent']), esc_attr($atts['accent2']));
        ob_start();
        ?>
        <div id="<?php echo esc_attr($id); ?>" class="taxel-builder taxel-theme-<?php echo esc_attr($atts['theme']); ?> <?php echo $atts['compact'] === '1' ? 'is-compact' : ''; ?>" style="<?php echo $style; ?>" dir="rtl" data-taxel-builder>
            <div class="taxel-orb taxel-orb-a"></div>
            <div class="taxel-orb taxel-orb-b"></div>
            <div class="taxel-inner">
                <?php if ($atts['compact'] !== '1') : ?>
                <div class="taxel-head">
                    <span class="taxel-badge"><span class="taxel-badge-dot"></span> هوش مصنوعی تاکسل</span>
                    <h3 class="taxel-title"><?php echo esc_html($atts['title']); ?></h3>
                    <p class="taxel-subtitle"><?php echo esc_html($atts['subtitle']); ?></p>
                </div>
                <?php endif; ?>
                <div class="taxel-stage" data-stage="prompt">
                    <form class="taxel-form" data-taxel-form>
                        <div class="taxel-input-wrap">
                            <span class="taxel-spark" aria-hidden="true">✦</span>
                            <textarea class="taxel-input" rows="1" placeholder="<?php echo esc_attr($atts['placeholder']); ?>" data-taxel-input required></textarea>
                            <button type="submit" class="taxel-btn" data-taxel-submit>
                                <span class="taxel-btn-label"><?php echo esc_html($atts['button']); ?></span>
                                <span class="taxel-btn-arrow" aria-hidden="true">←</span>
                            </button>
                        </div>
                        <div class="taxel-typewriter" data-taxel-typewriter aria-hidden="true"></div>
                    </form>
                    <div class="taxel-chips" data-taxel-chips></div>
                </div>
                <div class="taxel-stage" data-stage="questions" hidden></div>
                <div class="taxel-stage" data-stage="done" hidden></div>
                <div class="taxel-error" data-taxel-error hidden></div>
                <div class="taxel-footer">
                    <span>پرداخت امن · قالب‌های اختصاصی · دستیار هوشمند فروش</span>
                    <a href="<?php echo esc_url($s['platform_url']); ?>" target="_blank" rel="noopener">Powered by Taxel</a>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /* ------------------------------------------------------------------ */
    /* REST proxy (keeps the API key server-side)                          */
    /* ------------------------------------------------------------------ */

    public function register_rest_routes()
    {
        register_rest_route('taxel/v1', '/start', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_start'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('taxel/v1', '/answer', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_answer'],
            'permission_callback' => '__return_true',
        ]);
    }

    private function forward($path, $payload)
    {
        $s = self::get_settings();
        $headers = ['Content-Type' => 'application/json'];
        if (!empty($s['api_key'])) {
            $headers['X-Taxel-Key'] = $s['api_key'];
        }
        $res = wp_remote_post($s['platform_url'] . '/api/intake/' . $path, [
            'timeout' => 30,
            'headers' => $headers,
            'body'    => wp_json_encode($payload),
        ]);
        if (is_wp_error($res)) {
            return new WP_REST_Response(['error' => 'اتصال به تاکسل برقرار نشد'], 502);
        }
        $code = wp_remote_retrieve_response_code($res);
        $body = json_decode(wp_remote_retrieve_body($res), true);
        return new WP_REST_Response(is_array($body) ? $body : ['error' => 'پاسخ نامعتبر'], $code ? $code : 500);
    }

    public function rest_start(WP_REST_Request $req)
    {
        $prompt = sanitize_textarea_field((string) $req->get_param('prompt'));
        if (mb_strlen($prompt) < 5) {
            return new WP_REST_Response(['error' => 'لطفاً توضیح دهید چه چیزی می‌خواهید بسازید'], 400);
        }
        // light rate limit per IP
        $ip  = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'na';
        $key = 'taxel_rl_' . md5($ip);
        $n   = (int) get_transient($key);
        if ($n > 20) {
            return new WP_REST_Response(['error' => 'درخواست‌های زیاد؛ لطفاً کمی بعد تلاش کنید'], 429);
        }
        set_transient($key, $n + 1, 10 * MINUTE_IN_SECONDS);

        return $this->forward('start', [
            'prompt'    => $prompt,
            'site'      => home_url(),
            'pageUrl'   => esc_url_raw((string) $req->get_param('pageUrl')),
            'visitorId' => sanitize_text_field((string) $req->get_param('visitorId')),
        ]);
    }

    public function rest_answer(WP_REST_Request $req)
    {
        $token   = sanitize_text_field((string) $req->get_param('token'));
        $answers = $req->get_param('answers');
        if (!$token || !is_array($answers)) {
            return new WP_REST_Response(['error' => 'درخواست نامعتبر'], 400);
        }
        $clean = [];
        foreach ($answers as $k => $v) {
            $k = sanitize_key($k);
            $clean[$k] = is_array($v) ? array_map('sanitize_text_field', $v) : sanitize_text_field((string) $v);
        }
        return $this->forward('answer', ['token' => $token, 'answers' => $clean]);
    }
}

class Taxel_AI_Builder_Widget extends WP_Widget
{
    public function __construct()
    {
        parent::__construct('taxel_ai_builder_widget', 'Taxel AI Builder', ['description' => 'باکس «فقط بگو چی می‌خوای بسازیم»']);
    }
    public function widget($args, $instance)
    {
        echo $args['before_widget'];
        echo do_shortcode('[taxel_builder compact="' . (!empty($instance['compact']) ? '1' : '0') . '"]');
        echo $args['after_widget'];
    }
    public function form($instance)
    {
        $compact = !empty($instance['compact']);
        echo '<p><label><input type="checkbox" name="' . esc_attr($this->get_field_name('compact')) . '" value="1" ' . checked($compact, true, false) . ' /> حالت فشرده</label></p>';
    }
    public function update($new, $old)
    {
        return ['compact' => !empty($new['compact']) ? 1 : 0];
    }
}

Taxel_AI_Builder::instance();
