import * as XLSX from "xlsx";
import { InvoiceRow, InfoExcelRow, JsonOutput } from "../types";
import * as EXCELJS from "exceljs";
import * as path from "path";
import * as fs from "fs";

export function readExcelToJson(file: string) {
  // Get the directory of the executable (works in pkg)
  const filePath = path.join(process.cwd(), 'document.xlsx');
  // Read file into a Buffer
  const fileBuffer = fs.readFileSync(filePath);
    
  // Convert Buffer to ArrayBuffer
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength
  );
  try {
    if (fs.existsSync(filePath)) {
      console.log(`File found: ${filePath}`);
      // Example: Read or process document.xlsx here
      // If using a library like 'xlsx' to read Excel files:
      // const XLSX = require('xlsx');
      // const workbook = XLSX.readFile(filePath);
      // console.log(workbook.SheetNames);
    } else {
      console.error(`File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error accessing file: ${err.message}`);
  }

  try {
    // خواندن فایل اکسل

try {
  const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer);
  const sheetName1: string = workbook.SheetNames[0];
  const sheetName2: string = workbook.SheetNames[1];
  const worksheet1: XLSX.WorkSheet = workbook.Sheets[sheetName1];
  const worksheet2: XLSX.WorkSheet = workbook.Sheets[sheetName2];

  // تبدیل شیت به آرایه‌ای از اشیاء با استفاده از نام‌های ستون خام
  const jsonData: InvoiceRow[] = XLSX.utils.sheet_to_json(worksheet1);

  // فیلتر کردن رکوردها با شماره ردیف و نگاشت به فرمت JSON
  var jsonList: JsonOutput[] = jsonData
    .filter((row): row is Required<InvoiceRow> => row.ردیف !== undefined)
    .map((row) => ({
      rowNumber: row["ردیف"] || 0,
      productId: row["شناسه کالا یا خدمات"] || "Unknown",
      productName: row["نام کالا یا خدمات"] || "Unknown",
      unit: row["واحد اندازه گیری"] || "Unknown",
      quantity: row["تعداد"] || 0,
      unitPrice: row["فی"] || 0,
      priceBeforeDiscount: row["قیمت قبل از تخفیف"] || 0,
      discount: row["تخفیف"] || 0,
      priceAfterDiscount: row["بعد از تخفیف"] || 0,
      taxRate: row["نرخ مالیات"] || 0,
      vat: row["ارزش افزوده"] || 0,
      surcharge: row["عوارض"] || 0,
      totalAmount: row["مبلغ کل"] || 0,
      operationType: row["نوع عملیات"] || "Unknown",
      number: row["شماره"] || "Unknown",
      result: row["نتیجه"] || "Unknown",
    }));

  const data = XLSX.utils.sheet_to_json(worksheet2, {
    defval: "",
  });
  const infoRow: InfoExcelRow = data.map((row: any) => ({
    invoiceId: row["شماره فاکتور"],
    senderCompanyId: row["شناسه ملی فروشنده"],
    receiverCompanyId: row["شناسه ملی خریدار"] + "",
  }))[0];
  return { jsonList, infoRow };

}catch(e) {
  console.log("XXXX " + e);
}
  } catch (error) {
    console.error("خطا در خواندن فایل اکسل:", (error as Error).message);
  }
}

// Function to update the "شماره" column
export async function updateNumberColumn(
  uid: string,
  cellNumber: number,
  rowNumber: number
) {
    // Get the directory of the executable (works in pkg)

    const filePath = path.join(process.cwd(), 'document.xlsx');
  
    console.log("Hello from TypeScript (Webpack bundle)!");
  
    try {
      if (fs.existsSync(filePath)) {
        console.log(`File found: ${filePath}`);
        // Example: Read or process document.xlsx here
        // If using a library like 'xlsx' to read Excel files:
        // const XLSX = require('xlsx');
        // const workbook = XLSX.readFile(filePath);
        // console.log(workbook.SheetNames);
      } else {
        console.error(`File not found: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error accessing file: ${err.message}`);
    }

  // Create a new workbook and load the Excel file
  const workbook = new EXCELJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  // Get the first worksheet (you can modify this if your data is in a specific sheet)
  const worksheet = workbook.getWorksheet(1);

  // Update the "شماره" column starting from the second row (assuming row 1 is headers)
  worksheet!.eachRow((row, rn) => {
    if (rn == rowNumber) {
      // Skip the header row
      row.getCell(cellNumber).value = uid; // equential numbering (1, 2, 3, ...)شماره
    }
  });

  // Save the modified workbook to a new file
  await workbook.xlsx.writeFile("document.xlsx");
}
