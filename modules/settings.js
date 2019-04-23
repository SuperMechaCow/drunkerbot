const settings = {
    'appver' : '2.1.1',
    'TIMERRESET': 15, // Number of seconds before getting more exp
    'LEVELMULTIPLIER': 100, // You need this much experience * your current level to level up
    'MAXEXPGAIN': 5, // Each time you gain exp, it's between 0 and this number
    'EXPMULTIPLIER': 5, // Then it's multiplied by this number
    'DOOTEE_BONUS': 1,
    'DOOTER_BONUS': 0.25,
    'defaultResults': {
        "state": false,
        "host": "none",
        "userdiscordID": "none",
        "userAvatar": "none",
        "url": "none",
        "start": "none",
        "end": "none"
    }
}

module.exports = settings;
