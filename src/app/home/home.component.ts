import { Component, OnInit } from "@angular/core";
import { File, Folder, path } from "tns-core-modules/file-system";
import { isAndroid } from "tns-core-modules/platform";
var dialogs = require("tns-core-modules/ui/dialogs");

import * as pdfMake from 'pdfmake/build/pdfmake.js';
var clipboard = require("nativescript-clipboard");

import { FileReaderService } from "../core/fileReader.service";

global['window'] = {
    'document': {
        'createElementNS': () => { return {} }
    }
};
global['document'] = {
    'createElement': (str) => { return {} }
};
global['navigator'] = {};

var base64 = require('base-64');
import * as jsPDF from 'jspdf';

global['btoa'] = (str) => {
    return base64.encode(str);
};

global['atob'] = (bytes) => {
    return base64.decode(bytes);
};

global['utf8'] = {};

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    fonts;
    images;

    constructor(
        private fr: FileReaderService
    ) {
    }

    ngOnInit(): void {
        this.getFonts();
    }

    getFonts(): void {
        this.fr.readJSON('/app/core/fonts.json').then(
            res => {
                this.fonts = res["fonts"];
                this.images = res['images'];
            },
            err => {
                console.log('Error reading json: ' + JSON.stringify(err));
            }
        )
    }

    generatePdfmake(): void {
        var docDefinition = {
            content: ['This is an sample PDF printed with pdfMake',
                {
                    image: this.images['nslogo'],
                }
            ]
        };

        pdfMake.createPdf(docDefinition, '', '', this.fonts).getDataUrl((dataUrl) => {
            dialogs.alert({
                title: "PDFMake - Base64",
                message: dataUrl,
                okButtonText: "Copy to Clipboard"
            }).then(() => {
                clipboard.setText(dataUrl)
            });

            /*  if (isAndroid) {
                  let sliced = dataUrl.toString().slice(28);
                  this.savePdf(sliced);
              }
              else {
                  alert(dataUrl)
              } */
        });
    }

    generateJspdf(): void {
        let doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(26);
        doc.text(40, 40, "First PDF with NativeScript!");
        doc.addPage();
        doc.addImage(this.images['nslogojpeg'], 'PNG', 0, 0, 100, 100, "newCertificate", 'FAST');

        let dataUrl = doc.output('datauristring');

        if (dataUrl) {
            dialogs.alert({
                title: "PDFMake - Base64",
                message: dataUrl,
                okButtonText: "Copy to Clipboard"
            }).then(() => {
                clipboard.setText(dataUrl)
            });

            /*  if (isAndroid) {
                let sliced = dataUrl.toString().slice(28);
                this.savePdf(sliced);
            }
            else {
                alert(dataUrl)
            } */
        }
    }

    /* savePdf(encodedData) {
          declare var android: any;
  
          public basePath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).toString();
          
          let folder = Folder.fromPath(path.join(this.basePath, "pdfMake Files"));
          let tofile: File = folder.getFile('certificate.pdf');
          if (tofile) {
              let data = android.util.Base64.decode(encodedData, android.util.Base64.DEFAULT);
              console.log("check after decode " + data);
              tofile.writeSync(data, err => {
                  console.log("err :", err);
              });
              console.log("pdf file writed");
          } 
     } */
}
