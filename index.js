const { stringSimilarity } = require('string-similarity-js')
const fs = require('fs')
const advertisers = require('./advertisers.json')
const exceptionAdvertisers = require('./exceptionsSimilar.json')

const similarityCoefficient = 0.6

const getSimilarAdvertisers = () => {
    let _advertisers = [...advertisers]
    const similarStructure = []
    const uniqueStructure = []

    while (_advertisers.length > 0) {
        const [principalAdvertiser, ...restAdvertisers] = _advertisers
        const similarAdvertisers = [principalAdvertiser]
        console.log('principalAdvertiser: ', principalAdvertiser)
        for (const advertiser of restAdvertisers) {
            if (
              stringSimilarity(principalAdvertiser.name, advertiser.name) > similarityCoefficient 
              && !exceptionAdvertisers.includes(advertiser._id)
              && !exceptionAdvertisers.includes(principalAdvertiser._id)
            ) {
              similarAdvertisers.push(advertiser);
            }
        }
        console.log('similarAdvertisers: ', similarAdvertisers)
        _advertisers = _advertisers.filter(item => !similarAdvertisers.map(item => item._id).includes(item._id))

        if (similarAdvertisers.length > 1) {
            similarStructure.push(similarAdvertisers)
        } else {
            uniqueStructure.push(similarAdvertisers)
        }
    }

    const allSimilars = similarStructure.reduce( (acc, cur) => ([...acc, ...cur ]) , [])


    console.log('similarStructure: ', JSON.stringify(similarStructure))
    console.log('similarStructure length: ', similarStructure.length)
    console.log('uniqueStructure length: ', uniqueStructure.length)
    console.log('allSimilars length: ', allSimilars.length)

    fs.writeFile(__dirname + '/similarStructure.json', JSON.stringify(similarStructure), (err) => {
        if (err) {
            console.log('error escribiendo archivo', err)
        } else {
            console.log('se escribio en el archivo correctamente')
        }
    } )

    fs.writeFile(__dirname + '/uniqueStructure.json', JSON.stringify(uniqueStructure), (err) => {
        if (err) {
            console.log('error escribiendo archivo', err)
        } else {
            console.log('se escribio en el archivo correctamente')
        }
    } )
}

const unifyStructures = () => {
    const fileSimilarStructure = fs.readFileSync(__dirname + '/similarStructure.json', { encoding: 'utf8' })
    const fileUniqueStructure = fs.readFileSync(__dirname + '/uniqueStructure.json', { encoding: 'utf8' })
    const similarStructure = JSON.parse(fileSimilarStructure)
    const uniqueStructure = JSON.parse(fileUniqueStructure)

    const joinStructures = Array.of(...similarStructure, ...uniqueStructure)
    console.log('joinStructures: ', joinStructures.length)

    const unifiedStructure = joinStructures.map(item => {
        const [firstAdvertiser] = item
        return {
            name: firstAdvertiser.name,
            ids: item.map(a => a._id)
        }
    })

    unifiedStructure.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      })

    console.log('unifiedStructure: ', unifiedStructure.length)

    fs.writeFile(__dirname + '/unifiedStructure.json', JSON.stringify(unifiedStructure), (err) => {
        if (err) {
            console.log('error escribiendo archivo', err)
        } else {
            console.log('se escribio en el archivo correctamente')
        }
    } )
}

// getSimilarAdvertisers()
// console.log(exceptionAdvertisers.length)
unifyStructures()