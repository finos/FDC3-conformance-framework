const init = async () => {
    const config = {
        intents: {
            enableIntentsResolverUI: false,
        },
    };

    const glue = await GlueWeb(config);

    console.log(`GlueWeb initialized successfully with version: ${glue.version}`);
};

init().catch(console.error);
