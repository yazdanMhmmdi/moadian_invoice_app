import jwsService from "./services/jws";
import { v4 as uuidv4 } from "uuid";
import sendRequest from "./services/sendRequest";
import * as moment from "moment";
import jweService from "./services/jwe";
import * as cdigit from "cdigit";
//A2HOHD SANDBOX

export class moadian {
  clientId;
  privateKey;
  certificate;
  apiBaseUrl = "https://tp.tax.gov.ir/requestsmanager/api/v2";
  constructor(clientId, privateKey, certificate, sandbox = false) {
    (this.clientId = clientId),
      (this.privateKey = privateKey),
      (this.certificate = this.cerReplace(certificate));

    if (sandbox) {
      this.apiBaseUrl = "https://sandboxrc.tax.gov.ir/requestsmanager/api/v2";
    }
  }

  requestNonce() {
    return sendRequest(
      this.apiBaseUrl +
        "/nonce?timeToLive=" +
        Math.floor(Math.random() * 180 + 20)
    );
  }
  async requestToken() {
    var nonce = await this.requestNonce();
    // moment().toISOString()
    // moment().format('Y-m-d')+'T'+moment().format('H:m:s')+'Z'
    var jwsHeader = {
      alg: "RS256",
      typ: "jose",
      x5c: [this.certificate.trim()],
      sigT: moment().toISOString(),
      crit: ["sigT"],
      cty: "text/plain",
    };
    var data = {
      nonce: nonce["nonce"],
      clientId: this.clientId,
    };

    var token = await jwsService(this.privateKey, jwsHeader, data);

    return token;
  }

  async getServerInformation() {
    var token = await this.requestToken();
    try {
      const res = await sendRequest(
        this.apiBaseUrl + "/server-information",
        "GET",
        token
      );
      return res;
    } catch (e) {
      console.log(e);
    }
  }

  async sendInvoice(invoicesPackets) {
    var token = await this.requestToken();

    const result = await sendRequest(
      this.apiBaseUrl + "/invoice",
      "POST",
      token,
      invoicesPackets
    );

    return result;
  }

  async createInvoicePacket(invoiceHeader, invoiceBody, invoicePayment = []) {
    var token = await this.getServerInformation();
    const serverPublicKey = token["publicKeys"][0]["key"];
    const serverPublicKeyId = token["publicKeys"][0]["id"];
    var jwsHeader = {
      alg: "RS256",
      typ: "jose",
      x5c: [this.certificate.trim()],
      sigT: moment().toISOString(),
      crit: ["sigT"],
      cty: "text/plain",
    };
    const invoiceJWS = await jwsService(this.privateKey, jwsHeader, {
      header: invoiceHeader,
      body: invoiceBody,
      payments: invoicePayment,
    });
    const jweHeader = {
      alg: "RSA-OAEP-256",
      enc: "A256GCM",
      kid: serverPublicKeyId,
    };
    var payload = await jweService(jweHeader, serverPublicKey, invoiceJWS);
    var data = {
      payload: payload,
      header: {
        requestTraceId: uuidv4(),
        fiscalId: this.clientId,
      },
    };

    return data;
  }
  CHARACTER_TO_NUMBER_CODING = {
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
  };
  generateInvoiceId(date, internalInvoiceId) {
    var daysPastEpoch = this.getDaysPastEpoch(date);

    var daysPastEpochPadded = daysPastEpoch.toString().padStart(6, "0");
    var hexDaysPastEpochPadded = this.dechex(daysPastEpoch)
      .toString()
      .padStart(5, "0");
    var numericClientId = this.clientIdToNumber();

    var internalInvoiceIdPadded = internalInvoiceId
      .toString()
      .padStart(12, "0");
    var hexInternalInvoiceIdPadded = this.dechex(internalInvoiceId)
      .toString()
      .padStart(10, "0");

    var decimalInvoiceId =
      numericClientId + daysPastEpochPadded + internalInvoiceIdPadded;

    var checksum = cdigit.verhoeff.compute(decimalInvoiceId);

    return (
      this.clientId +
      hexDaysPastEpochPadded +
      hexInternalInvoiceIdPadded +
      checksum
    ).toUpperCase();
  }
  generateInno(internalInvoiceId) {
    return this.dechex(internalInvoiceId).toString().padStart(10, "0");
  }
  getDaysPastEpoch(date) {
    return Math.round(date / (3600 * 24));
  }

  is_Numeric(s: number) {
    if (typeof s != "string") {
      return false;
    }

    return !isNaN(s) && !isNaN(parseFloat(s));
  }
  clientIdToNumber() {
    var result = "";

    this.clientId.split("").forEach((char) => {
      if (this.is_Numeric(char)) {
        result += char;
      } else {
        result += this.CHARACTER_TO_NUMBER_CODING[char];
      }
    });

    return result;
  }
  dechex(number) {
    if (number < 0) {
      number = 0xffffffff + number + 1;
    }

    return number.toString(16).toUpperCase();
  }

  async inquiryByUId(UIds, startDateTime = "", endDateTime = "") {
    const token = await this.requestToken();

    var params = "fiscalId=" + this.clientId;

    params += "&uidList=" + UIds;

    var result = sendRequest(
      this.apiBaseUrl + "/inquiry-by-uid?" + params,
      "GET",
      token
    );

    return result;
  }
  cerReplace(cer) {
    let certificate = cer.replace("-----BEGIN CERTIFICATE-----", "");
    certificate = certificate.replace("-----END CERTIFICATE-----", "");
    return certificate.trim();
  }
   decimalFromUtf8(clientId) {
    // تبدیل هر حرف به UTF-8 عددی طبق جدول
    const table = {
      A: 6, B: 6, C: 6, D: 6, E: 6, F: 6, G: 6, H: 6, K: 6, M: 6, N: 6, O: 6, P: 8,
      R: 6, T: 8, W: 8, X: 8, Y: 8, Z: 9, '1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9
    };
    let res = "";
    for (const c of clientId) {
      res += table[c] ?? 0;
    }
    return res;
  }
   generateTaxInvoiceId(invoiceDate, internalSerial) {
    // 1. شناسه حافظه مالیاتی
    const memoIdDec = this.decimalFromUtf8(this.clientId);
  
    // 2. تاریخ ثبت صورتحساب
    const daysPastEpoch = moment(invoiceDate, "YYYY-MM-DD").diff(moment("1970-01-01"), "days");
    const dateHex = daysPastEpoch.toString(16).toUpperCase().padStart(5, "0");
  
    // 3. سریال داخلی
    const serialHex = parseInt(internalSerial).toString(16).toUpperCase().padStart(10, "0");
  
    // 4. محاسبه رقم کنترلی
    const checksum = cdigit.verhoeff.compute(memoIdDec + daysPastEpoch.toString().padStart(6,'0') + internalSerial.toString().padStart(12,'0'));
  
    return this.clientId + dateHex + serialHex + checksum;
  }
}

// import { createPrivateKey, createPublicKey } from "crypto";
// import * as fs from "fs";
// import { SignJWT } from "jose";
// import jwsService from "./services/jws";
// import moment from "moment";

// async function createToken() {
//   // --- Load private key (PKCS#8) ---
//   const privateKeyPem = fs.readFileSync("Private.txt", "utf8");
//   const privateKey = createPrivateKey(privateKeyPem);

//   // --- Load certificate ---
//   const certPem = fs.readFileSync("HPA.crt", "utf8");
//   const x5cBase64 = Buffer.from(
//     certPem
//       .replace("-----BEGIN CERTIFICATE-----", "")
//       .replace("-----END CERTIFICATE-----", "")
//       .replace(/\s+/g, "")
//   ).toString("base64");

//   // --- Payload ---
//   const payload = {
//     nonce: "b6f79309-44d1-4e81-b347-6fa3c07f1a99-1760612216491",
//     clientId: "A3HYN5"
//   };

//     var jwsHeader = {
//       alg: "RS256",
//       typ: "jose",
//       x5c: [x5cBase64],
//       sigT: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
//       crit: ["sigT"],
//       cty: "text/plain",
//     };
// var jwss = await jwsService(privateKey,jwsHeader, payload );


//   console.log(jwss);
// }

// createToken();
