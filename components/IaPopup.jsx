import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Componente genérico para PopUp de IA - recebe todos dados como props
export default function IaPopup({ visible, iaInfo, loading, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={popupStyles.overlay}>
        <View style={popupStyles.popup}>
          {/* Botão de fechar */}
          <TouchableOpacity style={popupStyles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 22 }}>✕</Text>
          </TouchableOpacity>
          
          {/* Mostra spinner se estiver carregando do backend */}
          {loading ? (
            <ActivityIndicator size="large" style={{ marginVertical: 22 }} />
          ) : iaInfo && (
            <>
              {/* Logo da IA */}
              <Image source={iaInfo.logo} style={popupStyles.logo} resizeMode="contain" />
              {/* Nome e subtítulo */}
              <Text style={popupStyles.iaName}>{iaInfo.title}</Text>
              <Text style={popupStyles.iaSubtitle}>{iaInfo.subtitle}</Text>
              
              {/* Sobre a IA */}
              <Text style={popupStyles.sectionTitle}>Sobre essa IA</Text>
              <Text style={popupStyles.iaDesc}>{iaInfo.descricao}</Text>
              
              {/* Principais usos */}
              <Text style={popupStyles.sectionTitle}>Principais usos</Text>
              <View style={popupStyles.usosContainer}>
                {iaInfo.principaisUsos.map((uso, idx) => (
                  <View key={uso+idx} style={popupStyles.iaUseTag}>
                    <Text style={popupStyles.iaUseTagText}>{uso}</Text>
                  </View>
                ))}
              </View>
              
              {/* Preços e planos */}
              <Text style={popupStyles.sectionTitle}>Preços e planos</Text>
              <Text style={popupStyles.iaDesc}>{iaInfo.precos}</Text>
              
              {/* Botões de ação */}
              <View style={popupStyles.botoesRow}>
                <TouchableOpacity style={popupStyles.voltarBtn} onPress={onClose}>
                  <Text style={popupStyles.voltarText}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={popupStyles.acessarBtn}
                  onPress={() => {
                    if (iaInfo && iaInfo.url) {
                      import("react-native").then(({ Linking }) => {
                        Linking.openURL(iaInfo.url);
                      });
                    }
                  }}
                >
                  <Text style={popupStyles.acessarText}>Acessar IA</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ESTILOS DO POPUP -----------------------------------------------------
const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 320,
    padding: 22,
    alignItems: "stretch",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 18,
    top: 13,
    zIndex: 2,
  },
  logo: {
    width: 62,
    height: 62,
    alignSelf: "center",
    marginBottom: 9,
  },
  iaName: {
    textAlign: "center",
    fontSize: 19,
    fontWeight: "bold",
    color: "#121212",
    marginBottom: 1,
  },
  iaSubtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#535353",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#111",
    fontSize: 15,
    marginTop: 7,
    marginBottom: 3,
  },
  iaDesc: {
    color: "#333",
    fontSize: 13,
    marginBottom: 5,
    marginLeft: 2,
  },
  usosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 7,
    gap: 5,
  },
  iaUseTag: {
    backgroundColor: "#0F2C5C",
    borderRadius: 7,
    marginHorizontal: 1,
    marginBottom: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  iaUseTagText: { color: "#fff", fontSize: 13 },
  botoesRow: { flexDirection: "row", marginTop: 18 },
  voltarBtn: {
    flex: 1,
    backgroundColor: "#ECECEC",
    padding: 10,
    marginRight: 7,
    borderRadius: 6,
    alignItems: "center",
  },
  acessarBtn: {
    flex: 1,
    backgroundColor: "#0F2C5C",
    padding: 10,
    marginLeft: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  voltarText: { color: "#000", fontWeight: "bold" },
  acessarText: { color: "#fff", fontWeight: "bold" },
});
