import { Alert, Platform } from 'react-native';

/** Pregunta sí/no antes de algo destructivo. En la web `Alert` no hace nada, así que se usa `confirm`. */
export function confirmar(titulo: string, mensaje: string, textoAccion: string, accion: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n${mensaje}`)) accion();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoAccion, style: 'destructive', onPress: accion },
  ]);
}
