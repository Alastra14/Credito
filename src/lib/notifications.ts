import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('pagos', {
      name: 'Recordatorios de Pago',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
  return true;
}

export async function schedulePaymentReminders(
  creditoId: string,
  creditoNombre: string,
  cuotaMensual: number,
  fechaLimitePagoDia: number | null,
  fechaCorteDia: number | null,
  mes: number,
  anio: number,
): Promise<void> {
  const daysOffsets = [3, 1, 0];

  // Notificaciones para la fecha límite de pago
  if (fechaLimitePagoDia) {
    for (const diasAntes of daysOffsets) {
      const fechaPago = new Date(anio, mes - 1, fechaLimitePagoDia);
      const triggerDate = new Date(fechaPago);
      triggerDate.setDate(triggerDate.getDate() - diasAntes);
      triggerDate.setHours(9, 0, 0, 0);

      if (triggerDate <= new Date()) continue;

      let title: string;
      let body: string;

      if (diasAntes === 0) {
        title = '💰 Pago vence hoy';
        body = `${creditoNombre}: ${cuotaMensual.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`;
      } else if (diasAntes === 1) {
        title = '⏰ Pago vence mañana';
        body = `${creditoNombre} — no olvides pagar`;
      } else {
        title = `⏰ Pago en ${diasAntes} días`;
        body = `${creditoNombre} vence el ${fechaLimitePagoDia}`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { creditoId, mes, anio, tipo: 'pago' },
          categoryIdentifier: 'pagos',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }

  // Notificaciones para la fecha de corte (si existe)
  if (fechaCorteDia) {
    for (const diasAntes of daysOffsets) {
      const fechaCorte = new Date(anio, mes - 1, fechaCorteDia);
      const triggerDate = new Date(fechaCorte);
      triggerDate.setDate(triggerDate.getDate() - diasAntes);
      triggerDate.setHours(9, 0, 0, 0);

      if (triggerDate <= new Date()) continue;

      let title: string;
      let body: string;

      if (diasAntes === 0) {
        title = '✂️ Corte de tarjeta hoy';
        body = `Hoy es la fecha de corte de ${creditoNombre}.`;
      } else if (diasAntes === 1) {
        title = '✂️ Corte de tarjeta mañana';
        body = `Mañana es el corte de ${creditoNombre}.`;
      } else {
        title = `✂️ Corte en ${diasAntes} días`;
        body = `El corte de ${creditoNombre} es el día ${fechaCorteDia}.`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { creditoId, mes, anio, tipo: 'corte' },
          categoryIdentifier: 'pagos',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

export async function cancelNotificationsForCredito(creditoId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter(n => n.content.data?.creditoId === creditoId)
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function cancelNotificationsForPago(
  creditoId: string,
  mes: number,
  anio: number,
): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter(
        n =>
          n.content.data?.creditoId === creditoId &&
          n.content.data?.mes === mes &&
          n.content.data?.anio === anio,
      )
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function scheduleRemindersForAllCreditos(
  creditos: Array<{
    id: string;
    nombre: string;
    cuotaMensual: number;
    fechaLimitePago: number | null;
    fechaCorte: number | null;
  }>,
): Promise<void> {
  // Cancelar TODAS las notificaciones previas para evitar duplicados
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();

  for (const c of creditos) {
    if (!c.fechaLimitePago && !c.fechaCorte) continue;
    await schedulePaymentReminders(c.id, c.nombre, c.cuotaMensual, c.fechaLimitePago, c.fechaCorte, mes, anio);
  }
}
