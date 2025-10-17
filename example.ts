import * as moment from "moment";
import { moadian } from "./index";
import * as fs from "fs";
import { headers, JsonOutput } from "./types";
import { readExcelToJson, updateNumberColumn } from "./services/readExcelFile";








//A2HOHD SANDBOX
//A3HYN5 Main
var clientId = "A2HOHD";

var privateKey = fs.readFileSync("Private.txt", "utf-8").toString();
var certificate = fs.readFileSync("HekmatPardazanAseman.crt", "utf-8");
const send = new moadian(clientId, privateKey, certificate, true);

var dax = readExcelToJson("document.xlsx");

// generate taxid from invoice
const taxid = send.generateTaxInvoiceId(
  moment().format("YYYY-MM-DD"),
  dax?.infoRow.invoiceId
);
// Sum totalAmount
const totals = dax?.jsonList.reduce(
  (acc, item) => {
    acc.total += item.totalAmount ?? 0;
    acc.totalVat += item.vat ?? 0;
    acc.totalPriceAfterDiscount += item.priceAfterDiscount ?? 0;
    acc.totalPriceBeforeDiscount += item.priceBeforeDiscount ?? 0;
    return acc;
  },
  {
    total: 0,
    totalVat: 0,
    totalPriceAfterDiscount: 0,
    totalPriceBeforeDiscount: 0,
  }
);

var invoiceHeader = {
  taxid: taxid, //شماره مالیات
  // inno: inno,
  indatim: moment().unix() * 1000,
  inty: 2, // 1|2|3
  ins: 1, //اصلی / اصلاحی / ...
  inp: 1, //الگو صورت حساب
  tins: dax?.infoRow.senderCompanyId, //شناسه ملی فروشنده
  tob: 2, // نوع شخص خریدار در الگوی نوع دوم اختیاریه
  bid: null,
  tinb: dax?.infoRow.receiverCompanyId, // شماره اقتصادی خریدار
  tprdis: totals?.totalPriceBeforeDiscount, // مجموع مبلغ قبل از کسر تخفیف
  tdis: 0.0, // مجموع تخفیف
  tadis: totals?.totalPriceAfterDiscount, // مجموع مبلغ پس از کسر تخفیف
  tvam: totals?.totalVat, // مجموع مالیات ارزش افزوده
  tbill: totals?.total, //مجموع صورتحساب
  setm: 1, // روش تسویه
  todam: 0.0, //مجموع سایر مالیات، عوارض
  irtaxid: null,
};

// Function to map one object
function mapToApiSchema(obj: JsonOutput) {
  return {
    sstid: obj.productId,
    sstt: obj.productName,
    mu: obj.unit.toString(),
    am: obj.quantity,
    fee: obj.unitPrice,
    prdis: obj.priceBeforeDiscount,
    dis: obj.discount,
    adis: obj.priceAfterDiscount,
    vra: obj.taxRate,
    vam: obj.vat,
    tsstam: obj.totalAmount,
    odam: obj.surcharge,
  };
}

var invoiceBody = dax?.jsonList.map(mapToApiSchema);

// var inno = send.generateInno(invoiceId);
// var invoiceHeader = {
//   taxid: taxid, //شماره مالیات
//   // inno: inno,
//   indatim: moment().unix() * 1000,
//   inty: 2, // 1|2|3
//   ins: 1, //اصلی / اصلاحی / ...
//   inp: 1, //الگو صورت حساب
//   tins: "14014703000", //شناسه ملی فروشنده
//   tob: 2, // نوع شخص خریدار در الگوی نوع دوم اختیاریه
//   bid: null,
//   tinb: "14011747121", // شماره اقتصادی خریدار
//   tprdis: 20000.0, // مجموع مبلغ قبل از کسر تخفیف
//   tdis: 0.0, // مجموع تخفیف
//   tadis: 20000.0, // مجموع مبلغ پس از کسر تخفیف
//   tvam: 2000.0, // مجموع مالیات ارزش افزوده
//   tbill: 22000, //مجموع صورتحساب
//   setm: 1, // روش تسویه
//   todam: 0.0, //مجموع سایر مالیات، عوارض
//   irtaxid: null,
// };
// var invoiceBody = [
//   {
//     sstid: "2720000114542", //شناسه کالا یا خدمات
//     sstt: "نام کالا یا خدمات",
//     mu: "1627", //واحد اندازه گیری
//     am: 1, //تعداد
//     fee: 20000.0,
//     prdis: 20000.0, //قبل از تخفیف
//     dis: 0.0, //تخفیف
//     adis: 20000.0, //بعد از تخفیف
//     vra: 10.0, //نرخ مالیات
//     vam: 2000.0, //مالیات
//     tsstam: 22000.0, //مبلغ کل
//     odam: 0.0,
//   },
// ];
send
  .createInvoicePacket(invoiceHeader, invoiceBody)
  .then(function (invoicePack) {
    send.sendInvoice(invoicePack).then(function (res) {
      // Map API response to Excel rows
      res.result.map(async (item, index) => {
        var normalToExcelRowNumber = index + 2;
        await updateNumberColumn(item.uid, 15, normalToExcelRowNumber);
      });
      console.log("New rows appended to Sheet1 successfully!");
      console.log("RES: " + res.status);
      console.log("Wait...");
      delay(3000).then(() => {
        send.inquiryByUId(res.result[0].uid).then(function (res2) {
          if (res2[0].status === "IN_PROGRESS") {
          }
          res2.map(async (item, index) => {
            var normalToExcelRowNumber = index + 2;
            await updateNumberColumn(
              res2[0].status,
              16,
              normalToExcelRowNumber
            );

            await updateNumberColumn(
              res2[0].data.error[index]?.message?? "",
              17,
              normalToExcelRowNumber
            );
          
            
          });

          // Map API response to Excel rows
        });
      });
    });
  });
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// send.inquiryByUId("224531bd-db2f-4d60-97dc-1943981e7bbf").then(function(res){
// console.log(res)
// });

// send.getServerInformation().then(function (res) {
// });
// var invoiceId = 202; //شماره فاکتور
// var taxid = send.generateInvoiceId(moment().toDate(), invoiceId);



