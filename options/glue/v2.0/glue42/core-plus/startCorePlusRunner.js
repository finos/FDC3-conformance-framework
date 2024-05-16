const init = async () => {
    const config = {
        licenseKey: "<<add license key here>",
        applications: {
            local: [
                {
                    name: "ChannelsAppId",
                    title: "Channels App",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/channels",
                    },
                    icon: "http://localhost:3001/finos-icon-256.png",
                    version: "1.0.0",
                },
                {
                    name: "IntentAppAId",
                    title: "Intent App A",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-a",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "aTestingIntent",
                            displayName: "A Testing Intent",
                            contexts: ["testContextX", "testContextZ"],
                        },
                        {
                            name: "sharedTestingIntent1",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextX"],
                        },
                    ],
                    icon: "http://localhost:3000/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppBId",
                    title: "Intent App B",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-b",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent1",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextX", "testContextY"],
                            resultType: "testContextY",
                        },
                    ],
                    icon: "http://localhost:3101/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppCId",
                    title: "Intent App C",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-c",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "cTestingIntent",
                            displayName: "C Testing Intent",
                            contexts: ["testContextX"],
                            resultType: "testContextZ",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppDId",
                    title: "Intent App D",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-d",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextX"],
                            resultType: "testContextZ",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppEId",
                    title: "Intent App E",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-e",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextY"],
                            resultType: "channel",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppFId",
                    title: "Intent App F",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-f",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextY"],
                            resultType: "channel<testContextZ>",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppGId",
                    title: "Intent App G",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-g",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextY"],
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppHId",
                    title: "Intent App H",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-h",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextY"],
                            resultType: "testContextZ",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppIId",
                    title: "Intent App I",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-i",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "sharedTestingIntent2",
                            displayName: "Shared Testing Intent",
                            contexts: ["testContextY"],
                            resultType: "testContextZ",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppJId",
                    title: "Intent App J",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-j",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "privateChannelIsPrivate",
                            displayName: "J Testing Intent",
                            contexts: ["privateChannelDetails"],
                            resultType: "privateChannelIsPrivateResult",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "IntentAppKId",
                    title: "Intent App K",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/intent-k",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    intents: [
                        {
                            name: "kTestingIntent",
                            displayName: "K Testing Intent",
                            contexts: ["testContextX"],
                            resultType: "channel<testContextZ>",
                        },
                    ],
                    icon: "http://localhost:3102/scott-logic-icon-256.png",
                },
                {
                    name: "OpenAppAId",
                    title: "Open App A",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/open-a",
                    },
                    icon: "http://localhost:3001/finos-icon-256.png",
                },
                {
                    name: "OpenAppBId",
                    title: "Open App B",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/open-b",
                    },
                    icon: "http://localhost:3001/finos-icon-256.png",
                },
                {
                    name: "MockAppId",
                    title: "Mock App",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/general",
                        top: 100,
                        left: 100,
                        width: 800,
                        height: 600,
                    },
                    icon: "http://localhost:3000/scott-logic-icon-256.png",
                },
                {
                    name: "MetadataAppId",
                    title: "App Title",
                    description: "Part of the FDC3 2.0 Conformance Tests - developed for FINOS by Scott Logic",
                    type: "window",
                    details: {
                        url: "http://localhost:3001/v2.0/metadata",
                    },
                    customProperties: {
                        screenshots: [
                            {
                                src: "http://localhost:3001/finos-icon-256.png",
                            },
                        ],
                    },
                    tooltip: "placeholder",
                    icon: "http://localhost:3001/finos-icon-256.png",
                    version: "1.0.0",
                },
            ],
        },
        channels: {
            definitions: [
                {
                    name: "Red",
                    meta: {
                        color: "red",
                        fdc3: {
                            id: "fdc3.channel.1",
                            displayMetadata: {
                                name: "Channel 1",
                                glyph: "1",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Orange",
                    meta: {
                        color: "#fa5a28",
                        fdc3: {
                            id: "fdc3.channel.2",
                            displayMetadata: {
                                name: "Channel 2",
                                glyph: "2",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Yellow",
                    meta: {
                        color: "#FFE733",
                        fdc3: {
                            id: "fdc3.channel.3",
                            displayMetadata: {
                                name: "Channel 3",
                                glyph: "3",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Green",
                    meta: {
                        color: "green",
                        fdc3: {
                            id: "fdc3.channel.4",
                            displayMetadata: {
                                name: "Channel 4",
                                glyph: "4",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Cyan",
                    meta: {
                        color: "#80f3ff",
                        fdc3: {
                            id: "fdc3.channel.5",
                            displayMetadata: {
                                name: "Channel 5",
                                glyph: "5",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Blue",
                    meta: {
                        color: "blue",
                        fdc3: {
                            id: "fdc3.channel.6",
                            displayMetadata: {
                                name: "Channel 6",
                                glyph: "6",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Magenta",
                    meta: {
                        color: "#cc338b",
                        fdc3: {
                            id: "fdc3.channel.7",
                            displayMetadata: {
                                name: "Channel 7",
                                glyph: "7",
                            },
                        },
                    },
                    data: {},
                },
                {
                    name: "Purple",
                    meta: {
                        color: "#c873ff",
                        fdc3: {
                            id: "fdc3.channel.8",
                            displayMetadata: {
                                name: "Channel 8",
                                glyph: "8",
                            },
                        },
                    },
                    data: {},
                },
            ],
        },
        intents: {
            enableIntentsResolverUI: false,
        },
    };

    const { glue } = await Glue42CorePlus(config);

    window.glue = glue;

    console.log(`Glue42CorePlus initialized successfully with version: ${glue.version}`);
};

init().catch(console.error);
