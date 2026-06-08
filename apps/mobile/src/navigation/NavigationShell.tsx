import { StatusBar } from "expo-status-bar";
import { type ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";

import { getMessages } from "../i18n";
import {
  canAccessMobileRoute,
  createPlaceholderSignedInAuthState,
  createSignedOutAuthState,
  toMobileAuthState
} from "../auth/authState";
import { listenToAuthState } from "../auth/authService";
import { CountrySelectionScreen } from "../screens/CountrySelectionScreen";
import { LanguageSelectionScreen } from "../screens/LanguageSelectionScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OnboardingStartScreen } from "../screens/OnboardingStartScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { TodaysOutfitScreen } from "../screens/TodaysOutfitScreen";
import { WardrobeHomeScreen } from "../screens/WardrobeHomeScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { darkTheme, lightTheme } from "../theme";
import { initialMobileRoute, mobileRoutes, type MobileRouteId } from "./routes";
import type { MobileScreenProps } from "./types";

type ScreenComponent = (props: MobileScreenProps) => ReactElement;

const screenComponents: Record<MobileRouteId, ScreenComponent> = {
  welcome: WelcomeScreen,
  login: LoginScreen,
  signUp: SignUpScreen,
  language: LanguageSelectionScreen,
  country: CountrySelectionScreen,
  onboarding: OnboardingStartScreen,
  wardrobe: WardrobeHomeScreen,
  today: TodaysOutfitScreen,
  settings: SettingsScreen
};

export function NavigationShell() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const messages = getMessages();
  const [activeRoute, setActiveRoute] = useState<MobileRouteId>(initialMobileRoute);
  const [authState, setAuthState] = useState(createSignedOutAuthState);
  const ActiveScreen = screenComponents[activeRoute];

  useEffect(() => listenToAuthState((user) => setAuthState(toMobileAuthState(user))), []);

  const navigate = useCallback(
    (routeId: MobileRouteId) => {
      setActiveRoute(canAccessMobileRoute(routeId, authState) ? routeId : "login");
    },
    [authState]
  );

  const completeAuthPlaceholder = useCallback((routeId: MobileRouteId = "wardrobe") => {
    setAuthState(createPlaceholderSignedInAuthState());
    setActiveRoute(routeId);
  }, []);

  const logoutPlaceholder = useCallback(() => {
    setAuthState(createSignedOutAuthState());
    setActiveRoute("login");
  }, []);

  const screenProps = useMemo(
    () => ({ authState, completeAuthPlaceholder, logoutPlaceholder, messages, navigate, theme }),
    [authState, completeAuthPlaceholder, logoutPlaceholder, messages, navigate, theme]
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
      <View style={styles.content}>
        <ActiveScreen {...screenProps} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.nav, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        {mobileRoutes.map((route) => {
          const isActive = route.id === activeRoute;

          return (
            <Pressable
              accessibilityRole="button"
              key={route.id}
              onPress={() => navigate(route.id)}
              style={[
                styles.navButton,
                {
                  backgroundColor: isActive ? theme.accent : theme.surfaceMuted,
                  borderColor: theme.border
                }
              ]}
            >
              <Text style={[styles.navLabel, { color: isActive ? theme.accentText : theme.text }]}>
                {messages.navigation[route.labelKey]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  nav: {
    borderTopWidth: 1,
    flexGrow: 0,
    maxHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  navButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    marginRight: 8,
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 12
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "700"
  },
  safeArea: {
    flex: 1
  }
});
