exports.up = function (r, connection) {
    return r.dbCreate('nfl').run(connection)
        .catch(() => {})
        .then(() => 
            Promise.all([
                r.tableCreate('games').run(connection),
                r.tableCreate('users').run(connection),
                r.tableCreate('timestamps').run(connection),
                r.tableCreate('bets').run(connection)
            ])
        )
};

exports.down = function (r, connection) {
  
};