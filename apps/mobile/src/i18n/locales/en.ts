export const en = {
  appName: "GRWM",
  navigation: {
    welcome: "Welcome",
    login: "Login",
    signUp: "Sign Up",
    language: "Language",
    country: "Country",
    privacy: "Privacy",
    onboarding: "Onboarding",
    wardrobeSetupIntro: "Wardrobe Setup",
    wardrobeSetupPrivacy: "Wardrobe Privacy",
    wardrobeSetupCategories: "Wardrobe Categories",
    wardrobeSetupStyle: "Wardrobe Style",
    wardrobeSetupSummary: "Wardrobe Summary",
    wardrobe: "Wardrobe",
    today: "Today's Outfit",
    settings: "Settings"
  },
  screens: {
    welcome: {
      title: "Get ready with confidence",
      body: "Build your wardrobe profile, set your style preferences, and prepare for daily outfit recommendations.",
      action: "Start"
    },
    login: {
      title: "Welcome back",
      body: "Sign in with the email and password used for your GRWM account.",
      emailLabel: "Email",
      passwordLabel: "Password",
      action: "Log in",
      loadingAction: "Logging in..."
    },
    signUp: {
      title: "Create your GRWM account",
      body: "Create an email and password account, then review privacy consent before using protected GRWM screens.",
      displayNameLabel: "Display name",
      emailLabel: "Email",
      passwordLabel: "Password",
      action: "Create account",
      loadingAction: "Creating account..."
    },
    language: {
      title: "Choose language",
      body: "English is the launch language, with multilingual structure ready from day one.",
      option: "English"
    },
    country: {
      title: "Choose country",
      body: "Country selection will help prepare weather, locale, and privacy settings.",
      option: "United Kingdom"
    },
    privacy: {
      title: "Privacy consent",
      body: "Choose how GRWM may use sensitive wardrobe, style, location, recommendation, analytics, and email data.",
      requiredLabel: "Required before feature use",
      optionalLabel: "Optional",
      action: "Save consent",
      loadingAction: "Saving consent..."
    },
    onboarding: {
      title: "Start wardrobe setup",
      body: "Set up a private wardrobe profile before photo upload becomes available.",
      action: "Set up wardrobe"
    },
    wardrobeSetupIntro: {
      progress: "Step 1 of 5",
      title: "Style what you already own",
      body: "GRWM will help you build outfits from clothes you already have. This setup prepares your wardrobe profile without uploading photos.",
      privateTitle: "Your wardrobe is private.",
      privateBody: "Your setup choices are saved to your account and are not public.",
      consentTitle: "Analysis needs permission",
      consentBody: "GRWM will not analyse wardrobe photos unless you give permission. Photo upload will be added in the next step.",
      action: "Continue",
      loadingAction: "Starting setup...",
      error: "Unable to start wardrobe setup."
    },
    wardrobePrivacyExplainer: {
      progress: "Step 2 of 5",
      title: "Wardrobe privacy",
      body: "Choose with confidence. Your wardrobe information is private and future photo analysis is controlled by consent.",
      privateTitle: "Private wardrobe storage",
      privateBody: "Future wardrobe photos will be stored privately under your account. Photo upload is not active yet.",
      sharingTitle: "No public sharing",
      sharingBody: "GRWM does not make your wardrobe public or share it with other users.",
      consentTitle: "Consent stays in your control",
      consentBody: "GRWM will not analyse wardrobe photos unless you give permission. You can change privacy choices in Settings.",
      settingsAction: "Review Settings privacy",
      action: "Choose categories"
    },
    wardrobeSetupCategories: {
      progress: "Step 3 of 5",
      title: "What will you add later?",
      body: "Pick the clothing types you expect to add when wardrobe upload is ready.",
      categoryLabels: {
        tops: "Tops",
        trousers: "Trousers",
        jeans: "Jeans",
        skirts: "Skirts",
        dresses: "Dresses",
        jackets: "Jackets",
        coats: "Coats",
        blazers: "Blazers",
        shoes: "Shoes",
        bags: "Bags",
        jewellery: "Jewellery",
        belts: "Belts",
        scarves: "Scarves",
        hats: "Hats",
        activewear: "Activewear",
        workwear: "Workwear",
        occasion_wear: "Occasion wear",
        traditional_cultural_clothing: "Traditional or cultural clothing"
      },
      action: "Save categories",
      loadingAction: "Saving categories...",
      loadError: "Unable to load wardrobe categories.",
      error: "Unable to save wardrobe categories."
    },
    wardrobeSetupStyle: {
      progress: "Step 4 of 5",
      title: "Style basics",
      body: "Add simple wardrobe preferences so GRWM can later guide outfits around your real life.",
      dressCodeTitle: "Typical dress code",
      dressCodeLabels: {
        casual: "Casual",
        smart_casual: "Smart casual",
        business_casual: "Business casual",
        formal: "Formal",
        varied: "Varied"
      },
      formalityTitle: "Preferred outfit formality",
      formalityLabels: {
        relaxed: "Relaxed",
        balanced: "Balanced",
        polished: "Polished",
        formal: "Formal"
      },
      favouriteColoursTitle: "Favourite colour families",
      avoidColoursTitle: "Colours to avoid",
      colourLabels: {
        black: "Black",
        white: "White",
        grey: "Grey",
        navy: "Navy",
        blue: "Blue",
        green: "Green",
        red: "Red",
        pink: "Pink",
        purple: "Purple",
        yellow: "Yellow",
        orange: "Orange",
        brown: "Brown",
        cream: "Cream",
        metallics: "Metallics",
        pastels: "Pastels",
        brights: "Brights",
        neutrals: "Neutrals"
      },
      modestyTitle: "Modesty preference",
      modestyLabels: {
        no_preference: "No preference",
        more_coverage: "More coverage",
        high_coverage: "High coverage",
        varies: "Varies"
      },
      workwearTitle: "Workwear relevance",
      occasionwearTitle: "Occasionwear relevance",
      relevanceLabels: {
        not_relevant: "Not relevant",
        sometimes: "Sometimes",
        often: "Often"
      },
      action: "Review setup",
      loadingAction: "Saving style basics...",
      loadError: "Unable to load style basics.",
      error: "Unable to save style basics."
    },
    wardrobeSetupSummary: {
      progress: "Step 5 of 5",
      title: "Review wardrobe setup",
      body: "Confirm your setup choices. You can update these later before uploads are enabled.",
      privacyTitle: "Privacy reminder",
      privacyBody: "Your wardrobe is private. Photo upload will be added in the next step, and AI analysis will only happen with consent.",
      categoriesTitle: "Categories",
      emptyCategories: "No categories selected yet.",
      styleTitle: "Style basics",
      notSetLabel: "Not set",
      editCategoriesAction: "Edit categories",
      editStyleAction: "Edit style basics",
      action: "Complete setup",
      loadingAction: "Completing setup...",
      loadError: "Unable to load wardrobe setup summary.",
      error: "Unable to complete wardrobe setup."
    },
    wardrobe: {
      title: "Wardrobe",
      body: "Your wardrobe home is ready for setup. Real image upload is not active yet.",
      emptyStateTitle: "Photo upload will be added in the next step.",
      emptyStateBody: "Use setup now to tell GRWM what you plan to add later. The app will not open an image picker or upload wardrobe files in this phase.",
      setupStatusLabel: "Wardrobe setup status",
      setupStatusLabels: {
        not_started: "Not started",
        in_progress: "In progress",
        completed: "Completed"
      },
      setupAction: "Set up wardrobe",
      reviewSetupAction: "Review wardrobe setup",
      addSoonAction: "Add wardrobe item soon",
      setupLoadError: "Unable to load wardrobe setup status."
    },
    today: {
      title: "Today's outfit",
      body: "Weather-aware daily outfit recommendations will appear here in a later phase."
    },
    settings: {
      title: "Settings",
      body: "Privacy, language, country, account, and notification controls will live here.",
      privacyTitle: "Privacy controls",
      consentStatusTitle: "Current consent status",
      consentOnLabel: "On",
      consentOffLabel: "Off",
      saveConsentAction: "Save privacy updates",
      savingConsentAction: "Saving updates...",
      deletionAction: "Request account and data deletion",
      deletionRequestedTitle: "Your deletion request has been submitted.",
      accountDeletionCopy: "GRWM will process deletion securely. You may be signed out after deletion is completed.",
      authStateLabel: "Auth state",
      logoutAction: "Log out"
    },
    loading: {
      title: "Checking your account",
      body: "GRWM is confirming your Firebase Authentication session."
    }
  }
} as const;
