let util;
let chalk;

function E(code, message, constructor = Error) {
  exports[code] = (...args) => {
    util || (util = require('util'));
    chalk || (chalk = require('chalk'));

    args = args.map(arg => chalk.green(arg));

    const err = new constructor(util.format(message, ...args));
    err.code = code;

    return err;
  };
}

/*
 * Data errors.
 */
E('ERR_NOT_ALLOWED_VALUE', 'Not allowed value %s');
E('ERR_NOT_MATCHED_VALUE', 'Value %s not matched pattern %s');
E('ERR_PROHIBITED_PROPERTY', 'Prohibited property %s');
E('ERR_PROPERTY_NOT_FOUND', 'Property not found');
E('ERR_REQUIRED', 'Missing required property');
E('ERR_TYPE_MISMATCH', 'Type mismatch, expected %s');
E('ERR_UNKNOWN_PROPERTY', 'Unknown property %s');

/*
 * Schema errors.
 */
E('ERR_SCHEMA_AMBIGUOUS_COMMAND', 'Ambiguous command. Schema path %s');
E('ERR_SCHEMA_NOT_SUPPORTED_TYPE', 'Not supported type %s. Schema path %s');
E('ERR_SCHEMA_UNDEFINED', 'Undefined schema. Schema path %s');
E('ERR_SCHEMA_UNKNOWN_SYMBOL', 'Unknown symbol %s. Schema path %s');
E('ERR_SCHEMA_TYPE_MISMATCH', 'Type mismatch, expected %s. Schema path %s');
