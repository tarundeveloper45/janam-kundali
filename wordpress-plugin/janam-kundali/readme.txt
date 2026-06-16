=== Janam Kundali Calculator ===
Contributors: yourname
Tags: astrology, kundali, vedic, birth chart, horoscope
Requires at least: 5.9
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed a fully-featured Vedic Janam Kundali (birth chart) calculator on any page or post.

== Description ==

**Janam Kundali Calculator** lets you embed a complete Vedic astrological birth-chart calculator on your WordPress site with a single shortcode.

Features:

* Accurate planet positions using JPL Keplerian ephemeris (1800–2050)
* Lahiri (Chitrapaksha) ayanamsa
* Whole-sign house system
* Rasi Chart (D-1) with North-Indian grid diagram
* Planetary positions table with nakshatra details
* Significant yoga detection
* Downloadable PDF report
* Fully responsive — works on mobile, tablet and desktop
* Geocoding with timezone detection (no API key required)

== Installation ==

1. Upload the `janam-kundali` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings → Janam Kundali** and paste the URL of your deployed app.
4. Add `[janam_kundali]` to any page or post.

== How to get the App URL ==

This plugin embeds your deployed Kundali calculator app.
Deploy the app on any hosting platform (Replit, Vercel, Railway, etc.)
and paste the resulting URL into **Settings → Janam Kundali → App URL**.

== Shortcode Reference == 

`[janam_kundali]`
Embed with defaults from Settings. Embed with defults 

`[janam_kundali height="1000"]`
Override the iframe height (pixels).

`[janam_kundali url="https://your-app.com" height="900"]`
Override both URL and height for one specific embed.

== Frequently Asked Questions ==

= Does it need an API key? =
No. The app uses the free Open-Meteo API for geocoding and all astronomical
calculations run in the browser or on the app server — no external API keys needed.

= Is CORS an issue? =
No. The shortcode embeds the app as an iframe, so the browser talks directly
to your app server. The optional WordPress REST proxy endpoint
(`POST /wp-json/janam-kundali/v1/generate`) is included for cases where you
want to call the API server-side.

= Can I self-host the calculation engine? =
Yes. The full source code is available. Deploy the Express API server and
the React front-end on any Node.js host, then paste the URL into settings.

== Changelog ==

= 1.0.0 =
* Initial release.
