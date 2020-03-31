const settings = {
    'appver' : '3.1.0',
    'prefix' : '!#',
    'TIMERRESET': 15, // Number of seconds before getting more exp
    'LEVELMULTIPLIER': 100, // You need this much experience * your current level to level up
    'MAXEXPGAIN': 5, // Each time you gain exp, it's between 0 and this number
    'EXPMULTIPLIER': 5, // Then it's multiplied by this number
    'DOOTEE_BONUS': 1,
    'DOOTER_BONUS': 0.25,
    'defaultResults': {
        "host": null,
        "userdiscordID": null,
        "userAvatar": null,
        "url": null,
        "start": null,
        "end": null
    }
}

module.exports = settings;
