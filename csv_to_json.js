const fs = require('fs');
const path = require('path');

const csv = require('csvtojson')

const convert = async(interconnect) => { 

    const Path = `C:\\Users\\Anthony\\Downloads\\TEMPGSS\\`;
    const NameFile = `${interconnect}.csv`;

 

    let list = await csv().fromFile(Path + NameFile);

    //console.log(list);
    

    // let list_Routing_Zone = filterValuePart(list,'mobile');
    // console.log('list_Routing_Zone===>',list_Routing_Zone.length)

    return list;
}

const convertCDR = async(interconnect) => { 

    const Path = `C:\\Users\\Anthony\\Downloads\\`;
    const NameFile = `CDR_Troncal_${interconnect}.csv`;
    // CDR_Troncal_cc GSS_BCP_BOT_38022

 

    let list = await csv().fromFile(Path + NameFile);

    //console.log(list);
    

    // let list_Routing_Zone = filterValuePart(list,'mobile');
    // console.log('list_Routing_Zone===>',list_Routing_Zone.length)

    return list;
}

module.exports = {
    convert,
    convertCDR
}
