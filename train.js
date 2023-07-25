const {dockStart} = require('@nlpjs/basic')

const trainModel = async () => {
    const dock = await dockStart({use : ['Basic']})
    const nlp = dock.get('nlp')

    await nlp.addCorpus('./intent.json')
    await nlp.train()

    console.log('training is done')
}

trainModel()