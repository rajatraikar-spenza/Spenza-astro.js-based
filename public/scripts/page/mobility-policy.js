/* Custom site scripts extracted from the WordPress page "mobility-policy".
   Regenerate with: npm run wp:scripts */

/* --- snippet 1 --- */
try {
(function(){
var gf_global = {"gf_currency_config":{"name":"U.S. Dollar","symbol_left":"$","symbol_right":"","symbol_padding":"","thousand_separator":",","decimal_separator":".","decimals":2,"code":"USD"},"base_url":"https:\/\/preprod.spenza.com\/wp-content\/plugins\/gravityforms","number_formats":[],"spinnerUrl":"https:\/\/preprod.spenza.com\/wp-content\/plugins\/gravityforms\/images\/spinner.svg","version_hash":"c6f3bcef6a3e7996165141237f904788","strings":{"newRowAdded":"New row added.","rowRemoved":"Row removed","formSaved":"The form has been saved.  The content contains the link to return and complete the form."}};				var gf_vars = {"active":"Active","inactive":"Inactive","save":"Save","update":"Update","previousLabel":"Previous","selectFormat":"Select a format","column":"Column","editToViewAll":"5 of %d items shown. Edit field to view all","selectAll":"Select All","enterValue":"Enter a value","formTitle":"Untitled Form","formDescription":"We would love to hear from you! Please fill out this form and we will get in touch with you shortly.","formConfirmationMessage":"Thanks for contacting us! We will get in touch with you shortly.","buttonText":"Submit","buttonDescription":"The submit button for this form","loading":"Loading...","thisFieldIf":"this field if","thisSectionIf":"this section if","thisPage":"this page if","thisFormButton":"this form button if","show":"Show","hide":"Hide","enable":"Enable","disable":"Disable","enabled":"Enabled","disabled":"Disabled","configure":"Configure","conditional_logic_text":"Conditional Logic","conditional_logic_desc":"Conditional logic allows you to change what the user sees depending on the fields they select.","conditional_logic_a11y":"Adding conditional logic to the form submit button could cause usability problems for some users and negatively impact the accessibility of your form. Learn more about button conditional logic in our <a href=\"https:\/\/docs.gravityforms.com\/field-accessibility-warning\/\" target=\"_blank\" rel=\"noopener\">documentation<\/a>.","page":"Page","next_button":"Next Button","button":"Submit Button","all":"All","any":"Any","ofTheFollowingMatch":"of the following match:","is":"is","isNot":"is not","greaterThan":"greater than","lessThan":"less than","contains":"contains","startsWith":"starts with","endsWith":"ends with","emptyChoice":"Empty (no choices selected)","alertLegacyMode":"This form has legacy markup enabled and doesn\u2019t support field resizing within the editor. Please disable legacy markup in the form settings to enable live resizing.","thisConfirmation":"Use this confirmation if","thisNotification":"Send this notification if","confirmationSave":"Save","confirmationSaving":"Saving...","confirmationAreYouSure":"Are you sure you wish to cancel these changes?","confirmationIssueSaving":"There was an issue saving this confirmation.","confirmationConfirmDelete":"Are you sure you wish to delete this confirmation?","confirmationIssueDeleting":"There was an issue deleting this confirmation.","confirmationConfirmDiscard":"There are unsaved changes to the current confirmation. Would you like to discard these changes?","confirmationDefaultName":"Untitled Confirmation","confirmationDefaultMessage":"Thanks for contacting us! We will get in touch with you shortly.","confirmationInvalidPageSelection":"Please select a page.","confirmationInvalidRedirect":"Please enter a URL.","confirmationInvalidName":"Please enter a confirmation name.","confirmationDeleteField":"Warning! Deleting this field will also delete all entry data associated with it. 'Cancel' to stop. 'OK' to delete.","conditionalLogicDependency":"Warning! This form contains conditional logic dependent upon this field. Deleting this field will deactivate those conditional logic rules and also delete all entry data associated with the field. 'OK' to delete, 'Cancel' to abort.","conditionalLogicDependencyChoice":"This form contains conditional logic dependent upon this choice. Are you sure you want to delete this choice? 'OK' to delete, 'Cancel' to abort.","conditionalLogicDependencyChoiceEdit":"This form contains conditional logic dependent upon this choice. Are you sure you want to modify this choice? 'OK' to delete, 'Cancel' to abort.","conditionalLogicDependencyAdminOnly":"This form contains conditional logic dependent upon this field. Are you sure you want to mark this field as Admin Only? 'OK' to confirm, 'Cancel' to abort.","mergeTagsText":"Insert Merge Tags","baseUrl":"https:\/\/preprod.spenza.com\/wp-content\/plugins\/gravityforms","gf_currency_config":{"name":"U.S. Dollar","symbol_left":"$","symbol_right":"","symbol_padding":"","thousand_separator":",","decimal_separator":".","decimals":2,"code":"USD"},"otherChoiceValue":"Other","isFormTrash":false,"currentlyAddingField":false,"visibilityOptions":[{"label":"Visible","value":"visible","description":"Default option. The field is visible when viewing the form."},{"label":"Hidden","value":"hidden","description":"The field is hidden when viewing the form. Useful when you require the functionality of this field but do not want the user to be able to see this field."},{"label":"Administrative","value":"administrative","description":"The field is only visible when administering submitted entries. The field is not visible or functional when viewing the form."}],"addFieldFilter":"Add a condition","removeFieldFilter":"Remove a condition","filterAndAny":"{0} of the following match:","customChoices":"Custom Choices","predefinedChoices":"Predefined Choices","fieldLabelAriaLabel":"{field_label} - {field_type}, jump to this field&#039;s settings","nameFieldDefaultPrefixes":[{"text":"Dr.","value":"Dr."},{"text":"Miss","value":"Miss"},{"text":"Mr.","value":"Mr."},{"text":"Mrs.","value":"Mrs."},{"text":"Ms.","value":"Ms."},{"text":"Mx.","value":"Mx."},{"text":"Prof.","value":"Prof."},{"text":"Rev.","value":"Rev."}]};
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 1 skipped:', e && e.message);
}

/* --- snippet 2 --- */
try {
(function(){
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        /* ===== YOUR ORIGINAL JS (UNCHANGED) ===== */

        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const closeIcon = document.getElementById('close-icon');

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-active');
                const active = mobileMenu.classList.contains('is-active');
                hamburgerIcon.style.display = active ? 'none' : 'block';
                closeIcon.style.display = active ? 'block' : 'none';
            });
        }

        const setupMobileSubmenu = (toggleId, submenuId) => {
            const toggle = document.getElementById(toggleId);
            const submenu = document.getElementById(submenuId);
            if (!toggle || !submenu) return;

            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                toggle.classList.toggle('submenu-is-open');
                submenu.classList.toggle('is-open');
            });
        };

        setupMobileSubmenu('mobile-product-toggle', 'mobile-product-submenu');
        setupMobileSubmenu('mobile-solutions-toggle', 'mobile-solutions-submenu');
        setupMobileSubmenu('mobile-resources-toggle', 'mobile-resources-submenu');
        setupMobileSubmenu('mobile-blog-toggle', 'mobile-blog-submenu');

        function setupDesktopMenu(trigger, panel) {
            if (!trigger || !panel) return;

            let timer;
            const show = () => {
                clearTimeout(timer);
                panel.classList.add('is-active');
            };
            const hide = () => {
                timer = setTimeout(() => panel.classList.remove('is-active'), 150);
            };

            trigger.addEventListener('mouseenter', show);
            panel.addEventListener('mouseenter', show);
            trigger.addEventListener('mouseleave', hide);
            panel.addEventListener('mouseleave', hide);
        }

        setupDesktopMenu(
            document.getElementById('solutions-menu-trigger-area'),
            document.getElementById('solutions-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('resources-menu-trigger-area'),
            document.getElementById('resources-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('blog-menu-trigger-area'),
            document.getElementById('blog-menu-panel')
        );
        setupDesktopMenu(
            document.getElementById('product-menu-trigger-area'),
            document.getElementById('product-menu-panel')
        );
    });
})();
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 2 skipped:', e && e.message);
}

/* --- snippet 3 --- */
try {
(function(){
const lazyloadRunObserver = () => {
					const lazyloadBackgrounds = document.querySelectorAll( `.e-con.e-parent:not(.e-lazyloaded)` );
					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
						entries.forEach( ( entry ) => {
							if ( entry.isIntersecting ) {
								let lazyloadBackground = entry.target;
								if( lazyloadBackground ) {
									lazyloadBackground.classList.add( 'e-lazyloaded' );
								}
								lazyloadBackgroundObserver.unobserve( entry.target );
							}
						});
					}, { rootMargin: '200px 0px 200px 0px' } );
					lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 3 skipped:', e && e.message);
}

/* --- snippet 4 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", function () {

  const emailPopupOne = document.querySelector('#emailPopup-1');

  // Buttons
  const getStartedBtns = document.querySelectorAll('.get-started');

  let popupOpen = 0;

 function openPopup() {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'flex';
  }
  window.closePopupOne = function () {

    if (!emailPopupOne) return;

    emailPopupOne.style.display = 'none';
  }


  // =========================
  // CLOSE WHEN CLICK OUTSIDE
  // =========================
  if (emailPopupOne) {

    emailPopupOne.addEventListener('click', function (e) {

      if (e.target === this) {
        closePopupOne();
      }

    });

  }

  // =========================
  // .get-started BUTTON CLICK
  // =========================
  getStartedBtns.forEach(btn => {

    btn.addEventListener('click', function (e) {

      e.preventDefault();

      openPopup();

    });

  });

});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 4 skipped:', e && e.message);
}

/* --- snippet 5 --- */
try {
(function(){
document.addEventListener("DOMContentLoaded", () => {
  const mobileSubMenus = {
    products: {
      trigger: ".products-trigger",
      submenu: "#products-submenu",
      backBtn: ".products-back-btn",
    },

    solutions: {
      trigger: ".solutions-trigger",
      submenu: "#solutions-submenu",
      backBtn: ".solutions-back-btn",
    },

    resources: {
      trigger: ".resources-trigger",
      submenu: "#resources-submenu",
      backBtn: ".resources-back-btn",
    },

    blog: {
      trigger: ".blog-trigger",
      submenu: "#blog-submenu",
      backBtn: ".blog-back-btn",
    },

    caseStudies: {
      trigger: ".case-studies-trigger",
      submenu: "#case-studies-submenu",
      backBtn: ".case-studies-back-btn",
    },
  };

  Object.values(mobileSubMenus).forEach((menu) => {
    const trigger = document.querySelector(menu.trigger);
    const submenu = document.querySelector(menu.submenu);
    const backBtn = document.querySelector(menu.backBtn);

    // Open submenu
    trigger?.addEventListener("click", (e) => {
      e.preventDefault();

      submenu?.classList.add("active");
    });

    // Back to main menu
    backBtn?.addEventListener("click", (e) => {
      e.preventDefault();

      submenu?.classList.remove("active");
    });
  });
});
})();
} catch (e) {
  console.debug('[wp-page-script] snippet 5 skipped:', e && e.message);
}