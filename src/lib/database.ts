import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import type {
  Credito, CreditoConPagos, Pago, Documento, CreditoFormData,
} from '@/types';
import { generateId } from '@/lib/utils';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('creditos.db');
    await initSchema(_db);
  }
  return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS creditos (
      id            TEXT PRIMARY KEY,
      nombre        TEXT NOT NULL,
      tipo          TEXT NOT NULL,
      saldoActual   REAL NOT NULL,
      saldoOriginal REAL NOT NULL,
      limiteCredito REAL,
      tasaAnual     REAL NOT NULL,
      fechaCorte    INTEGER,
      fechaLimitePago INTEGER,
      pagoMinimo    REAL,
      cuotaMensual  REAL,
      plazoMeses    INTEGER,
      estado        TEXT NOT NULL DEFAULT 'activo',
      institucion   TEXT,
      notas         TEXT,
      creadoEn      TEXT NOT NULL DEFAULT (datetime('now')),
      actualizadoEn TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pagos (
      id         TEXT PRIMARY KEY,
      creditoId  TEXT NOT NULL,
      mes        INTEGER NOT NULL,
      anio       INTEGER NOT NULL,
      monto      REAL NOT NULL,
      fecha      TEXT NOT NULL,
      tipo       TEXT NOT NULL DEFAULT 'normal',
      estado     TEXT NOT NULL DEFAULT 'pagado',
      notas      TEXT,
      creadoEn   TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (creditoId) REFERENCES creditos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documentos (
      id        TEXT PRIMARY KEY,
      creditoId TEXT NOT NULL,
      nombre    TEXT NOT NULL,
      tipo      TEXT NOT NULL,
      uri       TEXT NOT NULL,
      tamano    INTEGER NOT NULL,
      creadoEn  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (creditoId) REFERENCES creditos(id) ON DELETE CASCADE
    );
  `);

  try {
    await db.execAsync(`ALTER TABLE creditos ADD COLUMN limiteCredito REAL;`);
  } catch (e) {
    // Ignorar si la columna ya existe
  }
}

// ─── Row mappers (SQLite devuelve snake/camel según columna) ──────────────────

function mapCredito(row: any): Credito {
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    saldoActual: row.saldoActual,
    saldoOriginal: row.saldoOriginal,
    limiteCredito: row.limiteCredito ?? null,
    tasaAnual: row.tasaAnual,
    fechaCorte: row.fechaCorte ?? null,
    fechaLimitePago: row.fechaLimitePago ?? null,
    pagoMinimo: row.pagoMinimo ?? null,
    cuotaMensual: row.cuotaMensual ?? null,
    plazoMeses: row.plazoMeses ?? null,
    estado: row.estado,
    institucion: row.institucion ?? null,
    notas: row.notas ?? null,
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

function mapPago(row: any): Pago {
  return {
    id: row.id,
    creditoId: row.creditoId,
    mes: row.mes,
    anio: row.anio,
    monto: row.monto,
    fecha: row.fecha,
    tipo: row.tipo,
    estado: row.estado,
    notas: row.notas ?? undefined,
    creadoEn: row.creadoEn,
  };
}

function mapDocumento(row: any): Documento {
  return {
    id: row.id,
    creditoId: row.creditoId,
    nombre: row.nombre,
    tipo: row.tipo,
    uri: row.uri,
    tamano: row.tamano,
    creadoEn: row.creadoEn,
  };
}

// ─── CREDITOS ──────────────────────────────────────────────────────────────

export async function getCreditos(): Promise<Credito[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM creditos ORDER BY creadoEn DESC');
  return rows.map(mapCredito);
}

export async function getCreditosConPagos(): Promise<CreditoConPagos[]> {
  const db = await getDb();
  const creditosRows = await db.getAllAsync<any>('SELECT * FROM creditos ORDER BY creadoEn DESC');
  const pagosRows = await db.getAllAsync<any>('SELECT * FROM pagos ORDER BY anio DESC, mes DESC');
  const docsRows = await db.getAllAsync<any>('SELECT * FROM documentos ORDER BY creadoEn DESC');

  const pagos = pagosRows.map(mapPago);
  const documentos = docsRows.map(mapDocumento);

  return creditosRows.map(row => {
    const credito = mapCredito(row);
    return {
      ...credito,
      pagos: pagos.filter(p => p.creditoId === credito.id),
      documentos: documentos.filter(d => d.creditoId === credito.id),
    };
  });
}

export async function getCreditoById(id: string): Promise<CreditoConPagos | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>('SELECT * FROM creditos WHERE id = ?', [id]);
  if (!row) return null;
  const pagoRows = await db.getAllAsync<any>(
    'SELECT * FROM pagos WHERE creditoId = ? ORDER BY anio DESC, mes DESC',
    [id],
  );
  const docRows = await db.getAllAsync<any>(
    'SELECT * FROM documentos WHERE creditoId = ? ORDER BY creadoEn DESC',
    [id],
  );
  return {
    ...mapCredito(row),
    pagos: pagoRows.map(mapPago),
    documentos: docRows.map(mapDocumento),
  };
}

export async function createCredito(data: CreditoFormData): Promise<Credito> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO creditos
      (id,nombre,tipo,saldoActual,saldoOriginal,limiteCredito,tasaAnual,fechaCorte,fechaLimitePago,
       pagoMinimo,cuotaMensual,plazoMeses,estado,institucion,notas,creadoEn,actualizadoEn)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, data.nombre, data.tipo,
      data.saldoActual, data.saldoOriginal, data.limiteCredito ?? null, data.tasaAnual,
      data.fechaCorte ?? null, data.fechaLimitePago ?? null,
      data.pagoMinimo ?? null, data.cuotaMensual ?? null,
      data.plazoMeses ?? null, data.estado,
      data.institucion ?? null, data.notas ?? null,
      now, now,
    ],
  );

  if (data.documentosPendientes && data.documentosPendientes.length > 0) {
    for (const doc of data.documentosPendientes) {
      const dir = FileSystem.documentDirectory + `creditos/${id}/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const ext = doc.nombre.split('.').pop() ?? 'bin';
      const destName = `${generateId()}.${ext}`;
      const destUri = dir + destName;
      await FileSystem.copyAsync({ from: doc.uri, to: destUri });

      await createDocumento({
        creditoId: id,
        nombre: doc.nombre,
        tipo: doc.tipo,
        uri: destUri,
        tamano: doc.tamano,
      });
    }
  }

  return mapCredito({
    id, ...data,
    limiteCredito: data.limiteCredito ?? null,
    fechaCorte: data.fechaCorte ?? null,
    fechaLimitePago: data.fechaLimitePago ?? null,
    pagoMinimo: data.pagoMinimo ?? null,
    cuotaMensual: data.cuotaMensual ?? null,
    plazoMeses: data.plazoMeses ?? null,
    institucion: data.institucion ?? null,
    notas: data.notas ?? null,
    creadoEn: now, actualizadoEn: now,
  });
}

export async function updateCredito(id: string, data: Partial<CreditoFormData>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const fieldMap: Record<string, string> = {
    nombre: 'nombre', tipo: 'tipo',
    saldoActual: 'saldoActual', saldoOriginal: 'saldoOriginal',
    limiteCredito: 'limiteCredito',
    tasaAnual: 'tasaAnual', fechaCorte: 'fechaCorte',
    fechaLimitePago: 'fechaLimitePago', pagoMinimo: 'pagoMinimo',
    cuotaMensual: 'cuotaMensual', plazoMeses: 'plazoMeses',
    estado: 'estado', institucion: 'institucion', notas: 'notas',
  };
  const sets: string[] = [];
  const vals: any[] = [];
  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in data) {
      sets.push(`${col} = ?`);
      vals.push((data as any)[key] ?? null);
    }
  }
  if (sets.length > 0) {
    vals.push(now, id);
    await db.runAsync(
      `UPDATE creditos SET ${sets.join(', ')}, actualizadoEn = ? WHERE id = ?`,
      vals,
    );
  }

  if (data.documentosPendientes && data.documentosPendientes.length > 0) {
    for (const doc of data.documentosPendientes) {
      const dir = FileSystem.documentDirectory + `creditos/${id}/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const ext = doc.nombre.split('.').pop() ?? 'bin';
      const destName = `${generateId()}.${ext}`;
      const destUri = dir + destName;
      await FileSystem.copyAsync({ from: doc.uri, to: destUri });

      await createDocumento({
        creditoId: id,
        nombre: doc.nombre,
        tipo: doc.tipo,
        uri: destUri,
        tamano: doc.tamano,
      });
    }
  }
}

export async function deleteCredito(id: string): Promise<void> {
  const db = await getDb();
  // Clean up physical document files before deleting the credit
  const docs = await db.getAllAsync<{ uri: string }>(
    'SELECT uri FROM documentos WHERE creditoId = ?',
    [id],
  );
  for (const doc of docs) {
    try {
      const info = await FileSystem.getInfoAsync(doc.uri);
      if (info.exists) {
        await FileSystem.deleteAsync(doc.uri, { idempotent: true });
      }
    } catch (_) { /* file may already be gone */ }
  }
  await db.runAsync('DELETE FROM documentos WHERE creditoId = ?', [id]);
  await db.runAsync('DELETE FROM pagos WHERE creditoId = ?', [id]);
  await db.runAsync('DELETE FROM creditos WHERE id = ?', [id]);
}

export async function updateCreditoSaldo(id: string, nuevoSaldo: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE creditos SET saldoActual = ?, actualizadoEn = ? WHERE id = ?', [nuevoSaldo, now, id]);
}

// ─── PAGOS ──────────────────────────────────────────────────────────────────

export async function getPagosByCredito(creditoId: string): Promise<Pago[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM pagos WHERE creditoId = ? ORDER BY anio DESC, mes DESC',
    [creditoId],
  );
  return rows.map(mapPago);
}

export async function getPagosByMes(mes: number, anio: number): Promise<Pago[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM pagos WHERE mes = ? AND anio = ?',
    [mes, anio],
  );
  return rows.map(mapPago);
}

export async function createPago(
  data: Omit<Pago, 'id' | 'creadoEn'>,
): Promise<Pago> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pagos (id,creditoId,mes,anio,monto,fecha,tipo,estado,notas,creadoEn)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id, data.creditoId, data.mes, data.anio,
      data.monto, data.fecha, data.tipo, data.estado,
      data.notas ?? null, now,
    ],
  );
  return { ...data, id, notas: data.notas, creadoEn: now };
}

export async function deletePago(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM pagos WHERE id = ?', [id]);
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────

export async function getDocumentosByCredito(creditoId: string): Promise<Documento[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM documentos WHERE creditoId = ? ORDER BY creadoEn DESC',
    [creditoId],
  );
  return rows.map(mapDocumento);
}

export async function createDocumento(
  data: Omit<Documento, 'id' | 'creadoEn'>,
): Promise<Documento> {
  const db = await getDb();
  const id = generateId();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO documentos (id,creditoId,nombre,tipo,uri,tamano,creadoEn)
     VALUES (?,?,?,?,?,?,?)`,
    [id, data.creditoId, data.nombre, data.tipo, data.uri, data.tamano, now],
  );
  return { ...data, id, creadoEn: now };
}

export async function deleteDocumento(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM documentos WHERE id = ?', [id]);
}
