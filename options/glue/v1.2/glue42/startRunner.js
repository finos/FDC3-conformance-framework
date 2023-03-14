window.webPlatformConfig = {
    applications: {
        local: [
            {
                "name": "MockApp",
                "title": "Mock App",
                "description": "Testing spec conformance",
                "type": "window",
                "details": {
                    "url": "http://localhost:3001/v1.2/general",
                    "top": 100,
                    "left": 100,
                    "width": 800,
                    "height": 600,
                    "icon": "http://localhost:3000/scott-logic-icon-256.png"
                }
            },
            {
                "name": "IntentAppA",
                "title": "Intent App A",
                "type": "window",
                "details": {
                    "url": "http://localhost:3001/v1.2/intent-a",
                    "top": 100,
                    "left": 100,
                    "width": 800,
                    "height": 600,
                    "icon": "http://localhost:3000/scott-logic-icon-256.png"
                },
                "intents": [
                    {
                        "name": "aTestingIntent",
                        "displayName": "A Testing Intent",
                        "contexts": ["testContextX", "testContextZ"]
                    },
                    {
                        "name": "sharedTestingIntent1",
                        "displayName": "Shared Testing Intent",
                        "contexts": ["testContextX"]
                    }
                ]
            },
            {
                "name": "IntentAppB",
                "title": "Intent App B",
                "description": "Testing find intent B",
                "type": "window",
                "details": {
                    "url": "http://localhost:3001/v1.2/intent-b",
                    "top": 100,
                    "left": 100,
                    "width": 800,
                    "height": 600,
                    "icon": "http://localhost:3101/scott-logic-icon-256.png"
                },
                "intents": [
                    {
                        "name": "bTestingIntent",
                        "displayName": "B Testing Intent",
                        "contexts": ["testContextY"]
                    },
                    {
                        "name": "sharedTestingIntent1",
                        "displayName": "Shared Testing Intent",
                        "contexts": ["testContextX", "testContextY"]
                    }
                ]
            },
            {
                "name": "IntentAppC",
                "title": "Intent App C",
                "description": "Testing find intent C",
                "type": "window",
                "details": {
                    "url": "http://localhost:3001/v1.2/intent-c",
                    "top": 100,
                    "left": 100,
                    "width": 800,
                    "height": 600,
                    "icon": "http://localhost:3102/scott-logic-icon-256.png"
                },
                "intents": [
                    {
                        "name": "cTestingIntent",
                        "displayName": "C Testing Intent",
                        "contexts": ["testContextX"]
                    }
                ]
            },
            {
                "name": "ChannelsApp",
                "title": "Channels App",
                "description": "Testing channels app",
                "type": "window",
                "details": {
                    "url": "http://localhost:3001/v1.2/channels",
                    "top": 100,
                    "left": 100,
                    "width": 800,
                    "height": 600,
                    "icon": "http://localhost:3000/scott-logic-icon-256.png"
                }
            }
        ]
    },
    channels: {
        definitions: [
            {
                "name": "Red",
                "meta": {
                    "color": "red"
                }
            },
            {
                "name": "Green",
                "meta": {
                    "color": "green"
                }
            },
            {
                "name": "Blue",
                "meta": {
                    "color": "#66ABFF"
                }
            },
            {
                "name": "Yellow",
                "meta": {
                    "color": "#FFE733"
                }
            },
            {
                "name": "Orange",
                "meta": {
                    "color": "#fa5a28"
                }
            },
            {
                "name": "Purple",
                "meta": {
                    "color": "#c873ff"
                }
            },
            {
                "name": "Magenta",
                "meta": {
                    "color": "#cc338b"
                }
            },
            {
                "name": "Cyan",
                "meta": {
                    "color": "#80f3ff"
                }
            }
        ]
    }
}