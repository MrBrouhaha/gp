'use strict';
require('rootpath')();

var cassandra = require('libs/cassandra/cql');
var cql = require('config/index.js').cassandra.cql;
var multiline = require('multiline');

//15 fields
var INSERT_PLAYER_CQL = multiline(function() {/*
  INSERT INTO baseball_player (
    player_id,
    current_value,
    full_name,
    first_name,
    last_name,
    team,
    status,
    position,
    profile_url,
    uniform_number,
    height,
    weight,
    age,
    image,
    statistics
  ) VALUES
    (?, ?, ?, ?, ?, 
     ?, ?, ?, ?, ?, 
     ?, ?, ?, ?, ?);
*/});

var INSERT_CURRENT_VALUE_INDEX = 1;
var INSERT_STATISTICS_INDEX = 14;
exports.insert = function (fields, callback) {
  cassandra.query(
    INSERT_PLAYER_CQL, 
    fields, 
    cql.types.consistencies.one, 
    callback);
};

var DELETE_PLAYER_CQL = multiline(function() {/*
  DELETE FROM baseball_player WHERE player_id = ?;
*/});
exports.delete = function (playerId, callback) {
  cassandra.query(
    DELETE_PLAYER_CQL, 
    [playerId], 
    cql.types.consistencies.one, 
    callback);
};

var UPDATE_PLAYER_CQL_1 = multiline(function() {/*
  UPDATE baseball_player SET
*/});
var UPDATE_PLAYER_CQL_2 = multiline(function() {/*
  WHERE
    player_id = ?;
*/});
exports.update = function (playerId, fields, params, callback) {
  var fieldsLength = fields.length;
  var paramsLength = params.length;
  var updates = '';
  if (fields.length !== params.length) {
    callback(new Error('Number of fields and parameters are not the same.'));
  }
  for (var i = 0; i < fieldsLength; i++) {
    updates += (fields[i] + ' = ?');

    if (i < (fieldsLength - 1)) {
      updates += ', ';
    }
  }
  cassandra.query(
    UPDATE_PLAYER_CQL_1 + ' ' + updates + ' ' + UPDATE_PLAYER_CQL_2,
    params.concat([playerId]), 
    cql.types.consistencies.one,
    callback);
};

var SELECT_PLAYER_CQL = multiline(function () {/*
  SELECT * FROM baseball_player WHERE player_id = ?;
*/});
exports.select = function (playerId, callback) {
  cassandra.queryOneRow(
    SELECT_PLAYER_CQL,
    [playerId], 
    cql.types.consistencies.one,
    callback);
};

var SELECT_PLAYERS_USING_TEAM_CQL = multiline(function () {/*
  SELECT * FROM baseball_player WHERE team = ?;
*/});
exports.selectUsingTeam = function (team, callback) {
  cassandra.query(
    SELECT_PLAYERS_USING_TEAM_CQL, 
    [team], 
    cql.types.consistencies.one,
    callback);
}

var AUTOCOMPLETE_QUERY = multiline(function() {/*
  SELECT player_id, full_name FROM baseball_player
*/});
exports.selectAllPlayerNames = function(callback) {
  cassandra.query(
    AUTOCOMPLETE_QUERY, 
    [], 
    cql.types.consistencies.one, 
    callback);
}

var ADD_STATISTICS_QUERY = multiline(function() {/*
  UPDATE baseball_player SET statistics = statistics + ? WHERE player_id = ?
*/});
exports.addStatistics = function (playerId, statisticsId, callback) {
  cassandra.query(
    ADD_STATISTICS_QUERY, 
    [[statisticsId], playerId], 
    cql.types.consistencies.one,
    callback
  );
}

var DELETE_SPECIFIC_STATISTICS_QUERY = multiline(function() {/*
  UPDATE baseball_player SET statistics = statistics - ? WHERE player_id = ?
*/});
exports.deleteStatistics = function (playerId, statisticsId, callback) {
  cassandra.query(
    DELETE_SPECIFIC_STATISTICS_QUERY, 
    [[statisticsId], playerId], 
    cql.types.consistencies.one,
    callback
  );
}