const puppeteer = require('puppeteer-extra');
const express = require('express');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path')
const csv = require('csv');
const {
    response
} = require('express');
const {
    Console
} = require('console');
const app = express();
const server = http.createServer(app);
require('dotenv').config()
const companies = require('./env.json');
const uploadfile = require('./ftp');
const screenshot = require('screenshot-desktop')

const findFile = require('./find_file');
const { validateDownloadFile, renameAndMoveCdrs, validateDownloadFileLiquidation, renameAndMoveLiquidation, createDirectoryTEMPGSS } = require('./checkfile');
const { generateReport } = require('./generateReport');
const { comprimirAll } = require('./zipFiles');
// const {
//     sendMessageTelegram,
//     sendPictureTelegram
// } = require('./telegram')
// const {
//     sendMessageWhatsApp
// } = require('./whatsapp')

// app.use(express.json());
// app.use(express.urlencoded({
//     extended: true
// }));
var dir = process.cwd()

const initProc = async () => {

    //console.log(COMPANY,D)

    const browser = await puppeteer.launch({

        headless: false,
        ignoreHTTPSErrors: true,
        userDataDir: './session/GSS',

    });


    const page = await browser.newPage();

    page.waitForNavigation();

    await page.setViewport({
        width: 1366,
        height: 768
    });

    await page.goto('https://magnavoz-us.digitalkcloud.com/Login');


    const loginInput = await page.waitForSelector('#Username');

    const loginPassword = await page.waitForSelector('#Password');

    await loginInput.type("anthony@quispemejia.com");

    await loginPassword.type("Kosex.1475")

    await page.click('#LoginButton');

    await page.waitForSelector(".breadcrumb-item").catch(async (err) => {
        console.log('.breadcrumb-item=================>:', err)
        await delay(3000)
        process.exit(1);
    });

    await page.goto(`https://magnavoz-us.digitalkcloud.com/Reporting/BIreports/aggregate#A1%20month:1st/-300/asig_carrier_group=cc%20GSS-MGV%20Soles/agfgyAfiOgaCfq5fvQc4//Untitled%20report`, {
        waitUntil: 'networkidle0',
    });
    

    //const CustomerInterconnect = await page.waitForSelector('.dtg-cell');

    // let element = await page.$('.dtg-cell')
    // let value = await page.evaluate(el => el.textContent, CustomerInterconnect)

    //console.log( document.querySelectorAll('.dtg_asig_netgroup') );

    const matches = await page.waitForFunction(() => {
        const matches = [...document.querySelectorAll('.dtg-cell.dtg_asig_netgroup')];
        return matches.length ? matches : null;
    });

    const contents = await matches.evaluate(els => els.map(e => e.textContent));

    //console.log(contents[0])

    await createDirectoryTEMPGSS();

    let listaInterconnect = [];

    for (let i = 0; i < contents.length; i++) {
        const interconnect = contents[i];

        console.log(interconnect);

        let urlLiquidacion = `https://magnavoz-us.digitalkcloud.com/Reporting/BIreports/aggregate#A1%20month:1st/-300/asig_carrier_group=cc%20GSS-MGV%20Soles;asig_netgroup=${interconnect}/akeeDfgych7AfiOgaCfqQc45fvZdnTdy/dc:604/Untitled%20report`

        await page.goto(urlLiquidacion, {
            waitUntil: 'networkidle0',
        });

        // let w = 0

        let dtg_asig_netgroup_contents = [];

        while (true) 
        {           
           
            const dtg_asig_netgroup = await page.waitForFunction(() => {
                const dtg_asig_netgroup = [...document.querySelectorAll('.dtg-cell.dtg_asig_netgroup')];
                return dtg_asig_netgroup.length ? dtg_asig_netgroup : null;
            });
    
            //await page.$('.dtg-cell.dtg_lcr_zone')
    
            dtg_asig_netgroup_contents = await dtg_asig_netgroup.evaluate(els => els.map(e => e.textContent));
    
            //console.log('dtg_lcr_zone_contents===================',dtg_asig_netgroup_contents[0])

            if(dtg_asig_netgroup_contents[0] == interconnect){

                const dtg_asig= await page.waitForFunction(() => {
                    const dtg_asig = [...document.querySelectorAll('.dtg-cell.dtg_lcr_zone')];
                    return dtg_asig.length ? dtg_asig : null;
                });

                dtg_asig_netgroup_contents = await dtg_asig.evaluate(els => els.map(e => e.textContent));

                if(dtg_asig_netgroup_contents[0] != 'undefined'){
                    break;
                }
                
            }

            await delay(3000);
        }

        //console.log('OK===>',dtg_asig_netgroup_contents)
        // await delay(30000);
           

        // page.on('response', response => {
        //     const url = response.request().url();
        //     const contentType = response.headers()['content-type'];
        //     console.log('contentType===========',contentType);
        //     // if (/* URL and/or contentType matches pattern */) {
        //     //     const fileName = path.basename(response.request().url());
        //     //     // handle and rename file name (after making sure it's downloaded)
        //     // }
        // });

        await page.click('#actionMenuButton');

        await page.click('#export');

        let isDownloadLiquidation = await validateDownloadFileLiquidation();

        if(isDownloadLiquidation){
            console.log('archivo de liquidacion: ' + interconnect +', descargado.')
            await renameAndMoveLiquidation(interconnect);
        }        
        

        //descargamos el reporte de llamadas

        

        await page.goto(`https://magnavoz-us.digitalkcloud.com/Reporting/BiReports/cdrs.html#A1%20month:1st/0/asig_carrier_group=cc%20GSS-MGV%20Soles;asig_netgroup=${interconnect};asig_invite_status=200/aga:bgDbgOmeG2h7OdZWdB/dc:840/Untitled%20report`, {
            waitUntil: 'networkidle0',
        });

        await page.click('#actionMenuButton');

        await page.click('#export'); 

        await page.waitForResponse(response => response.status() === 200)

        const ExportTemplates = await page.waitForSelector('#ExportTemplates', {
            visible: true,
            // timeout: 0
        });

        const filter = "26,29,30,32,33,37,38,16,18,19,76,49"

        await ExportTemplates.select(filter);        

        const Export = await page.waitForSelector('#Export', {
            visible: true,
            // timeout: 0
        });    

        await Export.click();

        let isDownload = await validateDownloadFile();

        if(isDownload){
            //se encontro el archivo de reporte descargado cdrs_20230101_000000.csv
            //renombramos el reporte CDR_Troncal_cc GSS 38012_UNICEF

            //console.log(isDownload);

            await renameAndMoveCdrs(interconnect);

            //continuamos           

        }


        await generateReport(interconnect);



        

        // await delay(100000)


        listaInterconnect.push(interconnect);

        console.log('cargo 200')


        
    }

    //comprimimos todo en un rar
    await comprimirAll(listaInterconnect);
   

}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const removeColum = async(path,newNameFile) => {

    return new Promise( (resolve,reject)=> {

        fs.createReadStream(path)
        .pipe(csv.parse({delimiter: ',', columns: true}))
        .pipe(csv.transform((input) => {
          // console.log(input);
          delete input['Customer Interconnect'];
          //renameFile = input['Customer Interconnect'];
          //console.log(input['Customer Interconnect']);
          return input;
        }))
        .pipe(csv.stringify({header: true}))
        .pipe(fs.createWriteStream(directoryPath + '\\' + newNameFile + '.csv'))
        .on('finish', () => {
          console.log('finish....');
          resolve(true);
        }).on('error', () => {
          console.log('error.....');
        
          
        });

    })

    

}

const selecting = async (p, dom, v, att) => {
    var d = await p.$('[' + att + '="' + dom + '"]');
    await d.select(v);
}

const checkFile = async () => {

    let date_ob = new Date();
    if (D != null) {
        date_ob.setDate(date_ob.getDate() - Number(D));
    }
    let date = ("01");
    let month = ("0" + (date_ob.getMonth() -1)).slice(-2);
    let year = date_ob.getFullYear();

    let oldPath = "";
    if (data.COMPANY == "RECSA") {
        date = "01";
        oldPath = `cdrs_${year}${month}${date}_000000.csv`
    } else {
        oldPath = `cdrs_${year}${month}${date}_050000.csv`
    }


    //const oldPath = `cdrs_${year}${month}${date}_050000.csv`
    // console.log(oldPath)
    const newPath = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/${year}${month}${date}.csv`
    const directory = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/`
    return await new Promise(resolve => {

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            });
            console.log('Directorio creado')
        }

        const refreshId = setInterval(() => {

            fs.access(oldPath, fs.F_OK, (err) => {
                if (err) {
                    // console.error(err)
                    console.log('archivo no existe')

                } else {
                    //file exists
                    console.log('archivo existe')
                    fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err
                        console.log('Successfully renamed - AKA moved!')
                        resolve(true);
                        clearInterval(refreshId);
                        //return true
                    })
                }
            })
        }, 6000);

    })

}

const uploadFile = async (data, D = null) => {
    try {
        console.log(D)
        let date_ob = new Date();
        if (D != null) {
            date_ob.setDate(date_ob.getDate() - Number(D));
        }
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        // console.log(oldPath)
        if (data.COMPANY == "RECSA") {
            date = "01";
        }

        const path = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/${year}${month}${date}.csv`

        if (data.COMPANY == "KOBSA") {
            return await uploadfile(path, `${data.FTP_FOLDER_MAIN}/${year}/${month}/`, `${year}${month}${date}.csv`, data.FTP_CN);
        } else {
            return await uploadfile(path, `${data.FTP_FOLDER_MAIN}/${year}/`, `${year}${month}${date}.csv`, data.FTP_CN);
        }
    } catch (ex) {
        throw ex
    }




}

const screenShotAndSendTelegram = async (page, message, all = false) => {
    let rute = `./screenshots/picture_kobsa.jpeg`
    if (all) {
        await screenshot({
            filename: rute
        });
    } else {
        await page.screenshot({
            path: rute
        });
    }


    

    await sendMessageWhatsApp(message, true, rute);
}

const getArgs = async () => {
    const args = {};

    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            // console.log(arg)
            // long arg
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            // flags
            else if (arg[0] === '-') {
                const flags = arg.slice(1, arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });

    //process.env.PORT

    //console.log(args.COMPANY);

    await login(args.COMPANY, args.D)
    // const data = companies.find(x=>x.COMPANY == args.COMPANY)
    // uploadFile(data,args.D)


    //console.log(result)
    //return args;
}

//getArgs();

initProc();