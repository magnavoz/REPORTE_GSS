const AdmZip = require("adm-zip");

const comprimirAll = async(obj) => {
    var zip = new AdmZip();
    var path = "C:\\Users\\Anthony\\Downloads\\TEMPGSS\\"

    for (let i = 0; i < obj.length; i++) {
        const interconnect = obj[i];
        zip.addLocalFile(path + "CDR REPORTE LIQUIDACION Troncal_"+interconnect+".xlsx");
        
    }
   
    // zip.addLocalFile(path + "CDR REPORTE LIQUIDACION Troncal_cc GSS 38022 BCP BOT.xlsx");
    // zip.addLocalFile(path + "CDR REPORTE LIQUIDACION Troncal_cc GSS 38124 BCP Cobranzas.xlsx");
    // zip.addLocalFile(path + "CDR REPORTE LIQUIDACION Troncal_cc GSS 38244_TMP_FIBRA_CAPTA.xlsx");
    // zip.addLocalFile(path + "CDR REPORTE LIQUIDACION Troncal_cc GSS_BCP_BOT_38022.xlsx");
    // var willSendthis = zip.toBuffer();
    zip.writeZip(`C:\\Users\\Anthony\\Downloads\\TEMPGSS\\GSS.rar`);
}

module.exports = {
    comprimirAll
}