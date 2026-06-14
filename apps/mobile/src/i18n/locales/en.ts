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
      title: "Start onboarding",
      body: "Style profile, modesty, and weather preference placeholders are ready for the next onboarding phase.",
      action: "Open wardrobe"
    },
    wardrobe: {
      title: "Wardrobe",
      body: "Wardrobe upload and item organization will live here after Firebase Storage is configured."
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
