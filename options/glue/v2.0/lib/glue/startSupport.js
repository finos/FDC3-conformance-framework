const init = async() => {
    const glue = await GlueWeb();

    window.glue = glue;

    console.log("Glue initialized successfully")
}

init().catch(console.error);
