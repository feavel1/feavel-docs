Improve service utils

Create Studios page

Create Studios dashboard

<ytd-comment-thread-renderer class="style-scope ytd-item-section-renderer"><!--css-build:shady--><!--css_build_scope:ytd-comment-thread-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="comment-container" class="style-scope ytd-comment-thread-renderer">

  <div class="threadline style-scope ytd-comment-thread-renderer" hidden=""><div class="continuation style-scope ytd-comment-thread-renderer"></div></div>
  <div class="removed-placeholder style-scope ytd-comment-thread-renderer" hidden="">
    <yt-icon icon="WARNING_FILLED" class="style-scope ytd-comment-thread-renderer"><!--css-build:shady--><!--css_build_scope:yt-icon--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.core.yt_icon.yt.icon.css.js--><span class="yt-icon-shape style-scope yt-icon ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M12 4 2 20h20L12 4zm1 14h-2v-2h2v2zm-2-3v-5h2v5h-2z"></path></svg></div></span></yt-icon>
    <yt-formatted-string class="style-scope ytd-comment-thread-renderer" is-empty=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
  </div>
  <ytd-comment-view-model id="comment" class="style-scope ytd-comment-thread-renderer" style="--ytd-comment-paid-background-color: initial;"><!--css-build:shady--><!--css_build_scope:ytd-comment-view-model--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="paid-comment-background" class="style-scope ytd-comment-view-model"></div>
<div id="linked-comment-badge" class="style-scope ytd-comment-view-model"></div>

<div id="body" class="style-scope ytd-comment-view-model">
  
  <div id="author-thumbnail" class="style-scope ytd-comment-view-model">
    <button id="author-thumbnail-button" class="style-scope ytd-comment-view-model" aria-label="@Boris_Nedev">
      <yt-img-shadow fit="" height="40" width="40" class="style-scope ytd-comment-view-model no-transition" loaded="" style="background-color: transparent;"><!--css-build:shady--><!--css_build_scope:yt-img-shadow--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_img_shadow.yt.img.shadow.css.js--><img id="img" draggable="false" class="style-scope yt-img-shadow" alt="" height="40" width="40" src="https://yt3.ggpht.com/qUA7Y1yhbtHrHeiVCzLEB1bM8-hm8YjnYwjv6z3tN2mHEnJkCqiMdrWm7I7Ni2P2zGW-Yf0=s88-c-k-c0x00ffffff-no-rj"></yt-img-shadow>
    </button>
  </div>
  <div id="main" class="style-scope ytd-comment-view-model">
    <div id="header" class="style-scope ytd-comment-view-model">
      <div id="pinned-comment-badge" class="style-scope ytd-comment-view-model"></div>
      <div id="header-author" class="style-scope ytd-comment-view-model">
        
        <h3 class="style-scope ytd-comment-view-model">
          
          <a id="author-text" class="yt-simple-endpoint style-scope ytd-comment-view-model" href="/@Boris_Nedev">
            <span class=" style-scope ytd-comment-view-model style-scope ytd-comment-view-model"> @Boris_Nedev </span>
          </a>
        </h3>
        <span id="author-comment-badge" class="style-scope ytd-comment-view-model"></span>
        <span id="sponsor-comment-badge" class="style-scope ytd-comment-view-model"></span>
        <span dir="auto" id="published-time-text" class="style-scope ytd-comment-view-model">
          <a class="yt-simple-endpoint style-scope ytd-comment-view-model" href="/watch?v=nS9McwlWGzo&amp;lc=Ugw0Yj8xvGhcuC_GwNZ4AaABAg">
            12 hours ago
          </a>
        </span>
      </div>
    </div>
    
    <ytd-expander id="expander" max-number-of-lines="4" class="style-scope ytd-comment-view-model" collapsed="" should-use-number-of-lines="" style="--ytd-expander-max-lines: 4;"><!--css-build:shady--><!--css_build_scope:ytd-expander--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="content" class="style-scope ytd-expander">
  
  <yt-pdg-comment-chip-renderer id="paid-comment-chip" slot="content" class="style-scope ytd-comment-view-model" hidden=""><!--css-build:shady--><!--css_build_scope:yt-pdg-comment-chip-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.renderers.pdg.yt_pdg_comment_chip_renderer.yt.pdg.comment.chip.renderer.css.js--><div id="comment-chip-container" class="style-scope yt-pdg-comment-chip-renderer"><yt-icon class="style-scope yt-pdg-comment-chip-renderer"><!--css-build:shady--><!--css_build_scope:yt-icon--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.core.yt_icon.yt.icon.css.js--></yt-icon><span id="comment-chip-price" class="style-scope yt-pdg-comment-chip-renderer">  </span></div></yt-pdg-comment-chip-renderer><yt-attributed-string id="content-text" slot="content" user-input="" class="style-scope ytd-comment-view-model"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-pre-wrap" dir="auto" role="text">We need a saparate Tal series. This guys is one of the greatest people ever.</span></yt-attributed-string>
</div>

<tp-yt-paper-button id="less" aria-expanded="true" noink="" class="style-scope ytd-expander" hidden="" style-target="host" role="button" tabindex="0" animated="" elevation="0" aria-disabled="false"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-button--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_button.tp.yt.paper.button.css.js-->
<span class="less-button style-scope ytd-comment-view-model" slot="less-button">Show less</span>

</tp-yt-paper-button>
<tp-yt-paper-button id="more" aria-expanded="false" noink="" class="style-scope ytd-expander" style-target="host" role="button" tabindex="0" animated="" elevation="0" aria-disabled="false" hidden=""><!--css-build:shady--><!--css_build_scope:tp-yt-paper-button--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_button.tp.yt.paper.button.css.js-->
  <span class="more-button style-scope ytd-comment-view-model" slot="more-button">Read more</span>

</tp-yt-paper-button>

</ytd-expander>
    <yt-attributed-string id="error-text" class="style-scope ytd-comment-view-model" hidden=""></yt-attributed-string>
    <ytd-tri-state-button-view-model class="translate-button style-scope ytd-comment-view-model" state="untoggled" hidden=""><!--css-build:shady--><!--css_build_scope:ytd-tri-state-button-view-model--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><tp-yt-paper-button noink="" class="style-scope ytd-tri-state-button-view-model" style-target="host" role="button" tabindex="0" animated="" elevation="0" aria-disabled="false"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-button--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_button.tp.yt.paper.button.css.js-->


</tp-yt-paper-button></ytd-tri-state-button-view-model>
<ytd-comment-engagement-bar id="action-buttons" class="style-scope ytd-comment-view-model"><!--css-build:shady--><!--css_build_scope:ytd-comment-engagement-bar--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="toolbar" class="style-scope ytd-comment-engagement-bar">

<ytd-toggle-button-renderer id="like-button" button-tooltip-position="bottom" icon-size="16" class="style-scope ytd-comment-engagement-bar" button-renderer="true"><!--css-build:shady--><yt-button-shape>
<button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-s yt-spec-button-shape-next--icon-button yt-spec-button-shape-next--override-small-size-icon yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-pressed="false" aria-label="Like this comment along with 490 other people" aria-disabled="false"><div aria-hidden="true" class="yt-spec-button-shape-next__icon"><span class="ytIconWrapperHost" style="width: 24px; height: 24px;"><span class="yt-icon-shape ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7 11H3v10h14.43c1.06 0 1.98-.67 2.19-1.61l1.34-6c.27-1.24-.78-2.39-2.19-2.39zM7 20H4v-8h3v8zm12.98-6.83-1.34 6c-.1.48-.61.83-1.21.83H8v-8.61l5.6-6.06c.19-.21.48-.33.78-.33.26 0 .5.11.63.3.07.1.15.26.09.47l-1.52 4.94-.4 1.29h5.58c.41 0 .8.17 1.03.46.13.15.26.4.19.71z"></path></svg></div></span></span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape>
<tp-yt-paper-tooltip fit-to-visible-bounds="" offset="8" role="tooltip" tabindex="-1" aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js--><div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
Like

</div>
</tp-yt-paper-tooltip>
</ytd-toggle-button-renderer>
  <span id="vote-count-middle" class="style-scope ytd-comment-engagement-bar">
    490
  </span>
  
  <ytd-toggle-button-renderer id="dislike-button" button-tooltip-position="bottom" icon-size="16" class="style-scope ytd-comment-engagement-bar" button-renderer="true"><!--css-build:shady--><yt-button-shape>
<button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-s yt-spec-button-shape-next--icon-button yt-spec-button-shape-next--override-small-size-icon yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-pressed="false" aria-label="Dislike this comment" aria-disabled="false"><div aria-hidden="true" class="yt-spec-button-shape-next__icon"><span class="ytIconWrapperHost" style="width: 24px; height: 24px;"><span class="yt-icon-shape ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M17 4H6.57c-1.07 0-1.98.67-2.19 1.61l-1.34 6C2.77 12.85 3.82 14 5.23 14h4.23l-1.52 4.94C7.62 19.97 8.46 21 9.62 21c.58 0 1.14-.24 1.52-.65L17 14h4V4h-4zm-6.6 15.67c-.19.21-.48.33-.78.33-.26 0-.5-.11-.63-.3-.07-.1-.15-.26-.09-.47l1.52-4.94.4-1.29H5.23c-.41 0-.8-.17-1.03-.46-.12-.15-.25-.4-.18-.72l1.34-6c.1-.47.61-.82 1.21-.82H16v8.61l-5.6 6.06zM20 13h-3V5h3v8z"></path></svg></div></span></span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape>
<tp-yt-paper-tooltip fit-to-visible-bounds="" offset="8" role="tooltip" tabindex="-1" aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js--><div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
  Dislike
</div>
</tp-yt-paper-tooltip>
</ytd-toggle-button-renderer>
  
  <div id="creator-heart" class="style-scope ytd-comment-engagement-bar"></div>
  
  <ytd-button-renderer id="reply-button-end" force-icon-button="true" class="style-scope ytd-comment-engagement-bar" button-renderer="" button-next=""><!--css-build:shady--><yt-button-shape><button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-s yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="Reply"><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">Reply</span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape><tp-yt-paper-tooltip offset="8" disable-upgrade=""></tp-yt-paper-tooltip></ytd-button-renderer>
</div>

<div id="reply-dialog" class="style-scope ytd-comment-engagement-bar"></div>
</ytd-comment-engagement-bar>
  </div>
  
  <div id="action-menu" class="style-scope ytd-comment-view-model">
    <ytd-menu-renderer class="style-scope ytd-comment-view-model" safe-area="" menu-active=""><!--css-build:shady--><!--css_build_scope:ytd-menu-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="top-level-buttons-computed" class="top-level-buttons style-scope ytd-menu-renderer"></div><div id="flexible-item-buttons" class="style-scope ytd-menu-renderer"></div><yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" style-target="button"><!--css-build:shady--><!--css_build_scope:yt-icon-button--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_icon_button.yt.icon.button.css.js--><button id="button" class="style-scope yt-icon-button" aria-label="Action menu"><yt-icon class="style-scope ytd-menu-renderer"><!--css-build:shady--><!--css_build_scope:yt-icon--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.core.yt_icon.yt.icon.css.js--><span class="yt-icon-shape style-scope yt-icon ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path></svg></div></span></yt-icon></button><yt-interaction id="interaction" class="circular style-scope yt-icon-button"><!--css-build:shady--><!--css_build_scope:yt-interaction--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_interaction.yt.interaction.css.js--><div class="stroke style-scope yt-interaction"></div><div class="fill style-scope yt-interaction"></div></yt-interaction></yt-icon-button><yt-button-shape id="button-shape" class="style-scope ytd-menu-renderer" disable-upgrade="" hidden=""></yt-button-shape></ytd-menu-renderer>
  </div>
</div>
<div id="edit-dialog" class="style-scope ytd-comment-view-model" hidden=""></div>
</ytd-comment-view-model>
</div>
<div id="replies" class="style-scope ytd-comment-thread-renderer">
  
    <ytd-comment-replies-renderer class="style-scope ytd-comment-thread-renderer" modern=""><!--css-build:shady--><!--css_build_scope:ytd-comment-replies-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="expander" class="style-scope ytd-comment-replies-renderer">
  <div class="expander-header style-scope ytd-comment-replies-renderer">
    <div class="more-button style-scope ytd-comment-replies-renderer" aria-expanded="false">
      <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
      <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
      <ytd-button-renderer id="more-replies" class="more-button style-scope ytd-comment-replies-renderer" noink="" button-renderer="" button-next=""><!--css-build:shady--><yt-button-shape><button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--align-by-text yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="9 replies"><div aria-hidden="true" class="yt-spec-button-shape-next__icon"><span class="ytIconWrapperHost" style="width: 24px; height: 24px;"><span class="yt-icon-shape ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="m18 9.28-6.35 6.35-6.37-6.35.72-.71 5.64 5.65 5.65-5.65z"></path></svg></div></span></span></div><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">9 replies</span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape><tp-yt-paper-tooltip offset="8" disable-upgrade=""></tp-yt-paper-tooltip></ytd-button-renderer>
    </div>
    <div class="less-button style-scope ytd-comment-replies-renderer" aria-expanded="true" hidden="">
      <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
      <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
      <ytd-button-renderer id="less-replies" class="less-button style-scope ytd-comment-replies-renderer" noink="" hidden="" button-renderer="" button-next=""><!--css-build:shady--><yt-button-shape><button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--align-by-text yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="9 replies"><div aria-hidden="true" class="yt-spec-button-shape-next__icon"><span class="ytIconWrapperHost" style="width: 24px; height: 24px;"><span class="yt-icon-shape ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M18.4 14.6 12 8.3l-6.4 6.3.8.8L12 9.7l5.6 5.7z"></path></svg></div></span></span></div><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">9 replies</span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape><tp-yt-paper-tooltip offset="8" disable-upgrade=""></tp-yt-paper-tooltip></ytd-button-renderer>
    </div>
  </div>
  <div id="expander-contents" class="style-scope ytd-comment-replies-renderer" hidden="">
    <div id="contents" class="style-scope ytd-comment-replies-renderer"><ytd-continuation-item-renderer class="style-scope ytd-comment-replies-renderer" engagement-panel="" ghost-card-experiment-enabled="" is-watch-page=""><!--css-build:shady--><!--css_build_scope:ytd-continuation-item-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="ghost-cards" class="style-scope ytd-continuation-item-renderer"></div>
<div id="ghost-comment-section" class="style-scope ytd-continuation-item-renderer"></div>
<tp-yt-paper-spinner id="spinner" class="style-scope ytd-continuation-item-renderer" aria-hidden="true" aria-label="loading" hidden=""><!--css-build:shady--><!--css_build_scope:tp-yt-paper-spinner--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_spinner.tp.yt.paper.spinner.css.js--><div id="spinnerContainer" class="  style-scope tp-yt-paper-spinner">
  <div class="spinner-layer layer-1 style-scope tp-yt-paper-spinner">
    <div class="circle-clipper left style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
    <div class="circle-clipper right style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
  </div>

  <div class="spinner-layer layer-2 style-scope tp-yt-paper-spinner">
    <div class="circle-clipper left style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
    <div class="circle-clipper right style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
  </div>

  <div class="spinner-layer layer-3 style-scope tp-yt-paper-spinner">
    <div class="circle-clipper left style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
    <div class="circle-clipper right style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
  </div>

  <div class="spinner-layer layer-4 style-scope tp-yt-paper-spinner">
    <div class="circle-clipper left style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
    <div class="circle-clipper right style-scope tp-yt-paper-spinner">
      <div class="circle style-scope tp-yt-paper-spinner"></div>
    </div>
  </div>
</div>
</tp-yt-paper-spinner>
<div id="button" class="style-scope ytd-continuation-item-renderer"></div>
</ytd-continuation-item-renderer></div>
    <div class="cont-button style-scope ytd-comment-replies-renderer" id="continuation"></div>
  </div>
</div>
<div id="teaser-replies" class="style-scope ytd-comment-replies-renderer"></div>
<div id="expanded-threads" class="style-scope ytd-comment-replies-renderer" hidden="">
  <ps-dom-repeat class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-repeat>
  <yt-sub-thread class="ytSubThreadHost ytSubThreadHasButton"><div class="ytSubThreadThreadline"><div class="ytSubThreadConnection"></div><div class="ytSubThreadContinuation"></div><div class="ytSubThreadShadow"></div></div><div class="ytSubThreadSubThreadContent">
    <div class="show-replies-button style-scope ytd-comment-replies-renderer">
      <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
      <ytd-button-renderer id="more-replies-sub-thread" aria-controls="expanded-threads" class="style-scope ytd-comment-replies-renderer" aria-expanded="true" button-renderer="" button-next=""><!--css-build:shady--><yt-button-shape><button class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--enable-backdrop-filter-experiment" title="" aria-label="9 replies"><div aria-hidden="true" class="yt-spec-button-shape-next__icon"><span class="ytIconWrapperHost" style="width: 24px; height: 24px;"><span class="yt-icon-shape ytSpecIconShapeHost"><div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="m18 9.28-6.35 6.35-6.37-6.35.72-.71 5.64 5.65 5.65-5.65z"></path></svg></div></span></span></div><div class="yt-spec-button-shape-next__button-text-content"><span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">9 replies</span></div><yt-touch-feedback-shape aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"><div class="yt-spec-touch-feedback-shape__stroke"></div><div class="yt-spec-touch-feedback-shape__fill"></div></yt-touch-feedback-shape></button></yt-button-shape><tp-yt-paper-tooltip offset="8" disable-upgrade=""></tp-yt-paper-tooltip></ytd-button-renderer>
    </div>
  </div></yt-sub-thread>
</div>
<div id="collapsed-threads" class="style-scope ytd-comment-replies-renderer" hidden="">
  <ps-dom-repeat class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-repeat>
  <ps-dom-if class="style-scope ytd-comment-replies-renderer"><template></template></ps-dom-if>
</div>
</ytd-comment-replies-renderer>
  <dom-if class="style-scope ytd-comment-thread-renderer"><template></template></dom-if>
</div>
<div class="thread-hitbox style-scope ytd-comment-thread-renderer" hidden=""></div>
</ytd-comment-thread-renderer>
