const path = require('path');
const fs = require('fs');
const csvparser = require('csv-parser')
const csv = require('csv');
const directoryPath = 'C:\\Users\\Anthony\\Downloads';//path.join(__dirname, 'Documents');

const prepare_files = async(newNameFile) => {

    return new Promise( (resolve,reject)=> {

        while (true) {

            fs.readdir(directoryPath, function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                } 
                //listing all files using forEach
                files.forEach(async function(file) {
                    // Do whatever you want to do with the file
                    //var str = "Welcome to GeeksforGeeks.";
                   
    
                        var check = file.includes("aggregate");
                        console.log('check file===>',check)
                        if(check){
                            
                            console.log('archivo encontrado.....',file);
                            await removeColum(directoryPath + '\\' + file, newNameFile)
                            fs.unlinkSync(directoryPath + '\\' + file);
        
                            resolve(true);
                        }
                    
                });
            });

            // break;                    
        }
        
        

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

module.exports = {
    prepare_files
}

