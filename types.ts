// تعریف نوع برای داده‌های خام اکسل
export interface InvoiceRow {
  ارزش_افزوده: number;
  بعد_از_تخفیف: number;
  تخفیف: number;
  تعداد: number;
  ردیف: number;
  شناسه_کالا_یا_خدمات: string;
  عوارض: number;
  فی: number;
  قیمت_قبل_از_تخفیف: number;
  مبلغ_کل: number;
  نام_کالا_یا_خدمات: string;
  نرخ_مالیات: number;
  نوع_عملیات: string;
  واحد_اندازه_گیری: number;
  نتیجه: string;
  شرج_مشکل: string;
}
// تعریف نوع برای خروجی JSON
export interface JsonOutput {
  rowNumber: number;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  priceBeforeDiscount: number;
  discount: number;
  priceAfterDiscount: number;
  taxRate: number;
  vat: number;
  surcharge: number;
  totalAmount: number;
}
export interface Info {
  senderCompanyId: string;
  receiverCompanyId: string;
  invoiceId: number;
}
export interface InfoExcelRow {
  invoiceId: number;
  senderCompanyId: string;
  receiverCompanyId: string;
} // Excel column headers (Persian schema)
export const headers = [
  "ردیف",
  "شناسه کالا یا خدمات",
  "نام کالا یا خدمات",
  "واحد اندازه گیری",
  "تعداد",
  "فی",
  "قیمت قبل از تخفیف",
  "تخفیف",
  "بعد از تخفیف",
  "نرخ مالیات",
  "ارزش افزوده",
  "عوارض",
  "مبلغ کل",
  "نوع عملیات",
  "شماره",
  "نتیجه",
  "شرح مشکل",
];
