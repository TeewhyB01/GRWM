export const en = {
  appName: "GRWM",
  navigation: {
    welcome: "Welcome",
    login: "Login",
    signUp: "Sign Up",
    language: "Language",
    country: "Country",
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
      body: "Firebase Authentication will power this sign-in flow in the next platform phase.",
      action: "Continue"
    },
    signUp: {
      title: "Create your GRWM account",
      body: "The account shell is ready for Firebase Authentication, privacy consent, and locale setup.",
      action: "Create account"
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
    onboarding: {
      title: "Start onboarding",
      body: "Style profile, wardrobe setup, and privacy consent will be collected here.",
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
      accountDeletionCopy: "Account deletion requests will remove or anonymize private profile, wardrobe, photo, and styling data after verification.",
      authStateLabel: "Auth state",
      logoutAction: "Log out"
    }
  }
} as const;
