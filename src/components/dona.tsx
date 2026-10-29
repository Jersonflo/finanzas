import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type Porcion = { valor: number; color: string };

/** Gráfica de dona hecha con arcos de círculo; en el centro va un título y un valor. */
export function Dona({ porciones, titulo, valor, tamano = 220 }: { porciones: Porcion[]; titulo: string; valor: string; tamano?: number }) {
  const theme = useTheme();
  const grosor = 28;
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const total = porciones.reduce((s, p) => s + p.valor, 0);
  const separacion = porciones.length > 1 ? 3 : 0;

  let acumulado = 0;
  return (
    <View style={{ width: tamano, height: tamano }}>
      <Svg width={tamano} height={tamano} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={tamano / 2} cy={tamano / 2} r={radio} stroke={theme.backgroundSelected} strokeWidth={grosor} fill="none" />
        {total > 0 &&
          porciones.map((p, i) => {
            const largo = (p.valor / total) * circunferencia;
            const arco = (
              <Circle
                key={i}
                cx={tamano / 2}
                cy={tamano / 2}
                r={radio}
                stroke={p.color}
                strokeWidth={grosor}
                fill="none"
                strokeDasharray={`${Math.max(largo - separacion, 0.01)} ${circunferencia}`}
                strokeDashoffset={-acumulado}
              />
            );
            acumulado += largo;
            return arco;
          })}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.centro]}>
        <ThemedText type="small" themeColor="textSecondary">{titulo}</ThemedText>
        <ThemedText type="smallBold" style={styles.valor}>{valor}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center' },
  valor: { fontSize: 20, lineHeight: 26 },
});
