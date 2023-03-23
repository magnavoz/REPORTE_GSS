const fs = require('fs');
const path = require('path');
const xl = require('excel4node');
const {
    convert,
    convertCDR
} = require('./csv_to_json');
const {
    Console
} = require('console');


const generateReport = async (interconnect) => {
    let resultadoFinal = [];
    let lista = []

    let result = await convert(interconnect);
    let resultCDR = await convertCDR(interconnect);

    let zonas_activas = ['Peru - Lima - Fixed', 'Peru Mobile'];
    let zonas_find = ['lima', 'mobile'];
    let zonas_activas_header = ['Peru - Lima - Fixed', 'Peru Mobile', 'Peru - ROC'];
    let zonas_activas_header_final = [];
    //console.log(zonas_activas.length)

    for (let i = 0; i < zonas_activas.length; i++) {
        // const zone = zonas_activas[i];

        //console.log(zonas_find[i])

        //console.log('========'+zone+'=========')


        if(filterValuePart(result, zonas_find[i]).length > 0){
            lista.push(filterValuePart(result, zonas_find[i]))
            zonas_activas_header_final.push(zonas_activas_header[i])
        }
        
        //console.log(filterValuePart(result,zonas_find[i]));
        //console.log(result.filter(x=>x['Routing Zone'] == zonas_find[i]));

    }

    let resperu = result.filter(x => x['Routing Zone'] == 'peru');
    if(resperu.length > 0){
        // console.log('resperu',resperu)
        lista.push(resperu)
        zonas_activas_header_final.push(zonas_activas_header[2])
    }
   

    console.log(zonas_activas_header_final)

    //return;

    //cambiamos el nombre de la zona en la matriz



    for (let i = 0; i < lista.length; i++) {
        const item = lista[i];

        let zone = zonas_activas_header_final[i];

        //let peru_mobile = lista[1];
        let Financial_Per_Minute_Revenue = 0;
        let Customer_Calls = 0;
        let Customer_ASR = 0;
        let Metrics_Connected = 0;
        let Metrics_ACD = 0;
        let Customer_Rated_Minutes = 0;

        for (let x = 0; x < item.length; x++) {
            const element = item[x];

            Financial_Per_Minute_Revenue += parseFloat(element['Financial Per Minute Revenue']);
            Customer_Calls += parseInt(element['Customer Calls'])
            Metrics_Connected += parseInt(element['Metrics Connected'])

            Customer_ASR += parseInt(element['Customer ASR']);

            // Metrics_ACD += Time.parse( element['Metrics ACD'] );
            var hms = element['Metrics ACD']; // your input string
            var a = hms.split(':'); // split it at the colons

            // minutes are worth 60 seconds. Hours are worth 60 minutes.
            Metrics_ACD += (+a[0]) * 60 + (+a[1]);

            Customer_Rated_Minutes += parseFloat(element['Customer Rated Minutes']);

            //console.log(parseFloat(element['Customer Rated Minutes']));

        }

        Customer_ASR = Customer_ASR / item.length;

        Metrics_ACD = '00:' + parseInt(Metrics_ACD / item.length);

        Financial_Per_Minute_Revenue = parseFloat(Financial_Per_Minute_Revenue / item.length).toFixed(3);

        //let cotos_sin_igv = parseFloat(Customer_Rated_Minutes * Financial_Per_Minute_Revenue).toFixed(2);

        let resultado = {
            'Carrier': 'GSS',
            'Interconnect': interconnect,
            'Zone': zone,
            'Calls': Customer_Calls,
            'Connected': Metrics_Connected,
            'ASR': parseFloat(Customer_ASR).toFixed(2) / 100,
            'ACD': Metrics_ACD,
            'Minutes': parseFloat(Customer_Rated_Minutes).toFixed(2),
            'Tarifas sin IGV': Financial_Per_Minute_Revenue * 1,
            //'Costos sin IGV': cotos_sin_igv
        }

        // resultadoFinal.push({
        //     'subtotal':cotos_sin_igv,
        //     'IGV 18%':parseFloat(cotos_sin_igv * 0.18).toFixed(2),
        //     'Total': parseFloat(cotos_sin_igv + (cotos_sin_igv * 0.18)).toFixed(2),
        //     data: resultado
        // })
        resultadoFinal.push(resultado);

    }

    console.log(resultadoFinal);

    await convertJsonToExcel(resultadoFinal, interconnect, resultCDR);

}

const convertJsonToExcel = async (data, interconnect, CDR) => {

    var wb = new xl.Workbook();

    const style_thinBorder = wb.createStyle({
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        font: {
            // color: '#FF0800',
            size: 10,
        },
    })

    // var ws = wb.addWorksheet('LIQUIDACIÓN');

    var wsCDR = wb.addWorksheet('CDR')//_' + interconnect); // maximo 31 caracteres para el nombre de la hoja
    var ws = wb.addWorksheet('REPORTE');
    var ws2 = wb.addWorksheet('LIQUIDACION');

    //headers
    var count = 1;
    for (var key in CDR[0]) {

        // console.log(' name=' + key);
        wsCDR.cell(1, count).string(key).style(style_thinBorder);
        count++;
        // do some more stuff with response[key]
    }

    //body

    //console.log(typeof CDR[0]['Customer rating charged duration (s)'])

    wsCDR.column(1).setWidth(20);
    wsCDR.column(5).setWidth(20);
    wsCDR.column(8).setWidth(20);

    for (let i = 0; i < CDR.length; i++) {

        let item = CDR[i];

       

        wsCDR.cell(i + 2, 1).date(item['Customer signalling detected']).style(style_thinBorder)
        .style({
            numberFormat: 'dd/mm/yyyy hh:mm:ss'
        });
        wsCDR.cell(i + 2, 2).string(item['Customer signalling To user']).style(style_thinBorder);
        wsCDR.cell(i + 2, 3).string(item['Normalized dialled number']).style(style_thinBorder);
        wsCDR.cell(i + 2, 4).string(item['Customer carrier']).style(style_thinBorder);
        wsCDR.cell(i + 2, 5).string(item['Customer interconnect']).style(style_thinBorder);
        wsCDR.cell(i + 2, 6).number(item['Customer INVITE SIP status code'] * 1).style(style_thinBorder);
        wsCDR.cell(i + 2, 7).string(item['Customer signalling remote IP address']).style(style_thinBorder);
        wsCDR.cell(i + 2, 8).string(item['Customer rating zone']).style(style_thinBorder);
        wsCDR.cell(i + 2, 9).number(item['Customer rating charged duration (s)'] * 1).style(style_thinBorder);
        wsCDR.cell(i + 2, 10).number(item['Customer rating charge'] * 1).style(style_thinBorder);
        wsCDR.cell(i + 2, 11).number(item['Customer charge per minute'] * 1).style(style_thinBorder);
        wsCDR.cell(i + 2, 12).number(item['Supplier signalling From user'] * 1).style(style_thinBorder);

    }



    //-------------------------------------------------

    ws.column(2).setWidth(20);
    ws.column(3).setWidth(14);
    ws.column(9).setWidth(12);
    ws.column(10).setWidth(12);

    ws.cell(1, 1).string('Carrier').style(style_thinBorder);
    ws.cell(1, 2).string('Interconnect').style(style_thinBorder);
    ws.cell(1, 3).string('Zone').style(style_thinBorder);
    ws.cell(1, 4).string('Calls').style(style_thinBorder);
    ws.cell(1, 5).string('Connected').style(style_thinBorder);
    ws.cell(1, 6).string('ASR').style(style_thinBorder);
    ws.cell(1, 7).string('ACD').style(style_thinBorder);
    ws.cell(1, 8).string('Minutes').style(style_thinBorder);
    ws.cell(1, 9).string('Tarifas sin IGV').style(style_thinBorder);
    ws.cell(1, 10).string('Costos sin IGV').style(style_thinBorder);


    ws2.column(1).setWidth(20);
    ws2.cell(1, 1).string(`Troncal ${interconnect}`).style(style_thinBorder);
    ws2.cell(2, 1).string('Zone').style(style_thinBorder);
    ws2.cell(2, 2).string('Connected').style(style_thinBorder);
    ws2.cell(2, 3).string('Minutes').style(style_thinBorder);
    ws2.cell(2, 4).string('Tarifas sin IGV').style(style_thinBorder);
    ws2.cell(2, 5).string('Costos sin IGV').style(style_thinBorder);

    let row = 2;

    for (let i = 0; i < data.length; i++) {

        const item = data[i];
        // console.log(item['Carrier'])
        ws.cell((i + row), 1).string(item['Carrier']).style(style_thinBorder);
        ws.cell((i + row), 2).string(item['Interconnect']).style(style_thinBorder);
        ws.cell((i + row), 3).string(item['Zone']).style(style_thinBorder);
        ws.cell((i + row), 4).number(item['Calls']).style(style_thinBorder);
        ws.cell((i + row), 5).number(item['Connected']).style(style_thinBorder).style({
            numberFormat: '#,##0'
        });
        
        ws.cell((i + row), 6).number(item['ASR']).style(style_thinBorder).style({
            numberFormat: '0.00%'
        });
        ws.cell((i + row), 7).string(item['ACD']).style(style_thinBorder).style({
            numberFormat: 'hh:mm'
        });
        // console.log(item['Minutes']*1)
    
        ws.cell((i + row), 8).number(item['Minutes'] * 1).style(style_thinBorder);

        ws.cell((i + row), 9).number(item['Tarifas sin IGV']).style(style_thinBorder).style({
            numberFormat: '"S/"#,##0.000'
        });
        ws.cell((i + row), 10).formula(`H${i+row} * I${i+row}`).style(style_thinBorder).style({
            numberFormat: '"S/"#,##0.00'
        });


        ws2.cell((i + row + 1), 1).string(item['Zone']).style(style_thinBorder);
        ws2.cell((i + row + 1), 2).number(item['Connected']).style(style_thinBorder).style({
            numberFormat: '#,##0'
        });
        ws2.cell((i + row + 1), 3).number(item['Minutes'] * 1).style(style_thinBorder);
        ws2.cell((i + row + 1), 4).number(item['Tarifas sin IGV']).style(style_thinBorder).style({
            numberFormat: '"S/"#,##0.000'
        });
        ws2.cell((i + row + 1), 5).formula(`C${i+row + 1} * D${i+row + 1}`).style(style_thinBorder).style({
            numberFormat: '"S/"#,##0.00'
        });

    }

    row = data.length + row;

    ws.cell(row, 9).string('subtotal').style(style_thinBorder);
    ws.cell(row + 1, 9).string('IGV 18%').style(style_thinBorder);
    ws.cell(row + 2, 9).string('Total').style(style_thinBorder);

    ws.cell(row, 10).formula(`=SUM(J2:J${(row - 1)})`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });
    ws.cell(row + 1, 10).formula(`=J${row} * 0.18`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });
    ws.cell(row + 2, 10).formula(`=J${row} + J${row + 1}`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });

    row = row + 1;

    ws2.cell(row, 4).string('subtotal').style(style_thinBorder);
    ws2.cell(row + 1, 4).string('IGV 18%').style(style_thinBorder);
    ws2.cell(row + 2, 4).string('Total').style(style_thinBorder);
    
    ws2.cell(row, 5).formula(`=SUM(E3:E${(row - 1)})`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });
    ws2.cell(row + 1, 5).formula(`=E${row} * 0.18`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });
    ws2.cell(row + 2, 5).formula(`=E${row} + E${row + 1}`).style(style_thinBorder).style({
        numberFormat: '"S/"#,##0.00'
    });


    // ws.cell(1,1).string('test')
    // ws.cell(2,1).string('probando')

    const newPath = `C:\\Users\\Anthony\\Downloads\\TEMPGSS\\CDR REPORTE LIQUIDACION Troncal_${interconnect}.xlsx`;

    wb.write(newPath, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('excel generado..........');
        }
    })
}


function filterValuePart(arr, part) {
    return arr.filter(function (obj) {
        return Object.keys(obj)
            .some(function (k) {
                return obj[k].indexOf(part) !== -1;
            });
    });
};

module.exports = {
    generateReport
}
// generateReport('cc GSS 38012_UNICEF');