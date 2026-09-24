# Rhodium Libre hero title rebuild

24 September 2026. Three local heroes rebuilt across the completed MVNO and eSIM hubs. The preview manifest and all public/blog-media files were inventoried. All seven eSIM heroes reference published media URLs; none was restyled. Body figures were not changed.

The supplied TTF was downloaded once to /tmp/RhodiumLibre.ttf. Its internal name table identifies Rhodium Libre, Regular, version1.001. Chromium FontFace loaded that exact file and rasterized all-caps titles at64px, weight400. Sharp composited the title layer only and regenerated PNG/WebP pairs. An initial sharp/Pango render substituted a sans-serif and was rejected; it is not the committed output.

|Cluster|Local hero PNG, with matching WebP|New title|Measured cap height|Block width|320px visual result|
|---|---|---|---:|---:|---|
|M21|public/blog-media/mvne-explained/What-Is-an-MVNE-Services-and-Responsibilities.png|MVNE SERVICES / AND ROLES|45.06px|540.54px|PASS: both lines read clearly; slab serifs and inner strokes remain visible.|
|M19|public/blog-media/mvno-trends/MVNO-Trends-2026-Is-Free-Data-the-Future.png|MVNO TRENDS / IS DATA FREE?|44.80to45.06px|491.90px|PASS: both lines and question mark remain distinct without broken letterforms.|
|M12|public/blog-media/mvne-provider-selection/MVNE-Provider-Selection.png|CHOOSING AN / MVNE PROVIDER|45.06px|559.49px|PASS: the longer provider line remains legible and separate from the art panel.|

Each optimized PNG was scaled to320x180 and inspected individually. Two lines each,60px baseline spacing,x72. Titles were shortened instead of reducing type. Pixel comparison against the pre-rebuild committed PNGs found **zero changed pixels outside x72,y220,width600,height195** for every hero. Art panels, logos, LEARN MORE pills and spenza.com badges therefore remain pixel-identical in the PNGs. WebP twins are fresh lossy encodings of those PNGs.

Verification: npm run merge:qa,19/19PASS. npx astro check,0errors and0warnings; existing hints remain. No article prose, media URL, author or information-gain score changed. Rebuild committed separately from IoT work.
