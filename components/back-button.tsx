import { Href, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

type BackButtonProps = {
  fallback?: Href;
  onPress?: () => void;
  style?: ViewStyle;
  light?: boolean;
};

export function BackButton({ fallback = "/(tabs)", onPress, style, light = false }: BackButtonProps) {
  const router = useRouter();

  const voltar = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallback);
  };

  return (
    <TouchableOpacity
      accessibilityLabel="Voltar"
      activeOpacity={0.75}
      onPress={voltar}
      style={[styles.button, light ? styles.buttonLight : styles.buttonDark, style]}>
      <IconSymbol
        name="chevron.left"
        size={18}
        color="#174b33"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonDark: {
    backgroundColor: "rgba(204, 232, 215, 0.96)",
    borderColor: "rgba(47, 93, 69, 0.22)",
  },
  buttonLight: {
    backgroundColor: "rgba(204, 232, 215, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
});
