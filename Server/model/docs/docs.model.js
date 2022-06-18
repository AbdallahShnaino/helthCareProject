const Doc = require('./docs.schema')

async function insertDoc(document) {
    let doc = {
        owner:document.owner ,
        name:document.name ,
        url:document.url ,
    }
    return Doc.create(doc);
}

async function getDocs (id) {
    return await Doc.find({owner:id})
}


async function getPatientsDocuments (array) {
   return await new Promise(async(resolve, reject) => {
     let id =undefined   
     let docContainer = undefined

    if (array.length > 0){
        for (let i of array) {
            id = i.identity
            let docs = await getDocs(id)
            for ( let doc of docs){
                docContainer = {name:doc.name , url:doc.url }
                for (let patient of array){
                    if (patient.identity == id) {
                        patient.documents.push(docContainer)
                    }
                }
            }
        }
    }
          resolve(array);
      })
}




module.exports = {insertDoc,getDocs,getPatientsDocuments}
