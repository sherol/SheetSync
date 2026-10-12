export interface SheetHeaderConfig {
  sheetName: string;
  headers: string[];
}

export const DEFAULT_SHEET_TABS: SheetHeaderConfig[] = [
  {
    sheetName: 'Life_Logs',
    headers: ['Timestamp', 'Date', 'Mood (1-10)', 'Energy', 'Gratitude', 'Highlight', 'Notes', 'Tags', 'Custom Fields'],
  },
  {
    sheetName: 'Health_Logs',
    headers: ['Timestamp', 'Date', 'Sleep (hrs)', 'Water (glasses)', 'Workout Done', 'Workout Type', 'Duration (min)', 'Stress (1-5)', 'Nutrition', 'Symptoms & Vitals', 'Custom Fields'],
  },
  {
    sheetName: 'Prayer_Logs',
    headers: ['Timestamp', 'Date', 'Prayer Focus', 'Scripture / Verse', 'Meditation (min)', 'Is Answered', 'Answered Date', 'Answer Notes', 'Tags', 'Custom Fields'],
  },
  {
    sheetName: 'Habit_Logs',
    headers: ['Timestamp', 'Date', 'Completed Habits', 'Count Completed', 'Notes'],
  },
  {
    sheetName: 'App_Config',
    headers: ['Key', 'JSON Value', 'Last Updated'],
  },
  {
    sheetName: 'Monthly_Reports',
    headers: ['Month', 'Avg Mood', 'Avg Sleep', 'Total Water', 'Workout Days', 'Prayers Logged', 'Answered Prayers', 'Habit Completion %', 'Automated Insights'],
  },
];

export class SheetsService {
  /**
   * List Google Sheets from user's Google Drive
   */
  static async listUserSpreadsheets(accessToken: string): Promise<Array<{ id: string; name: string; modifiedTime: string }>> {
    const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,modifiedTime)&pageSize=20&orderBy=modifiedTime desc`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to list spreadsheets: ${err}`);
    }
    const data = await res.json();
    return data.files || [];
  }

  /**
   * Verify and fetch spreadsheet info
   */
  static async getSpreadsheet(accessToken: string, spreadsheetId: string) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to load spreadsheet details: ${err}`);
    }
    return await res.json();
  }

  /**
   * Create a new SheetSync Master Spreadsheet with structured tabs
   */
  static async createMasterSpreadsheet(accessToken: string, title = 'SheetSync - Life, Health & Prayer'): Promise<{ id: string; name: string }> {
    const sheetsPayload = DEFAULT_SHEET_TABS.map((tab) => ({
      properties: {
        title: tab.sheetName,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
    }));

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: sheetsPayload,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Could not create Google Spreadsheet: ${err}`);
    }

    const created = await createRes.json();
    const spreadsheetId = created.spreadsheetId;

    // Now populate initial header rows
    const dataUpdates = DEFAULT_SHEET_TABS.map((tab) => ({
      range: `${tab.sheetName}!A1:${String.fromCharCode(65 + tab.headers.length - 1)}1`,
      values: [tab.headers],
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataUpdates,
      }),
    });

    return { id: spreadsheetId, name: title };
  }

  /**
   * Ensure standard tabs exist in an existing spreadsheet
   */
  static async ensureTabsExist(accessToken: string, spreadsheetId: string): Promise<string[]> {
    const info = await this.getSpreadsheet(accessToken, spreadsheetId);
    const existingTitles: string[] = (info.sheets || []).map((s: any) => s.properties.title);

    const missingTabs = DEFAULT_SHEET_TABS.filter((t) => !existingTitles.includes(t.sheetName));
    if (missingTabs.length === 0) return existingTitles;

    // Add missing sheets
    const requests = missingTabs.map((tab) => ({
      addSheet: {
        properties: {
          title: tab.sheetName,
          gridProperties: { frozenRowCount: 1 },
        },
      },
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    // Populate headers for missing tabs
    const headerUpdates = missingTabs.map((tab) => ({
      range: `${tab.sheetName}!A1:${String.fromCharCode(65 + tab.headers.length - 1)}1`,
      values: [tab.headers],
    }));

    if (headerUpdates.length > 0) {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: headerUpdates,
        }),
      });
    }

    return [...existingTitles, ...missingTabs.map((t) => t.sheetName)];
  }

  /**
   * Append a row to a sheet tab
   */
  static async appendRow(accessToken: string, spreadsheetId: string, sheetName: string, rowValues: any[]): Promise<any> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Append failed on ${sheetName}: ${err}`);
    }
    return await res.json();
  }

  /**
   * Read all rows from a sheet tab
   */
  static async readRows(accessToken: string, spreadsheetId: string, sheetName: string): Promise<any[][]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z500`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.values || [];
  }

  /**
   * Save app config schema to App_Config sheet
   */
  static async saveAppConfigToSheet(accessToken: string, spreadsheetId: string, configJson: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await this.appendRow(accessToken, spreadsheetId, 'App_Config', ['schema_config', configJson, now]);
    } catch (e) {
      console.warn('Failed to persist config to sheet:', e);
    }
  }

  /**
   * Save a monthly summary report into the Monthly_Reports tab
   */
  static async appendMonthlyReport(
    accessToken: string,
    spreadsheetId: string,
    reportRow: [string, number | string, number | string, number | string, number | string, number | string, number | string, string, string]
  ): Promise<any> {
    return await this.appendRow(accessToken, spreadsheetId, 'Monthly_Reports', reportRow);
  }
}
