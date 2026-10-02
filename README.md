# Saad Gym Center

A responsive training-club website built with HTML, CSS and JavaScript.

[Live website](https://scriptingwithsaad.github.io/Saad-Gym-Center-Re-Imagine/)

## Experience

- Navy and cobalt identity, self-hosted Barlow Condensed and Manrope fonts, responsive training photography.
- Eight original programs with category filters, an expandable program list and individual details.
- Three original monthly memberships with clear benefit comparisons and enquiries that remember the selected plan or program.
- Editable enquiry text, a copy action with a permission-failure fallback, and an explicit Instagram handoff. Messages are **not automatically sent**, and no booking or payment is claimed.
- Accessible mobile navigation, native dialogs, keyboard focus restoration, expandable FAQs and reduced-motion support.
- Instagram, Facebook and GitHub use the owner's supplied ScriptingWithSaad profiles.

The redesign removes the old placeholder address, phone number and unrelated email, as well as mismatched sample trainer identities. Existing plan prices and benefits are retained; visitors are asked to confirm current inclusions and availability with the team.

## Assets and loading

Responsive WebP derivatives reuse the original project photographs. All 21 image variants together total approximately 872 KB; the browser selects an appropriate size and loads below-the-fold images lazily. Original images remain in `assets/images` as source files. Font files are self-hosted, with their OFL licenses in `assets/fonts`. There are no required third-party scripts, icon libraries or font stylesheets.

CSS and JavaScript filenames contain content hashes, preventing old browser caches from mixing releases. Keep published hashed assets available for cached HTML.

## Development

```sh
python -m http.server 8769 --bind 127.0.0.1
```

After changing CSS or JavaScript, run:

```sh
python scripts/build_assets.py
node --check script/script.js
python scripts/verify_assets.py
git diff --check
```

Regenerate WebP variants with Pillow installed:

```sh
python scripts/optimize_images.py
```

`tests/browser.js` is a Playwright page function, executable through the browser tool with the local server running. It checks 13 viewport sizes from 320px to 1920px, heading layout, overflow, mobile navigation, all filters, program details, plan-to-enquiry context, editable clipboard success/failure paths, focus restoration, FAQs, rotation, touch input, reduced motion and a no-JavaScript fallback. Clipboard calls are stubbed during tests so the user's computer clipboard is preserved.

The previous gym website is [available here](https://scriptingwithsaad.github.io/Saad-Gym-Fitness-Landing-Page/).

Mobile program and enquiry dialogs fill the visible viewport up to 900px wide. Their close controls stay visible while the content scrolls, the background position is restored after closing, and reopened cards start at the top. `tests/mobile-dialogs.browser.js` covers eight portrait/landscape sizes and simulates viewport resizing while an enquiry is open.
