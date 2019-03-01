import { Component, OnInit } from "@angular/core";
var dialogs = require("tns-core-modules/ui/dialogs");
import { formatDate } from '@angular/common';

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
import { Page } from "tns-core-modules/ui/page/page";

global['btoa'] = (str) => {
    return base64.encode(str);
};

global['atob'] = (bytes) => {
    return base64.decode(bytes);
};

global['utf8'] = {};

import { action } from "tns-core-modules/ui/dialogs";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    fonts;
    images;
    date;
    name;
    coursename;
    pdfclient;

    constructor(
        private page: Page,
        private fr: FileReaderService
    ) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.date = formatDate(new Date(), 'fullDate', 'en').split(",");
        this.date = this.date[1] + "," + this.date[2];
        this.getDatas();
    }

    getDatas(): void {
        this.fr.readJSON('/app/core/data.json').then(
            res => {
                this.fonts = res["fonts"];
                this.images = res['images'];

            },
            err => {
                console.log('Error reading json: ' + JSON.stringify(err));
            }
        )
    }

    selectCourse(): void {
        let options = {
            title: "Pick the course",
            message: "",
            cancelButtonText: "Cancel",
            actions: ["NativeScript with Angular Pro", "NativeScript Core Pro", "NativeScript Vue and VueX"]
        };

        action(options).then((result) => {
            if(result != 'Cancel'){
                this.coursename = result;
            }
        });
    }

    selectPdfClient(): void {
        let options = {
            title: "Pick the pdf library",
            message: "",
            cancelButtonText: "Cancel",
            actions: ["pdfMake", "jsPDF"]
        };

        action(options).then((result) => {
            if(result != 'Cancel'){
                this.pdfclient = result;
            }
        });
    }

    generateCert(): void {
        if (this.pdfclient == 'pdfMake') {
            this.generatepdfMake();
        }
        else {
            this.generatejsPDF();
        }
    }

    clearFields(): void {
        this.name = '';
        this.coursename = ''; 
        this.pdfclient = '';
    }

    generatepdfMake(): void {

        let that = this;

        var docDefinition = {

            pageOrientation: 'landscape',

            content: [

                { text: 'Certificate', fontSize: '25', italics: true, alignment: 'center' },

                { text: 'of', fontSize: '25', italics: true, alignment: 'center' },

                { text: '\nTRAINING COMPLETION', fontSize: '30', alignment: 'center' },

                { text: '\n\nThis certifies that', fontSize: '18', alignment: 'center' },

                { text: '\n' + this.name, fontSize: '30', alignment: 'center' },

                { text: '\nhas successfully completed the training in', fontSize: '18', alignment: 'center' },

                { text: '\n' + this.coursename, fontSize: '30', alignment: 'center' },

                { text: '\nOn ' + this.date + '\n\n', fontSize: '18', alignment: 'center' },

                {
                    columns: [
                        {
                            width: 150,
                            text: ''
                        },
                        {
                            image: this.images['nscripting'],
                            width: 100
                        },
                        {},
                        {
                            image: this.images['nslogojpeg'],
                            width: 80
                        }
                    ]
                },
                {
                    "canvas": [{
                        "type": "line",
                        "x1": 400,
                        "y1": 0,
                        "x2": 0,
                        "y2": 0,
                        "lineWidth": 0.5,
                        "lineColor": "#000000"
                    }]
                }
            ],

            background: function () {
                return { image: that.images['watermark'], width: 300, opacity: 0.2, absolutePosition: { x: 260, y: 150 } }
            }
        }

        pdfMake.createPdf(docDefinition, '', '', this.fonts).getDataUrl((dataUrl) => {
            dialogs.alert({
                title: "PDFMake - Base64",
                message: dataUrl,
                okButtonText: "Copy to Clipboard"
            }).then(() => {
                clipboard.setText(dataUrl);
                this.clearFields();
            });
        });
    }

    generatejsPDF(): void {

        var doc = new jsPDF({
            orientation: 'landscape',
        })

        doc.setFontSize(40)
        doc.setFontType("italic")
        doc.text(120, 25, 'Certificate')
        doc.text(145, 40, 'of')

        doc.setFontSize(40)
        doc.setFontType("normal")
        doc.text(70, 60, 'TRAINING COMPLETION')

        doc.setFontSize(25)
        doc.text(110, 100, 'This certifies that')

        doc.setFontSize(40)
        doc.setFontType("bold")
        doc.text(105, 120, this.name)

        doc.setFontSize(25)
        doc.setFontType("normal")
        doc.text(65, 135, 'has successfully completed the training in')

        doc.setFontSize(40)
        doc.setFontType("bold")
        doc.text(50, 160, this.coursename)

        doc.setFontSize(25)
        doc.setFontType("normal")
        doc.text(110, 175, 'On ' + this.date)


        doc.setFontSize(22)
        doc.setTextColor(29,161,242)
        doc.text(75, 190, 'NativeScripting')

        doc.setLineWidth(1)
        doc.line(20, 195, 180, 195)

        doc.setFontSize(14)
        doc.setTextColor(122,133,159)
        doc.text(45, 205, '<Comprehensive NativeScript Courses>')

        doc.addImage(this.images['nslogojpeg'], 'JPEG', 240, 160, 40, 40)

        let dataUrl = doc.output('datauristring');

        if (dataUrl) {
            dialogs.alert({
                title: "jsPDF - Base64",
                message: dataUrl,
                okButtonText: "Copy to Clipboard"
            }).then(() => {
                clipboard.setText(dataUrl);
                this.clearFields();
            });
        }
    }

    //To download resulted pdf on Android

    /* import { File, Folder, path } from "tns-core-modules/file-system";
 
     declare var android: any;
 
     public basePath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).toString();
 
     savePdf(dataUrl) {
 
         let encodedData = dataUrl.toString().slice(28);
 
         let folder = Folder.fromPath(path.join(this.basePath, "NSPdf Files"));
         let tofile: File = folder.getFile('certificate.pdf');
         if (tofile) {
             let data = android.util.Base64.decode(encodedData, android.util.Base64.DEFAULT);
             tofile.writeSync(data, err => {
                 console.log("err :", err);
             });
             console.log("pdf file writed");
         }
     } */
}
