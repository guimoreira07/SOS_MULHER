import {
  Text,
  View,
  Pressable,
  Modal,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useContacts } from "@/lib/contacts-context";
import { useColors } from "@/hooks/use-colors";
import { useLocation } from "@/hooks/use-location";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { contacts } = useContacts();
  const { getLocation, getLocationUrl } = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activated, setActivated] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Pulse animation for the SOS button
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 900 }),
        withTiming(0.5, { duration: 900 })
      ),
      -1,
      false
    );
  }, []);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleSOSPress = () => {
    if (contacts.length === 0) {
      Alert.alert(
        "Nenhum contato cadastrado",
        "Você precisa cadastrar pelo menos um contato de confiança antes de acionar o SOS.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cadastrar agora",
            onPress: () => router.push("/contacts" as any),
          },
        ]
      );
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSOS = async () => {
    setShowConfirm(false);
    setActivated(true);
    setGettingLocation(true);

    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Get location
    let locationUrl = "";
    try {
      const coords = await getLocation();
      if (coords) {
        locationUrl = getLocationUrl(coords);
      }
    } catch (e) {
      console.error("Erro ao obter localização:", e);
    }
    setGettingLocation(false);

    // Trigger SMS for each contact
    for (const contact of contacts) {
      let messageText =
        "🆘 EMERGÊNCIA! Preciso de ajuda urgente! Por favor me ligue ou vá ao meu encontro imediatamente.";
      if (locationUrl) {
        messageText += `\n\nMinha localização: ${locationUrl}`;
      }
      const message = encodeURIComponent(messageText);
      const smsUrl =
        Platform.OS === "ios"
          ? `sms:${contact.phone}&body=${message}`
          : `sms:${contact.phone}?body=${message}`;

      try {
        const canOpen = await Linking.canOpenURL(smsUrl);
        if (canOpen) {
          await Linking.openURL(smsUrl);
        }
      } catch (e) {
        console.error("Erro ao abrir SMS:", e);
      }
    }

    setTimeout(() => setActivated(false), 5000);
  };

  const handleCancelSOS = () => {
    setShowConfirm(false);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol name="shield.fill" size={28} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          SOS Mulher
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status message */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <IconSymbol
            name={
              contacts.length > 0
                ? "checkmark.circle.fill"
                : "exclamationmark.triangle.fill"
            }
            size={20}
            color={contacts.length > 0 ? colors.success : colors.warning}
          />
          <Text style={[styles.statusText, { color: colors.muted }]}>
            {contacts.length === 0
              ? "Nenhum contato cadastrado"
              : contacts.length === 1
              ? "1 contato de confiança ativo"
              : `${contacts.length} contatos de confiança ativos`}
          </Text>
        </View>

        {/* SOS Button area */}
        <View style={styles.sosArea}>
          <Text style={[styles.sosLabel, { color: colors.muted }]}>
            Em caso de perigo, pressione o botão
          </Text>

          {/* Pulse ring */}
          <View style={styles.buttonWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                { backgroundColor: colors.primary },
                pulseRingStyle,
              ]}
            />

            {/* SOS Button */}
            <Pressable
              onPress={handleSOSPress}
              style={({ pressed }) => [
                styles.sosButton,
                { backgroundColor: activated ? "#A01040" : colors.primary },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={styles.sosButtonText}>SOS</Text>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <Text style={[styles.sosSubLabel, { color: colors.muted }]}>
            {activated
              ? gettingLocation
                ? "📍 Obtendo localização..."
                : "✓ Alerta enviado aos seus contatos com localização"
              : "Aciona mensagem de emergência com sua localização"}
          </Text>

          {/* Quick call button */}
          {contacts.length > 0 && (
            <Pressable
              onPress={() => {
                const phoneUrl = `tel:${contacts[0].phone}`;
                Linking.openURL(phoneUrl).catch((e) =>
                  console.error("Erro ao ligar:", e)
                );
              }}
              style={({ pressed }) => [
                styles.quickCallBtn,
                { backgroundColor: colors.success },
                pressed && { opacity: 0.85 },
              ]}
            >
              <IconSymbol name="phone.fill" size={20} color="#FFFFFF" />
              <Text style={styles.quickCallBtnText}>
                Ligar para {contacts[0].name}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Contacts quick preview */}
        {contacts.length > 0 && (
          <View
            style={[
              styles.contactsPreview,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.contactsPreviewTitle, { color: colors.foreground }]}>
              Seus contatos de confiança
            </Text>
            {contacts.map((c) => (
              <View key={c.id} style={styles.contactRow}>
                <IconSymbol
                  name="person.crop.circle.fill"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.contactName, { color: colors.foreground }]}>
                  {c.name}
                </Text>
                <Text style={[styles.contactPhone, { color: colors.muted }]}>
                  {c.phone}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancelSOS}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.modalIconBg, { backgroundColor: "#FFF0F5" }]}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Confirmar Emergência
            </Text>
            <Text style={[styles.modalBody, { color: colors.muted }]}>
              Uma mensagem de SOS com sua localização será enviada para{" "}
              {contacts.length} {contacts.length === 1 ? "contato" : "contatos"} de
              confiança.
            </Text>
            <View style={styles.modalContacts}>
              {contacts.map((c) => (
                <Text
                  key={c.id}
                  style={[styles.modalContactItem, { color: colors.foreground }]}
                >
                  • {c.name} — {c.phone}
                </Text>
              ))}
            </View>
            <Pressable
              onPress={handleConfirmSOS}
              style={({ pressed }) => [
                styles.confirmBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.confirmBtnText}>ACIONAR SOS AGORA</Text>
            </Pressable>
            <Pressable
              onPress={handleCancelSOS}
              style={({ pressed }) => [
                styles.cancelBtn,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.muted }]}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sosArea: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  sosLabel: {
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonWrapper: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  sosButton: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#D72660",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 14,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 4,
  },
  sosSubLabel: {
    fontSize: 13,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
  },
  quickCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  quickCallBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  contactsPreview: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  contactsPreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  contactPhone: {
    fontSize: 13,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  modalContacts: {
    width: "100%",
    gap: 6,
  },
  modalContactItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  confirmBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
