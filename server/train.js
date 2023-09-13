const {dockStart} = require('@nlpjs/basic')

const trainModel = async () => {
    const dock = await dockStart({use : ['Basic','LangEn']})
    const nlp = dock.get('nlp')

    // await nlp.addCorpus('./intent.json')
    await nlp.addCorpus('./intent_btns.json')
    await nlp.train()

    console.log('training is done')
}

trainModel()