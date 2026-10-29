import DateTimePicker from '@react-native-community/datetimepicker';

/** Selector de fecha compacto de iOS. La versión web está en selector-fecha.web.tsx. */
export function SelectorFecha({ valor, onCambio }: { valor: Date; onCambio: (fecha: Date) => void }) {
  return (
    <DateTimePicker
      value={valor}
      mode="date"
      display="compact"
      locale="es-CO"
      maximumDate={new Date()}
      onChange={(_evento, elegida) => elegida && onCambio(elegida)}
    />
  );
}
