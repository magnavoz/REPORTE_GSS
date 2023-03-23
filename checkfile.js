const fs = require('fs');
const path = require('path');

const validateDownloadFile = async () => {

    let date_ob = new Date();

    let date = ("01");
    let month = ("0" + (date_ob.getMonth(-1))).slice(-2);
    let year = date_ob.getFullYear();

    const fileToFind = `cdrs_${year}${month}${date}_000000.csv`;
    const path = `C:\\Users\\Anthony\\Downloads\\${fileToFind}`;

    return await new Promise(resolve => {
        const refreshId = setInterval(() => {

            fs.access(path, fs.F_OK, async (err) => {
                if (err) {
                    // console.error(err)
                    console.log('archivo no existe')
                } else {
                    //file exists
                    console.log('archivo existe')
                    resolve(true);
                    clearInterval(refreshId);
                }
            })
        }, 5000);
    });

}


const validateDownloadFileLiquidation = async () => {


    const path = `C:\\Users\\Anthony\\Downloads\\aggregate.csv`;

    // const fileToFind = `cdrs_${year}${month}${date}_000000.csv`;
    // const path = `C:\\Users\\Anthony\\Downloads\\${fileToFind}`;

    return await new Promise(resolve => {
        const refreshId = setInterval(() => {

            fs.access(path, fs.F_OK, async (err) => {
                if (err) {
                    // console.error(err)
                    console.log('archivo no existe')
                } else {
                    //file exists
                    console.log('archivo existe')
                    resolve(true);
                    clearInterval(refreshId);
                }
            })
        }, 5000);
    });

}

const renameAndMoveCdrs = async (newNameFile) => {

    let date_ob = new Date();

    let date = ("01");
    let month = ("0" + (date_ob.getMonth(-1))).slice(-2);
    let year = date_ob.getFullYear();

    const fileToFind = `cdrs_${year}${month}${date}_000000.csv`;
    const path = `C:\\Users\\Anthony\\Downloads\\`;

    return await new Promise(resolve => {
        fs.rename(path + fileToFind, path + 'CDR_Troncal_' + newNameFile + '.csv', function (err) {
            if (err) throw err
            console.log('Renombre completo en: ' + path + newNameFile + '.csv')
            resolve(true);
        });
    })

}

const renameAndMoveLiquidation = async (interconnect) => {

    const fileToFind = `aggregate.csv`;
    const path = `C:\\Users\\Anthony\\Downloads\\`;
    const newPath = `C:\\Users\\Anthony\\Downloads\\TEMPGSS\\`;
    const newNameFile = `${interconnect}.csv`;

    return await new Promise(resolve => {
        fs.rename((path + fileToFind), (newPath + newNameFile), function (err) {
            if (err) throw err
            console.log(`Renombre completo en: ${newPath + newNameFile}`)
            resolve(true);
        });
    })

}

const createDirectoryTEMPGSS = async () => {

    const directory = `C:\\Users\\Anthony\\Downloads\\TEMPGSS\\`;

    fs.access(directory, function (error) {
        if (error) {
            console.log("Directory does not exist.")
            console.log("Creando directorio.")

            fs.mkdir(directory, (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Directory created successfully!');
            });

        } else {
            console.log("Directory exists.")
            console.log("Limpiando directorio...")

            fs.readdir(directory, (err, files) => {
                if (err) throw err;
        
                for (const file of files) {
                    fs.unlink(path.join(directory, file), (err) => {
                        if (err) throw err;
                    });
                }
            });
        }
    })



    

}

module.exports = {
    validateDownloadFile,
    validateDownloadFileLiquidation,
    renameAndMoveCdrs,
    renameAndMoveLiquidation,
    createDirectoryTEMPGSS
}