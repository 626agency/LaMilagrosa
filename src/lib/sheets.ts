import Papa from 'papaparse';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1yfpD2fkIM_DbTwK-SQQ16UqW_HiCTqBd6SBQMzV7UBM';

export interface InventarioItem {
    Especie: string;
    'Cantidad embarazadas': string;
    'Cantidad sin embarazo': string;
    'Cantidad total': string;
}

export interface GastoItem {
    Producto: string;
    Cantidad: string;
    'Fecha compra': string;
    Total: string;
}

async function fetchSheetData(gid: string) {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
    const response = await fetch(url);
    const csvText = await response.text();

    return new Promise<any[]>((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error: any) => reject(error),
        });
    });
}

export async function getInventario(): Promise<InventarioItem[]> {
    return fetchSheetData('0');
}

export async function getGastos(): Promise<GastoItem[]> {
    return fetchSheetData('834820115');
}
