var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityCancellationType = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.workflow_commands.ActivityCancellationType
var ActivityCancellationType;
(function (ActivityCancellationType) {
    ActivityCancellationType[ActivityCancellationType["TRY_CANCEL"] = 0] = "TRY_CANCEL";
    ActivityCancellationType[ActivityCancellationType["WAIT_CANCELLATION_COMPLETED"] = 1] = "WAIT_CANCELLATION_COMPLETED";
    ActivityCancellationType[ActivityCancellationType["ABANDON"] = 2] = "ABANDON";
})(ActivityCancellationType || (exports.ActivityCancellationType = ActivityCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = exports.cutoffStackTrace = void 0;
const failure_1 = __webpack_require__(/*! ../failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
function combineRegExp(...regexps) {
    return new RegExp(regexps.map((x) => `(?:${x.source})`).join('|'));
}
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = combineRegExp(
/** Activity execution */
/\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/, 
/** Workflow activation */
/\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/, 
/** Workflow run anything in context */
/\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/);
/**
 * Any stack trace frames that match any of those wil be dopped.
 * The "null." prefix on some cases is to avoid https://github.com/nodejs/node/issues/42417
 */
const DROPPED_STACK_FRAMES_PATTERNS = combineRegExp(
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?next \(.*[\\/]common[\\/](?:src|lib)[\\/]interceptors\.[jt]s:\d+:\d+\)/, 
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?executeNextHandler \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/);
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    for (const line of lines) {
        if (CUTOFF_STACK_PATTERNS.test(line))
            break;
        if (!DROPPED_STACK_FRAMES_PATTERNS.test(line))
            acc.push(line);
    }
    return acc.join('\n');
}
exports.cutoffStackTrace = cutoffStackTrace;
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), failure.timeoutFailureInfo.timeoutType ?? failure_1.TimeoutType.TIMEOUT_TYPE_UNSPECIFIED);
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.message ?? undefined, failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, failure.activityFailureInfo.retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: err.timeoutType,
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isError)(err)) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = exports.mapFromPayloads = exports.arrayFromPayloads = exports.fromPayloadsAtIndex = exports.mapToPayloads = exports.toPayloads = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
exports.toPayloads = toPayloads;
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
exports.mapToPayloads = mapToPayloads;
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
exports.arrayFromPayloads = arrayFromPayloads;
function mapFromPayloads(converter, map) {
    if (map == null)
        return map;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
exports.mapFromPayloads = mapFromPayloads;
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return (
        // Wrap with Uint8Array from this context to ensure `instanceof` works
        (content.data ? new Uint8Array(content.data.buffer, content.data.byteOffset, content.data.length) : content.data));
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (err) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!Array.isArray(values)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const [idx, value] of values.entries()) {
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const [idx, value] of values.entries()) {
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.ValueError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = Array.isArray(value) ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const time = __importStar(__webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
exports.tsToMs = tsToMs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
exports.msNumberToTs = msNumberToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
exports.msToTs = msToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
exports.msOptionalToTs = msOptionalToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
exports.msToNumber = msToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
exports.tsToDate = tsToDate;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}
exports.optionalTsToDate = optionalTsToDate;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.TextEncoder = exports.TextDecoder = void 0;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
exports.encode = encode;
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}
exports.decode = decode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamespaceNotFoundError = exports.WorkflowNotFoundError = exports.WorkflowExecutionAlreadyStartedError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
const failure_1 = __webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
let ValueError = class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.ValueError = ValueError;
exports.ValueError = ValueError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ValueError')
], ValueError);
/**
 * Thrown when a Payload Converter is misconfigured.
 */
let PayloadConverterError = class PayloadConverterError extends ValueError {
};
exports.PayloadConverterError = PayloadConverterError;
exports.PayloadConverterError = PayloadConverterError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('PayloadConverterError')
], PayloadConverterError);
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
let IllegalStateError = class IllegalStateError extends Error {
};
exports.IllegalStateError = IllegalStateError;
exports.IllegalStateError = IllegalStateError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('IllegalStateError')
], IllegalStateError);
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow Id is currently running
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
let WorkflowExecutionAlreadyStartedError = class WorkflowExecutionAlreadyStartedError extends failure_1.TemporalFailure {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
    }
};
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowExecutionAlreadyStartedError')
], WorkflowExecutionAlreadyStartedError);
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
let WorkflowNotFoundError = class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
    }
};
exports.WorkflowNotFoundError = WorkflowNotFoundError;
exports.WorkflowNotFoundError = WorkflowNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowNotFoundError')
], WorkflowNotFoundError);
/**
 * Thrown when the specified namespace is not known to Temporal Server.
 */
let NamespaceNotFoundError = class NamespaceNotFoundError extends Error {
    constructor(namespace) {
        super(`Namespace not found: '${namespace}'`);
        this.namespace = namespace;
    }
};
exports.NamespaceNotFoundError = NamespaceNotFoundError;
exports.NamespaceNotFoundError = NamespaceNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('NamespaceNotFoundError')
], NamespaceNotFoundError);


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rootCause = exports.ensureTemporalFailure = exports.ensureApplicationFailure = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.RetryState = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.TimeoutType
var TimeoutType;
(function (TimeoutType) {
    TimeoutType[TimeoutType["TIMEOUT_TYPE_UNSPECIFIED"] = 0] = "TIMEOUT_TYPE_UNSPECIFIED";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_START_TO_CLOSE"] = 1] = "TIMEOUT_TYPE_START_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_START"] = 2] = "TIMEOUT_TYPE_SCHEDULE_TO_START";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_CLOSE"] = 3] = "TIMEOUT_TYPE_SCHEDULE_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_HEARTBEAT"] = 4] = "TIMEOUT_TYPE_HEARTBEAT";
})(TimeoutType || (exports.TimeoutType = TimeoutType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.RetryState
var RetryState;
(function (RetryState) {
    RetryState[RetryState["RETRY_STATE_UNSPECIFIED"] = 0] = "RETRY_STATE_UNSPECIFIED";
    RetryState[RetryState["RETRY_STATE_IN_PROGRESS"] = 1] = "RETRY_STATE_IN_PROGRESS";
    RetryState[RetryState["RETRY_STATE_NON_RETRYABLE_FAILURE"] = 2] = "RETRY_STATE_NON_RETRYABLE_FAILURE";
    RetryState[RetryState["RETRY_STATE_TIMEOUT"] = 3] = "RETRY_STATE_TIMEOUT";
    RetryState[RetryState["RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED"] = 4] = "RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED";
    RetryState[RetryState["RETRY_STATE_RETRY_POLICY_NOT_SET"] = 5] = "RETRY_STATE_RETRY_POLICY_NOT_SET";
    RetryState[RetryState["RETRY_STATE_INTERNAL_SERVER_ERROR"] = 6] = "RETRY_STATE_INTERNAL_SERVER_ERROR";
    RetryState[RetryState["RETRY_STATE_CANCEL_REQUESTED"] = 7] = "RETRY_STATE_CANCEL_REQUESTED";
})(RetryState || (exports.RetryState = RetryState = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
let TemporalFailure = class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.TemporalFailure = TemporalFailure;
exports.TemporalFailure = TemporalFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TemporalFailure')
], TemporalFailure);
/** Exceptions originated at the Temporal service. */
let ServerFailure = class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
    }
};
exports.ServerFailure = ServerFailure;
exports.ServerFailure = ServerFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ServerFailure')
], ServerFailure);
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
let ApplicationFailure = class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, cause } = options;
        return new this(message, type, nonRetryable, details, cause);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
};
exports.ApplicationFailure = ApplicationFailure;
exports.ApplicationFailure = ApplicationFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ApplicationFailure')
], ApplicationFailure);
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
let CancelledFailure = class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
    }
};
exports.CancelledFailure = CancelledFailure;
exports.CancelledFailure = CancelledFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('CancelledFailure')
], CancelledFailure);
/**
 * Used as the `cause` when a Workflow has been terminated
 */
let TerminatedFailure = class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
    }
};
exports.TerminatedFailure = TerminatedFailure;
exports.TerminatedFailure = TerminatedFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TerminatedFailure')
], TerminatedFailure);
/**
 * Used to represent timeouts of Activities and Workflows
 */
let TimeoutFailure = class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
    }
};
exports.TimeoutFailure = TimeoutFailure;
exports.TimeoutFailure = TimeoutFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TimeoutFailure')
], TimeoutFailure);
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ActivityFailure = class ActivityFailure extends TemporalFailure {
    constructor(message, activityType, activityId, retryState, identity, cause) {
        super(message, cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
    }
};
exports.ActivityFailure = ActivityFailure;
exports.ActivityFailure = ActivityFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ActivityFailure')
], ActivityFailure);
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ChildWorkflowFailure = class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
    }
};
exports.ChildWorkflowFailure = ChildWorkflowFailure;
exports.ChildWorkflowFailure = ChildWorkflowFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ChildWorkflowFailure')
], ChildWorkflowFailure);
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
exports.ensureApplicationFailure = ensureApplicationFailure;
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
exports.ensureTemporalFailure = ensureTemporalFailure;
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    return (0, type_helpers_1.errorMessage)(error);
}
exports.rootCause = rootCause;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.str = exports.u8 = void 0;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "./node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "./node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "./node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "./node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "./node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "./node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./logger */ "./node_modules/@temporalio/common/lib/logger.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "./node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
__exportStar(__webpack_require__(/*! ./versioning-intent */ "./node_modules/@temporalio/common/lib/versioning-intent.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
exports.u8 = u8;
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
exports.str = str;
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}
exports.errorCode = errorCode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = void 0;
/**
 * Compose all interceptor methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We lose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}
exports.composeInterceptors = composeInterceptors;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/logger.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SdkComponent = void 0;
/**
 * Possible values of the `sdkComponent` meta attributes on log messages. This
 * attribute indicates which subsystem emitted the log message; this may for
 * example be used to implement fine-grained filtering of log messages.
 *
 * Note that there is no guarantee that this list will remain stable in the
 * future; values may be added or removed, and messages that are currently
 * emitted with some `sdkComponent` value may use a different value in the future.
 */
var SdkComponent;
(function (SdkComponent) {
    /**
     * Component name for messages emited from Workflow code, using the {@link Workflow context logger|workflow.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["workflow"] = "workflow";
    /**
     * Component name for messages emited from an activity, using the {@link activity context logger|Context.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["activity"] = "activity";
    /**
     * Component name for messages emited from a Temporal Worker instance.
     *
     * This notably includes:
     * - Issues with Worker or runtime configuration, or the JS execution environment;
     * - Worker's, Activity's, and Workflow's lifecycle events;
     * - Workflow Activation and Activity Task processing events;
     * - Workflow bundling messages;
     * - Sink processing issues.
     */
    SdkComponent["worker"] = "worker";
    /**
     * Component name for all messages emitted by the Rust Core SDK library.
     */
    SdkComponent["core"] = "core";
})(SdkComponent || (exports.SdkComponent = SdkComponent = {}));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decompileRetryPolicy = exports.compileRetryPolicy = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
exports.compileRetryPolicy = compileRetryPolicy;
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}
exports.decompileRetryPolicy = decompileRetryPolicy;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalDateToTs = exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const long_1 = __importDefault(__webpack_require__(/*! long */ "./node_modules/long/umd/index.js")); // eslint-disable-line import/no-named-as-default
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "./node_modules/ms/dist/index.cjs"));
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
exports.tsToMs = tsToMs;
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
exports.msNumberToTs = msNumberToTs;
function msToTs(str) {
    return msNumberToTs(msToNumber(str));
}
exports.msToTs = msToTs;
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
exports.msOptionalToTs = msOptionalToTs;
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return msWithValidation(val);
}
exports.msToNumber = msToNumber;
function msWithValidation(str) {
    const millis = (0, ms_1.default)(str);
    if (millis == null || isNaN(millis)) {
        throw new TypeError(`Invalid duration string: '${str}'`);
    }
    return millis;
}
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
exports.tsToDate = tsToDate;
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
exports.optionalTsToDate = optionalTsToDate;
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}
exports.optionalDateToTs = optionalDateToTs;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deepFreeze = exports.SymbolBasedInstanceOfError = exports.assertNever = exports.errorCode = exports.errorMessage = exports.isAbortError = exports.isError = exports.hasOwnProperties = exports.hasOwnProperty = exports.isRecord = exports.checkExtends = void 0;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
exports.checkExtends = checkExtends;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
exports.isRecord = isRecord;
function hasOwnProperty(record, prop) {
    return prop in record;
}
exports.hasOwnProperty = hasOwnProperty;
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
exports.hasOwnProperties = hasOwnProperties;
function isError(error) {
    return (isRecord(error) &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        (error.stack == null || typeof error.stack === 'string'));
}
exports.isError = isError;
function isAbortError(error) {
    return isError(error) && error.name === 'AbortError';
}
exports.isAbortError = isAbortError;
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
exports.errorMessage = errorMessage;
function isErrorWithCode(error) {
    return isRecord(error) && typeof error.code === 'string';
}
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (isErrorWithCode(error)) {
        return error.code;
    }
    return undefined;
}
exports.errorCode = errorCode;
/**
 * Asserts that some type is the never type
 */
function assertNever(msg, x) {
    throw new TypeError(msg + ': ' + x);
}
exports.assertNever = assertNever;
/**
 * A decorator to be used on error classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
function SymbolBasedInstanceOfError(markerName) {
    return (clazz) => {
        const marker = Symbol.for(`__temporal_is${markerName}`);
        Object.defineProperty(clazz.prototype, 'name', { value: markerName, enumerable: true });
        Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
        Object.defineProperty(clazz, Symbol.hasInstance, {
            // eslint-disable-next-line object-shorthand
            value: function (error) {
                if (this === clazz) {
                    return isRecord(error) && error[marker] === true;
                }
                else {
                    // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
                    // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
                    // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
                    //
                    // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
                    // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
                    // behavior (which is NOT cross-realm safe).
                    return this.prototype.isPrototypeOf(error); // eslint-disable-line no-prototype-builtins
                }
            },
        });
    };
}
exports.SymbolBasedInstanceOfError = SymbolBasedInstanceOfError;
// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            try {
                deepFreeze(value);
            }
            catch (err) {
                // This is okay, there are some typed arrays that cannot be frozen (encodingKeys)
            }
        }
        else if (typeof value === 'function') {
            Object.freeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent-enum.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versioningIntentToProto = exports.VersioningIntent = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.common.VersioningIntent
/**
 * Protobuf enum representation of {@link VersioningIntentString}.
 *
 * @experimental
 */
var VersioningIntent;
(function (VersioningIntent) {
    VersioningIntent[VersioningIntent["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    VersioningIntent[VersioningIntent["COMPATIBLE"] = 1] = "COMPATIBLE";
    VersioningIntent[VersioningIntent["DEFAULT"] = 2] = "DEFAULT";
})(VersioningIntent || (exports.VersioningIntent = VersioningIntent = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function versioningIntentToProto(intent) {
    switch (intent) {
        case 'DEFAULT':
            return VersioningIntent.DEFAULT;
        case 'COMPATIBLE':
            return VersioningIntent.COMPATIBLE;
        case undefined:
            return VersioningIntent.UNSPECIFIED;
        default:
            (0, type_helpers_1.assertNever)('Unexpected VersioningIntent', intent);
    }
}
exports.versioningIntentToProto = versioningIntentToProto;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent.js":
/*!******************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractWorkflowType = exports.WorkflowIdReusePolicy = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.WorkflowIdReusePolicy
/**
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * Whether a Workflow can be started with a Workflow Id of a Closed Workflow.
 *
 * *Note: A Workflow can never be started with a Workflow Id of a Running Workflow.*
 */
var WorkflowIdReusePolicy;
(function (WorkflowIdReusePolicy) {
    /**
     * No need to use this.
     *
     * (If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.)
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED"] = 0] = "WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE"] = 1] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"] = 2] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY";
    /**
     * The Workflow cannot be started.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE"] = 3] = "WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE";
    /**
     * Terminate the current workflow if one is already running.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING"] = 4] = "WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING";
})(WorkflowIdReusePolicy || (exports.WorkflowIdReusePolicy = WorkflowIdReusePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function extractWorkflowType(workflowTypeOrFunc) {
    if (typeof workflowTypeOrFunc === 'string')
        return workflowTypeOrFunc;
    if (typeof workflowTypeOrFunc === 'function') {
        if (workflowTypeOrFunc?.name)
            return workflowTypeOrFunc.name;
        throw new TypeError('Invalid workflow type: the workflow function is anonymous');
    }
    throw new TypeError(`Invalid workflow type: expected either a string or a function, got '${typeof workflowTypeOrFunc}'`);
}
exports.extractWorkflowType = extractWorkflowType;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/alea.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/alea.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = exports.alea = void 0;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
exports.alea = alea;
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSleepImplementation = exports.RootCancellationScope = exports.disableStorage = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * Cancellation Scopes provide the mechanic by which a Workflow may gracefully handle incoming requests for cancellation
 * (e.g. in response to {@link WorkflowHandle.cancel} or through the UI or CLI), as well as request cancelation of
 * cancellable operations it owns (e.g. Activities, Timers, Child Workflows, etc).
 *
 * Cancellation Scopes form a tree, with the Workflow's main function running in the root scope of that tree.
 * By default, cancellation propagates down from a parent scope to its children and its cancellable operations.
 * A non-cancellable scope can receive cancellation requests, but is never effectively considered as cancelled,
 * thus shieldding its children and cancellable operations from propagation of cancellation requests it receives.
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods {@link cancellable},
 * {@link nonCancellable} and {@link withTimeout}. `withTimeout` creates a scope that automatically cancels itself after
 * some duration.
 *
 * Cancellation of a cancellable scope results in all operations created directly in that scope to throw a
 * {@link CancelledFailure} (either directly, or as the `cause` of an {@link ActivityFailure} or a
 * {@link ChildWorkflowFailure}). Further attempt to create new cancellable scopes or cancellable operations within a
 * scope that has already been cancelled will also immediately throw a {@link CancelledFailure} exception. It is however
 * possible to create a non-cancellable scope at that point; this is often used to execute rollback or cleanup
 * operations. For example:
 *
 * ```ts
 * async function myWorkflow(...): Promise<void> {
 *   try {
 *     // This activity runs in the root cancellation scope. Therefore, a cancelation request on
 *     // the Workflow execution (e.g. through the UI or CLI) automatically propagates to this
 *     // activity. Assuming that the activity properly handle the cancellation request, then the
 *     // call below will throw an `ActivityFailure` exception, with `cause` sets to an
 *     // instance of `CancelledFailure`.
 *     await someActivity();
 *   } catch (e) {
 *     if (isCancellation(e)) {
 *       // Run cleanup activity in a non-cancellable scope
 *       await CancellationScope.nonCancellable(async () => {
 *         await cleanupActivity();
 *       }
 *     } else {
 *       throw e;
 *     }
 *   }
 * }
 * ```
 *
 * A cancellable scope may be programatically cancelled by calling {@link cancel|`scope.cancel()`}`. This may be used,
 * for example, to explicitly request cancellation of an Activity or Child Workflow:
 *
 * ```ts
 * const cancellableActivityScope = new CancellationScope();
 * const activityPromise = cancellableActivityScope.run(() => someActivity());
 * cancellableActivityScope.cancel(); // Cancels the activity
 * await activityPromise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = (0, time_1.msOptionalToNumber)(options?.timeout);
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // @ts-expect-error TSC doesn't understand that the Promise executor runs synchronously
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            if (this.parent.cancellable ||
                (__classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f") &&
                    !(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation))) {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    this.reject(err);
                }));
            }
            else {
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    if (!(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                        this.reject(err);
                    }
                }));
            }
        }
    }
    /**
     * Whether the scope was effectively cancelled. A non-cancellable scope can never be considered cancelled.
     */
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        let timerScope;
        if (this.timeout) {
            timerScope = new CancellationScope();
            (0, stack_helpers_1.untrackPromise)(timerScope
                .run(() => sleep(this.timeout))
                .then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        try {
            return await fn();
        }
        finally {
            if (timerScope &&
                !timerScope.consideredCancelled &&
                (0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                timerScope.cancel();
            }
        }
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return storage.getStore() ?? globalThis.__TEMPORAL_ACTIVATOR__.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
const storage = new exports.AsyncLocalStorage();
/**
 * Avoid exposing the storage directly so it doesn't get frozen
 */
function disableStorage() {
    storage.disable();
}
exports.disableStorage = disableStorage;
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}
exports.registerSleepImplementation = registerSleepImplementation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/errors.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/errors.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCancellation = exports.LocalActivityDoBackoff = exports.DeterminismViolationError = exports.WorkflowError = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Base class for all workflow errors
 */
let WorkflowError = class WorkflowError extends Error {
};
exports.WorkflowError = WorkflowError;
exports.WorkflowError = WorkflowError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowError')
], WorkflowError);
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakRef()
 */
let DeterminismViolationError = class DeterminismViolationError extends WorkflowError {
};
exports.DeterminismViolationError = DeterminismViolationError;
exports.DeterminismViolationError = DeterminismViolationError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('DeterminismViolationError')
], DeterminismViolationError);
/**
 * A class that acts as a marker for this special result type
 */
let LocalActivityDoBackoff = class LocalActivityDoBackoff extends Error {
    constructor(backoff) {
        super();
        this.backoff = backoff;
    }
};
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
exports.LocalActivityDoBackoff = LocalActivityDoBackoff = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('LocalActivityDoBackoff')
], LocalActivityDoBackoff);
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    return (err instanceof common_1.CancelledFailure ||
        ((err instanceof common_1.ActivityFailure || err instanceof common_1.ChildWorkflowFailure) && err.cause instanceof common_1.CancelledFailure));
}
exports.isCancellation = isCancellation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/flags.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/flags.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.assertValidFlag = exports.SdkFlags = void 0;
const flagsRegistry = new Map();
exports.SdkFlags = {
    /**
     * This flag gates multiple fixes related to cancellation scopes and timers introduced in 1.10.2/1.11.0:
     * - Cancellation of a non-cancellable scope no longer propagates to children scopes
     *   (see https://github.com/temporalio/sdk-typescript/issues/1423).
     * - CancellationScope.withTimeout(fn) now cancel the timer if `fn` completes before expiration
     *   of the timeout, similar to how `condition(fn, timeout)` works.
     * - Timers created using setTimeout can now be intercepted.
     *
     * @since Introduced in 1.10.2/1.11.0.
     */
    NonCancellableScopesAreShieldedFromPropagation: defineFlag(1, false),
};
function defineFlag(id, def) {
    const flag = { id, default: def };
    flagsRegistry.set(id, flag);
    return flag;
}
function assertValidFlag(id) {
    if (!flagsRegistry.has(id))
        throw new TypeError(`Unknown SDK flag: ${id}`);
}
exports.assertValidFlag = assertValidFlag;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-attributes.js":
/*!********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-attributes.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getActivator = exports.assertInWorkflowContext = exports.maybeGetActivator = exports.setActivatorUntyped = exports.maybeGetActivatorUntyped = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
function maybeGetActivatorUntyped() {
    return globalThis.__TEMPORAL_ACTIVATOR__;
}
exports.maybeGetActivatorUntyped = maybeGetActivatorUntyped;
function setActivatorUntyped(activator) {
    globalThis.__TEMPORAL_ACTIVATOR__ = activator;
}
exports.setActivatorUntyped = setActivatorUntyped;
function maybeGetActivator() {
    return maybeGetActivatorUntyped();
}
exports.maybeGetActivator = maybeGetActivator;
function assertInWorkflowContext(message) {
    const activator = maybeGetActivator();
    if (activator == null)
        throw new common_1.IllegalStateError(message);
    return activator;
}
exports.assertInWorkflowContext = assertInWorkflowContext;
function getActivator() {
    const activator = maybeGetActivator();
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}
exports.getActivator = getActivator;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-overrides.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-overrides.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.overrideGlobals = void 0;
/**
 * Overrides some global objects to make them deterministic.
 *
 * @module
 */
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const workflow_1 = __webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, global_attributes_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, global_attributes_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    const timeoutCancelationScopes = new Map();
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        ms = Math.max(1, ms);
        const activator = (0, global_attributes_1.getActivator)();
        if (activator.hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
            // Capture the sequence number that sleep will allocate
            const seq = activator.nextSeqs.timer;
            const timerScope = new cancellation_scope_1.CancellationScope({ cancellable: true });
            const sleepPromise = timerScope.run(() => (0, workflow_1.sleep)(ms));
            sleepPromise.then(() => {
                timeoutCancelationScopes.delete(seq);
                cb(...args);
            }, () => {
                timeoutCancelationScopes.delete(seq);
            });
            (0, stack_helpers_1.untrackPromise)(sleepPromise);
            timeoutCancelationScopes.set(seq, timerScope);
            return seq;
        }
        else {
            const seq = activator.nextSeqs.timer++;
            // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
            new Promise((resolve, reject) => {
                activator.completions.timer.set(seq, { resolve, reject });
                activator.pushCommand({
                    startTimer: {
                        seq,
                        startToFireTimeout: (0, time_1.msToTs)(ms),
                    },
                });
            }).then(() => cb(...args), () => undefined /* ignore cancellation */);
            return seq;
        }
    };
    global.clearTimeout = function (handle) {
        const activator = (0, global_attributes_1.getActivator)();
        const timerScope = timeoutCancelationScopes.get(handle);
        if (timerScope) {
            timeoutCancelationScopes.delete(handle);
            timerScope.cancel();
        }
        else {
            activator.nextSeqs.timer++; // Shouldn't increase seq number, but that's the legacy behavior
            activator.completions.timer.delete(handle);
            activator.pushCommand({
                cancelTimer: {
                    seq: handle,
                },
            });
        }
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, global_attributes_1.getActivator)().random();
}
exports.overrideGlobals = overrideGlobals;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Updates, Signals and Queries
 *
 * Use {@link setHandler} to set handlers for Updates, Signals, and Queries.
 *
 * Update and Signal handlers can be either async or non-async functions. Update handlers may return a value, but signal
 * handlers may not (return `void` or `Promise<void>`). You may use Activities, Timers, child Workflows, etc in Update
 * and Signal handlers, but this should be done cautiously: for example, note that if you await async operations such as
 * these in an Update or Signal handler, then you are responsible for ensuring that the workflow does not complete first.
 *
 * Query handlers may **not** be async functions, and may **not** mutate any variables or use Activities, Timers,
 * child Workflows, etc.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-update-signal-query-example-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.log = exports.proxySinks = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "./node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
Object.defineProperty(exports, "proxySinks", ({ enumerable: true, get: function () { return sinks_1.proxySinks; } }));
var logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
Object.defineProperty(exports, "log", ({ enumerable: true, get: function () { return logs_1.log; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "./node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interceptors.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interfaces.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentClosePolicy = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
let ContinueAsNew = class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
    }
};
exports.ContinueAsNew = ContinueAsNew;
exports.ContinueAsNew = ContinueAsNew = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ContinueAsNew')
], ContinueAsNew);
/**
 * Specifies:
 * - whether cancellation requests are sent to the Child
 * - whether and when a {@link CanceledFailure} is thrown from {@link executeChild} or
 *   {@link ChildWorkflowHandle.result}
 *
 * @default {@link ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED}
 */
var ChildWorkflowCancellationType;
(function (ChildWorkflowCancellationType) {
    /**
     * Don't send a cancellation request to the Child.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["ABANDON"] = 0] = "ABANDON";
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["TRY_CANCEL"] = 1] = "TRY_CANCEL";
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_COMPLETED"] = 2] = "WAIT_CANCELLATION_COMPLETED";
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_REQUESTED"] = 3] = "WAIT_CANCELLATION_REQUESTED";
})(ChildWorkflowCancellationType || (exports.ChildWorkflowCancellationType = ChildWorkflowCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * How a Child Workflow reacts to the Parent Workflow reaching a Closed state.
 *
 * @see {@link https://docs.temporal.io/concepts/what-is-a-parent-close-policy/ | Parent Close Policy}
 */
var ParentClosePolicy;
(function (ParentClosePolicy) {
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_UNSPECIFIED"] = 0] = "PARENT_CLOSE_POLICY_UNSPECIFIED";
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_TERMINATE"] = 1] = "PARENT_CLOSE_POLICY_TERMINATE";
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_ABANDON"] = 2] = "PARENT_CLOSE_POLICY_ABANDON";
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_REQUEST_CANCEL"] = 3] = "PARENT_CLOSE_POLICY_REQUEST_CANCEL";
})(ParentClosePolicy || (exports.ParentClosePolicy = ParentClosePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/internals.js":
/*!************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/internals.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Activator = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const alea_1 = __webpack_require__(/*! ./alea */ "./node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "./node_modules/@temporalio/workflow/lib/pkg.js"));
const logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
var StartChildWorkflowExecutionFailedCause;
(function (StartChildWorkflowExecutionFailedCause) {
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED"] = 0] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED";
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS"] = 1] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS";
})(StartChildWorkflowExecutionFailedCause || (StartChildWorkflowExecutionFailedCause = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, getTimeOfDay, randomnessSeed, patches, registeredActivityNames, }) {
        /**
         * Cache for modules - referenced in reusable-vm.ts
         */
        this.moduleCache = new Map();
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered Update calls until a handler is registered
         */
        this.bufferedUpdates = Array();
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = Array();
        /**
         * Holds buffered query calls until a handler is registered.
         *
         * **IMPORTANT** queries are only buffered until workflow is started.
         * This is required because async interceptors might block workflow function invocation
         * which delays query handler registration.
         */
        this.bufferedQueries = Array();
        /**
         * Mapping of update name to handler and validator
         */
        this.updateHandlers = new Map();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                {
                    handler: () => {
                        return this.getStackTraces()
                            .map((s) => s.formatted)
                            .join('\n\n');
                    },
                    description: 'Returns a sensible stack trace.',
                },
            ],
            [
                '__enhanced_stack_trace',
                {
                    handler: () => {
                        const { sourceMap } = this;
                        const sdk = { name: 'typescript', version: pkg_1.default.version };
                        const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                        const sources = {};
                        if (this.showStackTraceSources) {
                            for (const { locations } of stacks) {
                                for (const { filePath } of locations) {
                                    if (!filePath)
                                        continue;
                                    const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(filePath)];
                                    if (!content)
                                        continue;
                                    sources[filePath] = [
                                        {
                                            content,
                                            lineOffset: 0,
                                        },
                                    ];
                                }
                            }
                        }
                        return { sdk, stacks, sources };
                    },
                    description: 'Returns a stack trace annotated with source information.',
                },
            ],
            [
                '__temporal_workflow_metadata',
                {
                    handler: () => {
                        const workflowType = this.info.workflowType;
                        const queryDefinitions = Array.from(this.queryHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const signalDefinitions = Array.from(this.signalHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const updateDefinitions = Array.from(this.updateHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        return {
                            definition: {
                                type: workflowType,
                                description: null, // For now, do not set the workflow description in the TS SDK.
                                queryDefinitions,
                                signalDefinitions,
                                updateDefinitions,
                            },
                        };
                    },
                    description: 'Returns metadata associated with this workflow.',
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = { inbound: [], outbound: [], internals: [] };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * This is tracked to allow buffering queries until a workflow function is called.
         * TODO(bergundy): I don't think this makes sense since queries run last in an activation and must be responded to in
         * the same activation.
         */
        this.workflowFunctionWasCalled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        this.knownFlags = new Set();
        /**
         * Buffered sink calls per activation
         */
        this.sinkCalls = Array();
        this.getTimeOfDay = getTimeOfDay;
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        this.registeredActivityNames = registeredActivityNames;
        if (info.unsafe.isReplaying) {
            for (const patchId of patches) {
                this.notifyHasPatch({ patchId });
            }
        }
    }
    mutateWorkflowInfo(fn) {
        this.info = fn(this.info);
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        // Only query responses may be sent after completion
        if (this.completed && !cmd.respondToQuery)
            return;
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    concludeActivation() {
        return {
            commands: this.commands.splice(0),
            usedInternalFlags: [...this.knownFlags],
        };
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        let promise;
        try {
            promise = workflow(...args);
        }
        finally {
            // Queries must be handled even if there was an exception when invoking the Workflow function.
            this.workflowFunctionWasCalled = true;
            // Empty the buffer
            const buffer = this.bufferedQueries.splice(0);
            for (const activation of buffer) {
                this.queryWorkflow(activation);
            }
        }
        return await promise;
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)((0, logs_1.executeWithLifecycleLogging)(() => execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        })).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new errors_1.LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (activation.failed.cause !==
                StartChildWorkflowExecutionFailedCause.START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS) {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally non-async function so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName)?.handler;
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        if (!this.workflowFunctionWasCalled) {
            this.bufferedQueries.push(activation);
            return;
        }
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    doUpdate(activation) {
        const { id: updateId, protocolInstanceId, name, headers, runValidator } = activation;
        if (!updateId) {
            throw new TypeError('Missing activation update id');
        }
        if (!name) {
            throw new TypeError('Missing activation update name');
        }
        if (!protocolInstanceId) {
            throw new TypeError('Missing activation update protocolInstanceId');
        }
        if (!this.updateHandlers.has(name)) {
            this.bufferedUpdates.push(activation);
            return;
        }
        const makeInput = () => ({
            updateId,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            name,
            headers: headers ?? {},
        });
        // The implementation below is responsible for upholding, and constrained
        // by, the following contract:
        //
        // 1. If no validator is present then validation interceptors will not be run.
        //
        // 2. During validation, any error must fail the Update; during the Update
        //    itself, Temporal errors fail the Update whereas other errors fail the
        //    activation.
        //
        // 3. The handler must not see any mutations of the arguments made by the
        //    validator.
        //
        // 4. Any error when decoding/deserializing input must be caught and result
        //    in rejection of the Update before it is accepted, even if there is no
        //    validator.
        //
        // 5. The initial synchronous portion of the (async) Update handler should
        //    be executed after the (sync) validator completes such that there is
        //    minimal opportunity for a different concurrent task to be scheduled
        //    between them.
        //
        // 6. The stack trace view provided in the Temporal UI must not be polluted
        //    by promises that do not derive from user code. This implies that
        //    async/await syntax may not be used.
        //
        // Note that there is a deliberately unhandled promise rejection below.
        // These are caught elsewhere and fail the corresponding activation.
        let input;
        try {
            if (runValidator && this.updateHandlers.get(name)?.validator) {
                const validate = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'validateUpdate', this.validateUpdateNextHandler.bind(this));
                validate(makeInput());
            }
            input = makeInput();
        }
        catch (error) {
            this.rejectUpdate(protocolInstanceId, error);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleUpdate', this.updateNextHandler.bind(this));
        this.acceptUpdate(protocolInstanceId);
        (0, stack_helpers_1.untrackPromise)(execute(input)
            .then((result) => this.completeUpdate(protocolInstanceId, result))
            .catch((error) => {
            if (error instanceof common_1.TemporalFailure) {
                this.rejectUpdate(protocolInstanceId, error);
            }
            else {
                throw error;
            }
        }));
    }
    async updateNextHandler({ name, args }) {
        const entry = this.updateHandlers.get(name);
        if (!entry) {
            return Promise.reject(new common_1.IllegalStateError(`No registered update handler for update: ${name}`));
        }
        const { handler } = entry;
        return await handler(...args);
    }
    validateUpdateNextHandler({ name, args }) {
        const { validator } = this.updateHandlers.get(name) ?? {};
        if (validator) {
            validator(...args);
        }
    }
    dispatchBufferedUpdates() {
        const bufferedUpdates = this.bufferedUpdates;
        while (bufferedUpdates.length) {
            const foundIndex = bufferedUpdates.findIndex((update) => this.updateHandlers.has(update.name));
            if (foundIndex === -1) {
                // No buffered Updates have a handler yet.
                break;
            }
            const [update] = bufferedUpdates.splice(foundIndex, 1);
            this.doUpdate(update);
        }
    }
    rejectBufferedUpdates() {
        while (this.bufferedUpdates.length) {
            const update = this.bufferedUpdates.shift();
            if (update) {
                this.rejectUpdate(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                update.protocolInstanceId, common_1.ApplicationFailure.nonRetryable(`No registered handler for update: ${update.name}`));
            }
        }
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName)?.handler;
        if (fn) {
            return await fn(...args);
        }
        else if (this.defaultSignalHandler) {
            return await this.defaultSignalHandler(signalName, ...args);
        }
        else {
            throw new common_1.IllegalStateError(`No registered signal handler for signal: ${signalName}`);
        }
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        if (!this.signalHandlers.has(signalName) && !this.defaultSignalHandler) {
            this.bufferedSignals.push(activation);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        }).catch(this.handleWorkflowFailure.bind(this));
    }
    dispatchBufferedSignals() {
        const bufferedSignals = this.bufferedSignals;
        while (bufferedSignals.length) {
            if (this.defaultSignalHandler) {
                // We have a default signal handler, so all signals are dispatchable
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.signalWorkflow(bufferedSignals.shift());
            }
            else {
                const foundIndex = bufferedSignals.findIndex((signal) => this.signalHandlers.has(signal.signalName));
                if (foundIndex === -1)
                    break;
                const [signal] = bufferedSignals.splice(foundIndex, 1);
                this.signalWorkflow(signal);
            }
        }
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!activation.patchId) {
            throw new TypeError('Notify has patch missing patch name');
        }
        this.knownPresentPatches.add(activation.patchId);
    }
    patchInternal(patchId, deprecated) {
        if (this.workflow === undefined) {
            throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
        }
        const usePatch = !this.info.unsafe.isReplaying || this.knownPresentPatches.has(patchId);
        // Avoid sending commands for patches core already knows about.
        // This optimization enables development of automatic patching tools.
        if (usePatch && !this.sentPatches.has(patchId)) {
            this.pushCommand({
                setPatchMarker: { patchId, deprecated },
            });
            this.sentPatches.add(patchId);
        }
        return usePatch;
    }
    // Called early while handling an activation to register known flags
    addKnownFlags(flags) {
        for (const flag of flags) {
            (0, flags_1.assertValidFlag)(flag);
            this.knownFlags.add(flag);
        }
    }
    hasFlag(flag) {
        if (this.knownFlags.has(flag.id)) {
            return true;
        }
        if (!this.info.unsafe.isReplaying && flag.default) {
            this.knownFlags.add(flag.id);
            return true;
        }
        return false;
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    acceptUpdate(protocolInstanceId) {
        this.pushCommand({ updateResponse: { protocolInstanceId, accepted: {} } });
    }
    completeUpdate(protocolInstanceId, result) {
        this.pushCommand({
            updateResponse: { protocolInstanceId, completed: this.payloadConverter.toPayload(result) },
        });
    }
    rejectUpdate(protocolInstanceId, error) {
        this.pushCommand({
            updateResponse: {
                protocolInstanceId,
                rejected: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/logs.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/logs.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowLogAttributes = exports.executeWithLifecycleLogging = exports.log = void 0;
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const loggerSink = (0, sinks_1.proxySinks)().__temporal_logger;
/**
 * Symbol used by the SDK logger to extract a timestamp from log attributes.
 * Also defined in `worker/logger.ts` - intentionally not shared.
 */
const LogTimestamp = Symbol.for('log_timestamp');
/**
 * Default workflow logger.
 *
 * This logger is replay-aware and will omit log messages on workflow replay. Messages emitted by this logger are
 * funnelled through a sink that forwards them to the logger registered on {@link Runtime.logger}.
 *
 * Attributes from the current Workflow Execution context are automatically included as metadata on every log
 * entries. An extra `sdkComponent` metadata attribute is also added, with value `workflow`; this can be used for
 * fine-grained filtering of log entries further downstream.
 *
 * To customize log attributes, register a {@link WorkflowOutboundCallsInterceptor} that intercepts the
 * `getLogAttributes()` method.
 *
 * Notice that since sinks are used to power this logger, any log attributes must be transferable via the
 * {@link https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist | postMessage}
 * API.
 *
 * NOTE: Specifying a custom logger through {@link defaultSink} or by manually registering a sink named
 * `defaultWorkerLogger` has been deprecated. Please use {@link Runtime.logger} instead.
 */
exports.log = Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) => {
    return [
        level,
        (message, attrs) => {
            const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.log(...) may only be used from workflow context.');
            const getLogAttributes = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'getLogAttributes', (a) => a);
            return loggerSink[level](message, {
                // Inject the call time in nanosecond resolution as expected by the worker logger.
                [LogTimestamp]: activator.getTimeOfDay(),
                sdkComponent: common_1.SdkComponent.workflow,
                ...getLogAttributes(workflowLogAttributes(activator.info)),
                ...attrs,
            });
        },
    ];
}));
function executeWithLifecycleLogging(fn) {
    exports.log.debug('Workflow started', { sdkComponent: common_1.SdkComponent.worker });
    const p = fn().then((res) => {
        exports.log.debug('Workflow completed', { sdkComponent: common_1.SdkComponent.worker });
        return res;
    }, (error) => {
        // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
        // e.g. by jest or when multiple versions are installed.
        if (typeof error === 'object' && error != null) {
            if ((0, errors_1.isCancellation)(error)) {
                exports.log.debug('Workflow completed as cancelled', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
            else if (error instanceof interfaces_1.ContinueAsNew) {
                exports.log.debug('Workflow continued as new', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
        }
        exports.log.warn('Workflow failed', { error, sdkComponent: common_1.SdkComponent.worker });
        throw error;
    });
    // Avoid showing this interceptor in stack trace query
    (0, stack_helpers_1.untrackPromise)(p);
    return p;
}
exports.executeWithLifecycleLogging = executeWithLifecycleLogging;
/**
 * Returns a map of attributes to be set _by default_ on log messages for a given Workflow.
 * Note that this function may be called from outside of the Workflow context (eg. by the worker itself).
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}
exports.workflowLogAttributes = workflowLogAttributes;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/pkg.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/pkg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/sinks.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/sinks.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Type definitions for the Workflow end of the sinks mechanism.
 *
 * Sinks are a mechanism for exporting data from the Workflow isolate to the
 * Node.js environment, they are necessary because the Workflow has no way to
 * communicate with the outside World.
 *
 * Sinks are typically used for exporting logs, metrics and traces out from the
 * Workflow.
 *
 * Sink functions may not return values to the Workflow in order to prevent
 * breaking determinism.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxySinks = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info("hey ho");
 *       logger.error("lets go");
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, global_attributes_1.assertInWorkflowContext)('Proxied sinks functions may only be used from a Workflow Execution.');
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            // Sink function doesn't get called immediately. Make a clone of the sink's args, so that further mutations
                            // to these objects don't corrupt the args that the sink function will receive. Only available from node 17.
                            args: globalThis.structuredClone ? globalThis.structuredClone(args) : args,
                            // activator.info is internally copy-on-write. This ensure that any further mutations
                            // to the workflow state in the context of the present activation will not corrupt the
                            // workflowInfo state that gets passed when the sink function actually gets called.
                            workflowInfo: activator.info,
                        });
                    };
                },
            });
        },
    });
}
exports.proxySinks = proxySinks;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = (0, global_attributes_1.maybeGetActivatorUntyped)()?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}
exports.untrackPromise = untrackPromise;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/trigger.js":
/*!**********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/trigger.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dispose = exports.shouldUnblockConditions = exports.tryUnblockConditions = exports.getAndResetSinkCalls = exports.concludeActivation = exports.activate = exports.initRuntime = void 0;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const activator = new internals_1.Activator({
        ...options,
        info: fixPrototypes({
            ...options.info,
            unsafe: { ...options.info.unsafe, now: OriginalDate.now },
        }),
    });
    // There's on activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    (0, global_attributes_1.setActivatorUntyped)(activator);
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?2065").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?31ff").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`Failed to initialize workflows interceptors: expected a function, but got: '${factory}'`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflowFn = mod[activator.info.workflowType];
    const defaultWorkflowFn = mod['default'];
    if (typeof workflowFn === 'function') {
        activator.workflow = workflowFn;
    }
    else if (typeof defaultWorkflowFn === 'function') {
        activator.workflow = defaultWorkflowFn;
    }
    else {
        const details = workflowFn === undefined
            ? 'no such function is exported by the workflow bundle'
            : `expected a function, but got: '${typeof workflowFn}'`;
        throw new TypeError(`Failed to initialize workflow of type '${activator.info.workflowType}': ${details}`);
    }
}
exports.initRuntime = initRuntime;
/**
 * Objects transfered to the VM from outside have prototypes belonging to the
 * outer context, which means that instanceof won't work inside the VM. This
 * function recursively walks over the content of an object, and recreate some
 * of these objects (notably Array, Date and Objects).
 */
function fixPrototypes(obj) {
    if (obj != null && typeof obj === 'object') {
        switch (Object.getPrototypeOf(obj)?.constructor?.name) {
            case 'Array':
                return Array.from(obj.map(fixPrototypes));
            case 'Date':
                return new Date(obj);
            default:
                return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fixPrototypes(v)]));
        }
    }
    else
        return obj;
}
/**
 * Run a chunk of activation jobs
 * @returns a boolean indicating whether job was processed or ignored
 */
function activate(activation, batchIndex) {
    const activator = (0, global_attributes_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation, batchIndex }) => {
        if (batchIndex === 0) {
            if (!activation.jobs) {
                throw new TypeError('Got activation with no jobs');
            }
            if (activation.timestamp != null) {
                // timestamp will not be updated for activation that contain only queries
                activator.now = (0, time_1.tsToMs)(activation.timestamp);
            }
            activator.addKnownFlags(activation.availableInternalFlags ?? []);
            // The Rust Core ensures that these activation fields are not null
            activator.mutateWorkflowInfo((info) => ({
                ...info,
                historyLength: activation.historyLength,
                // Exact truncation for multi-petabyte histories
                // historySize === 0 means WFT was generated by pre-1.20.0 server, and the history size is unknown
                historySize: activation.historySizeBytes?.toNumber() || 0,
                continueAsNewSuggested: activation.continueAsNewSuggested ?? false,
                currentBuildId: activation.buildIdForCurrentTask ?? undefined,
                unsafe: {
                    ...info.unsafe,
                    isReplaying: activation.isReplaying ?? false,
                },
            }));
        }
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        for (const job of jobs) {
            if (job.variant === undefined) {
                throw new TypeError('Expected job.variant to be defined');
            }
            const variant = job[job.variant];
            if (!variant) {
                throw new TypeError(`Expected job.${job.variant} to be set`);
            }
            // The only job that can be executed on a completed workflow is a query.
            // We might get other jobs after completion for instance when a single
            // activation contains multiple jobs and the first one completes the workflow.
            if (activator.completed && job.variant !== 'queryWorkflow') {
                return;
            }
            activator[job.variant](variant /* TS can't infer this type */);
            if (shouldUnblockConditions(job)) {
                tryUnblockConditions();
            }
        }
    });
    intercept({
        activation,
        batchIndex,
    });
}
exports.activate = activate;
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, global_attributes_1.getActivator)();
    activator.rejectBufferedUpdates();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const { info } = activator;
    const activationCompletion = activator.concludeActivation();
    const { commands } = intercept({ commands: activationCompletion.commands });
    return {
        runId: info.runId,
        successful: { ...activationCompletion, commands },
    };
}
exports.concludeActivation = concludeActivation;
function getAndResetSinkCalls() {
    return (0, global_attributes_1.getActivator)().getAndResetSinkCalls();
}
exports.getAndResetSinkCalls = getAndResetSinkCalls;
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, global_attributes_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, global_attributes_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
exports.tryUnblockConditions = tryUnblockConditions;
/**
 * Predicate used to prevent triggering conditions for non-query and non-patch jobs.
 */
function shouldUnblockConditions(job) {
    return !job.queryWorkflow && !job.notifyHasPatch;
}
exports.shouldUnblockConditions = shouldUnblockConditions;
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, global_attributes_1.getActivator)().interceptors.internals, 'dispose', async () => {
        (0, cancellation_scope_1.disableStorage)();
    });
    dispose({});
}
exports.dispose = dispose;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/workflow.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/workflow.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowMetadataQuery = exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.upsertSearchAttributes = exports.setDefaultSignalHandler = exports.setHandler = exports.defineQuery = exports.defineSignal = exports.defineUpdate = exports.condition = exports.deprecatePatch = exports.patched = exports.uuid4 = exports.continueAsNew = exports.makeContinueAsNewFunc = exports.inWorkflowContext = exports.workflowInfo = exports.executeChild = exports.startChild = exports.getExternalWorkflowHandle = exports.proxyLocalActivities = exports.proxyActivities = exports.NotAnActivityMethod = exports.scheduleLocalActivity = exports.scheduleActivity = exports.sleep = exports.addDefaultWorkflowOptions = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const versioning_intent_enum_1 = __webpack_require__(/*! @temporalio/common/lib/versioning-intent-enum */ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values to `workflowId` and `workflowIdReusePolicy` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: (args ?? []),
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.sleep(...) may only be used from a Workflow Execution');
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
exports.sleep = sleep;
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, global_attributes_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: options.cancellationType,
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, global_attributes_1.getActivator)();
    // Eagerly fail the local activity (which will in turn fail the workflow task.
    // Do not fail on replay where the local activities may not be registered on the replay worker.
    if (!activator.info.unsafe.isReplaying && !activator.registeredActivityNames.has(activityType)) {
        throw new ReferenceError(`Local activity of type '${activityType}' not registered on worker`);
    }
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: options.cancellationType,
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
exports.scheduleActivity = scheduleActivity;
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleLocalActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof errors_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.tsToMs)(err.backoff.backoffDuration));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
exports.scheduleLocalActivity = scheduleLocalActivity;
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, global_attributes_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: activator.info.namespace, // Not configurable
                headers,
                cancellationType: options.cancellationType,
                workflowIdReusePolicy: options.workflowIdReusePolicy,
                parentClosePolicy: options.parentClosePolicy,
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet("http://example.com");
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyActivities = proxyActivities;
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyLocalActivities = proxyLocalActivities;
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
// The name of this patch comes from an attempt to build a generic internal patching mechanism.
// That effort has been abandoned in favor of a newer WorkflowTaskCompletedMetadata based mechanism.
const CONDITION_0_PATCH = '__sdk_internal_patch_number:1';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.getExternalWorkflowHandle(...) may only be used from a Workflow Execution. Consider using Client.workflow.getHandle(...) instead.)');
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.startChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.start(...) instead.)');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
exports.startChild = startChild;
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.executeChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.execute(...) instead.');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
exports.executeChild = executeChild;
/**
 * Get information about the current Workflow.
 *
 * WARNING: This function returns a frozen copy of WorkflowInfo, at the point where this method has been called.
 * Changes happening at later point in workflow execution will not be reflected in the returned object.
 *
 * For this reason, we recommend calling `workflowInfo()` on every access to {@link WorkflowInfo}'s fields,
 * rather than caching the `WorkflowInfo` object (or part of it) in a local variable. For example:
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * vs
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 * ```
 */
function workflowInfo() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.workflowInfo(...) may only be used from a Workflow Execution.');
    return activator.info;
}
exports.workflowInfo = workflowInfo;
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    return (0, global_attributes_1.maybeGetActivator)() !== undefined;
}
exports.inWorkflowContext = inWorkflowContext;
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.continueAsNew(...) and Workflow.makeContinueAsNewFunc(...) may only be used from a Workflow Execution.');
    const info = activator.info;
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
exports.continueAsNew = continueAsNew;
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
exports.uuid4 = uuid4;
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    return activator.patchInternal(patchId, false);
}
exports.patched = patched;
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    activator.patchInternal(patchId, true);
}
exports.deprecatePatch = deprecatePatch;
async function condition(fn, timeout) {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.condition(...) may only be used from a Workflow Execution.');
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !patched(CONDITION_0_PATCH)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
exports.condition = condition;
function conditionInner(fn) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define an update method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to update Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineUpdate(name) {
    return {
        type: 'update',
        name,
    };
}
exports.defineUpdate = defineUpdate;
/**
 * Define a signal method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to signal Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
exports.defineSignal = defineSignal;
/**
 * Define a query method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to query Workflows using a {@link WorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
exports.defineQuery = defineQuery;
// For Updates and Signals we want to make a public guarantee something like the
// following:
//
//   "If a WFT contains a Signal/Update, and if a handler is available for that
//   Signal/Update, then the handler will be executed.""
//
// However, that statement is not well-defined, leaving several questions open:
//
// 1. What does it mean for a handler to be "available"? What happens if the
//    handler is not present initially but is set at some point during the
//    Workflow code that is executed in that WFT? What happens if the handler is
//    set and then deleted, or replaced with a different handler?
//
// 2. When is the handler executed? (When it first becomes available? At the end
//    of the activation?) What are the execution semantics of Workflow and
//    Signal/Update handler code given that they are concurrent? Can the user
//    rely on Signal/Update side effects being reflected in the Workflow return
//    value, or in the value passed to Continue-As-New? If the handler is an
//    async function / coroutine, how much of it is executed and when is the
//    rest executed?
//
// 3. What happens if the handler is not executed? (i.e. because it wasn't
//    available in the sense defined by (1))
//
// 4. In the case of Update, when is the validation function executed?
//
// The implementation for Typescript is as follows:
//
// 1. sdk-core sorts Signal and Update jobs (and Patches) ahead of all other
//    jobs. Thus if the handler is available at the start of the Activation then
//    the Signal/Update will be executed before Workflow code is executed. If it
//    is not, then the Signal/Update calls is pushed to a buffer.
//
// 2. On each call to setHandler for a given Signal/Update, we make a pass
//    through the buffer list. If a buffered job is associated with the just-set
//    handler, then the job is removed from the buffer and the initial
//    synchronous portion of the handler is invoked on that input (i.e.
//    preempting workflow code).
//
// Thus in the case of Typescript the questions above are answered as follows:
//
// 1. A handler is "available" if it is set at the start of the Activation or
//    becomes set at any point during the Activation. If the handler is not set
//    initially then it is executed as soon as it is set. Subsequent deletion or
//    replacement by a different handler has no impact because the jobs it was
//    handling have already been handled and are no longer in the buffer.
//
// 2. The handler is executed as soon as it becomes available. I.e. if the
//    handler is set at the start of the Activation then it is executed when
//    first attempting to process the Signal/Update job; alternatively, if it is
//    set by a setHandler call made by Workflow code, then it is executed as
//    part of that call (preempting Workflow code). Therefore, a user can rely
//    on Signal/Update side effects being reflected in e.g. the Workflow return
//    value, and in the value passed to Continue-As-New. Activation jobs are
//    processed in the order supplied by sdk-core, i.e. Signals, then Updates,
//    then other jobs. Within each group, the order sent by the server is
//    preserved. If the handler is async, it is executed up to its first yield
//    point.
//
// 3. Signal case: If a handler does not become available for a Signal job then
//    the job remains in the buffer. If a handler for the Signal becomes
//    available in a subsequent Activation (of the same or a subsequent WFT)
//    then the handler will be executed. If not, then the Signal will never be
//    responded to and this causes no error.
//
//    Update case: If a handler does not become available for an Update job then
//    the Update is rejected at the end of the Activation. Thus, if a user does
//    not want an Update to be rejected for this reason, then it is their
//    responsibility to ensure that their application and workflow code interact
//    such that a handler is available for the Update during any Activation
//    which might contain their Update job. (Note that the user often has
//    uncertainty about which WFT their Signal/Update will appear in. For
//    example, if they call startWorkflow() followed by startUpdate(), then they
//    will typically not know whether these will be delivered in one or two
//    WFTs. On the other hand there are situations where they would have reason
//    to believe they are in the same WFT, for example if they do not start
//    Worker polling until after they have verified that both requests have
//    succeeded.)
//
// 5. If an Update has a validation function then it is executed immediately
//    prior to the handler. (Note that the validation function is required to be
//    synchronous).
function setHandler(def, handler, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setHandler(...) may only be used from a Workflow Execution.');
    const description = options?.description;
    if (def.type === 'update') {
        if (typeof handler === 'function') {
            const updateOptions = options;
            const validator = updateOptions?.validator;
            activator.updateHandlers.set(def.name, { handler, validator, description });
            activator.dispatchBufferedUpdates();
        }
        else if (handler == null) {
            activator.updateHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'signal') {
        if (typeof handler === 'function') {
            activator.signalHandlers.set(def.name, { handler: handler, description });
            activator.dispatchBufferedSignals();
        }
        else if (handler == null) {
            activator.signalHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'query') {
        if (typeof handler === 'function') {
            activator.queryHandlers.set(def.name, { handler: handler, description });
        }
        else if (handler == null) {
            activator.queryHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
exports.setHandler = setHandler;
/**
 * Set a signal handler function that will handle signals calls for non-registered signal names.
 *
 * Signals are dispatched to the default signal handler in the order that they were accepted by the server.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.
 */
function setDefaultSignalHandler(handler) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setDefaultSignalHandler(...) may only be used from a Workflow Execution.');
    if (typeof handler === 'function') {
        activator.defaultSignalHandler = handler;
        activator.dispatchBufferedSignals();
    }
    else if (handler == null) {
        activator.defaultSignalHandler = undefined;
    }
    else {
        throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
    }
}
exports.setDefaultSignalHandler = setDefaultSignalHandler;
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertSearchAttributes(...) may only be used from a Workflow Execution.');
    if (searchAttributes == null) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            searchAttributes: {
                ...info.searchAttributes,
                ...searchAttributes,
            },
        };
    });
}
exports.upsertSearchAttributes = upsertSearchAttributes;
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');
exports.workflowMetadataQuery = defineQuery('__temporal_workflow_metadata');


/***/ }),

/***/ "./src/workflows.ts":
/*!**************************!*\
  !*** ./src/workflows.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameWorkflow: () => (/* binding */ GameWorkflow),
/* harmony export */   RoundWorkflow: () => (/* binding */ RoundWorkflow),
/* harmony export */   SnakeWorkerWorkflow: () => (/* binding */ SnakeWorkerWorkflow),
/* harmony export */   SnakeWorkflow: () => (/* binding */ SnakeWorkflow),
/* harmony export */   gameFinishSignal: () => (/* binding */ gameFinishSignal),
/* harmony export */   gameStateQuery: () => (/* binding */ gameStateQuery),
/* harmony export */   roundStartSignal: () => (/* binding */ roundStartSignal),
/* harmony export */   roundStateQuery: () => (/* binding */ roundStateQuery),
/* harmony export */   snakeChangeDirectionSignal: () => (/* binding */ snakeChangeDirectionSignal),
/* harmony export */   snakeMoveSignal: () => (/* binding */ snakeMoveSignal),
/* harmony export */   workerStartedSignal: () => (/* binding */ workerStartedSignal),
/* harmony export */   workerStopSignal: () => (/* binding */ workerStopSignal)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const ROUND_WF_ID = 'SnakeGameRound';
const APPLE_POINTS = 10;
const SNAKE_MOVES_BEFORE_CAN = 50;
const SNAKE_WORKER_DOWN_TIME = '1 seconds';
const { emit } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyLocalActivities)({
    startToCloseTimeout: '1 seconds'
});
const { snakeWorker } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    taskQueue: 'snake-workers',
    startToCloseTimeout: '1 day',
    heartbeatTimeout: 500,
    cancellationType: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ActivityCancellationType.WAIT_CANCELLATION_COMPLETED
});
function randomDirection() {
    const directions = [
        'up',
        'down',
        'left',
        'right'
    ];
    return directions[Math.floor(Math.random() * directions.length)];
}
function oppositeDirection(direction) {
    if (direction === 'up') {
        return 'down';
    } else if (direction === 'down') {
        return 'up';
    } else if (direction === 'left') {
        return 'right';
    } else {
        return 'left';
    }
}
const gameStateQuery = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineQuery)('gameState');
const roundStateQuery = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineQuery)('roundState');
const gameFinishSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('gameFinish');
// UI -> GameWorkflow to start round
const roundStartSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('roundStart');
// Player UI -> SnakeWorkflow to change direction
const snakeChangeDirectionSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('snakeChangeDirection');
// (Internal) SnakeWorkflow -> Round to trigger a move
const snakeMoveSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('snakeMove');
const workerStopSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('workerStop');
const workerStartedSignal = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.defineSignal)('workerStarted');
async function GameWorkflow(config) {
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Starting game');
    const game = {
        config,
        teams: config.teamNames.reduce((acc, name)=>{
            acc[name] = {
                name,
                score: 0
            };
            return acc;
        }, {})
    };
    let finished = false;
    let roundScope;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(gameStateQuery, ()=>{
        return game;
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(gameFinishSignal, ()=>{
        finished = true;
        roundScope === null || roundScope === void 0 ? void 0 : roundScope.cancel();
    });
    let newRound;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(roundStartSignal, async ({ duration, snakes })=>{
        newRound = {
            config,
            teams: buildRoundTeams(game),
            duration,
            snakes
        };
    });
    while(!finished){
        await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>newRound !== undefined);
        roundScope = new _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope();
        try {
            await roundScope.run(async ()=>{
                const roundWf = await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(RoundWorkflow, {
                    workflowId: ROUND_WF_ID,
                    args: [
                        newRound
                    ],
                    parentClosePolicy: _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.ParentClosePolicy.PARENT_CLOSE_POLICY_REQUEST_CANCEL
                });
                newRound = undefined;
                const round = await roundWf.result();
                for (const team of Object.values(round.teams)){
                    game.teams[team.name].score += team.score;
                }
            });
        } catch (err) {
            if (!(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(err)) {
                throw err;
            }
        }
    }
}
async function RoundWorkflow({ config, teams, snakes, duration }) {
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Starting round', {
        duration,
        snakes
    });
    const round = {
        config: config,
        duration: duration,
        apples: {},
        teams: teams,
        snakes: snakes.reduce((acc, snake)=>{
            acc[snake.id] = snake;
            return acc;
        }, {}),
        finished: false
    };
    const snakeMoves = [];
    const workersStarted = [];
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(roundStateQuery, ()=>{
        return round;
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(snakeMoveSignal, async (id, direction)=>{
        if (round.finished) {
            return;
        }
        snakeMoves.push({
            id,
            direction
        });
    });
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(workerStartedSignal, async ({ identity })=>{
        if (round.finished) {
            return;
        }
        workersStarted.push(identity);
        round.apples[identity] = randomEmptyPoint(round);
    });
    const processSignals = async ()=>{
        const events = [];
        const applesEaten = [];
        const signals = [];
        for (const move of snakeMoves){
            const snake = round.snakes[move.id];
            moveSnake(round, snake, move.direction);
            events.push({
                type: 'snakeMoved',
                payload: {
                    snakeId: move.id,
                    segments: snake.segments
                }
            });
            if (snake.ateAppleId) {
                applesEaten.push(snake.ateAppleId);
                round.teams[snake.teamName].score += APPLE_POINTS;
                snake.ateAppleId = undefined;
            }
        }
        for (const appleId of applesEaten){
            if (config.killWorkers) {
                const worker = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(appleId);
                signals.push(worker.signal(workerStopSignal));
            } else {
                workersStarted.push(appleId);
            }
            delete round.apples[appleId];
        }
        for (const workerId of workersStarted){
            round.apples[workerId] = randomEmptyPoint(round);
        }
        if (applesEaten.length || workersStarted.length) {
            events.push({
                type: 'roundUpdate',
                payload: {
                    round
                }
            });
        }
        snakeMoves.length = 0;
        workersStarted.length = 0;
        await Promise.all([
            emit(events),
            ...signals
        ]);
    };
    randomizeRound(round);
    const workerCount = snakes.length * 2;
    try {
        await startWorkerManagers(workerCount);
        await startSnakes(round.config, round.snakes);
        await emit([
            {
                type: 'roundLoading',
                payload: {
                    round
                }
            }
        ]);
        // Wait for all workers to register
        await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>workersStarted.length === workerCount);
        for (const workerId of workersStarted){
            round.apples[workerId] = randomEmptyPoint(round);
        }
        workersStarted.length = 0;
        // Start the round
        round.startedAt = Date.now();
        Promise.race([
            (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.sleep)(duration * 1000),
            _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope.current().cancelRequested
        ]).then(()=>_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round timer expired')).catch(()=>_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round cancelled')).finally(()=>round.finished = true);
        _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round started', {
            round
        });
        await emit([
            {
                type: 'roundStarted',
                payload: {
                    round
                }
            }
        ]);
        while(true){
            await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.condition)(()=>round.finished || snakeMoves.length > 0 || workersStarted.length > 0);
            if (round.finished) {
                break;
            }
            await processSignals();
        }
    } catch (err) {
        if (!(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(err)) {
            throw err;
        }
    } finally{
        round.finished = true;
    }
    await _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope.nonCancellable(async ()=>{
        await emit([
            {
                type: 'roundFinished',
                payload: {
                    round
                }
            }
        ]);
    });
    _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.log.info('Round finished', {
        round
    });
    return round;
}
async function SnakeWorkerWorkflow({ roundId, identity }) {
    const round = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(roundId);
    let scope;
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(workerStopSignal, ()=>{
        if (scope) {
            scope.cancel();
        }
    });
    while(true){
        try {
            scope = new _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.CancellationScope();
            await Promise.all([
                round.signal(workerStartedSignal, {
                    identity
                }),
                scope.run(()=>snakeWorker(identity))
            ]);
        } catch (e) {
            if ((0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.isCancellation)(e)) {
            // Let workers start again faster for now.
            // await sleep(SNAKE_WORKER_DOWN_TIME);
            } else {
                throw e;
            }
        }
    }
}
async function SnakeWorkflow({ roundId, id, direction, nomsPerMove, nomActivity, nomDuration }) {
    (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.setHandler)(snakeChangeDirectionSignal, (newDirection)=>{
        direction = newDirection;
    });
    let snakeNom;
    if (nomActivity) {
        snakeNom = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
            startToCloseTimeout: nomDuration * 2
        }).snakeNom;
    } else {
        snakeNom = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyLocalActivities)({
            startToCloseTimeout: nomDuration * 2
        }).snakeNom;
    }
    const round = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.getExternalWorkflowHandle)(roundId);
    const noms = Array.from({
        length: nomsPerMove
    });
    let moves = 0;
    while(true){
        await Promise.all(noms.map(()=>snakeNom(id, nomDuration)));
        await round.signal(snakeMoveSignal, id, direction);
        if (moves++ > SNAKE_MOVES_BEFORE_CAN) {
            await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.continueAsNew)({
                roundId,
                id,
                direction,
                nomsPerMove,
                nomActivity,
                nomDuration
            });
        }
    }
}
function moveSnake(round, snake, direction) {
    const config = round.config;
    let headSegment = snake.segments[0];
    let tailSegment = snake.segments[snake.segments.length - 1];
    const currentDirection = headSegment.direction;
    let newDirection = direction;
    // You can't go back on yourself
    if (newDirection === oppositeDirection(currentDirection)) {
        newDirection = currentDirection;
    }
    let currentHead = headSegment.head;
    // Create a new segment if we're changing direction or hitting an edge
    if (newDirection !== currentDirection || againstAnEdge(round, currentHead, direction)) {
        headSegment = {
            head: {
                x: currentHead.x,
                y: currentHead.y
            },
            direction: newDirection,
            length: 0
        };
        snake.segments.unshift(headSegment);
    }
    let newHead = {
        x: currentHead.x,
        y: currentHead.y
    };
    // Move the head segment, wrapping around if we are moving past the edge
    if (newDirection === 'up') {
        newHead.y = newHead.y <= 1 ? config.height : currentHead.y - 1;
    } else if (newDirection === 'down') {
        newHead.y = newHead.y >= config.height ? 1 : currentHead.y + 1;
    } else if (newDirection === 'left') {
        newHead.x = newHead.x <= 1 ? config.width : currentHead.x - 1;
    } else if (newDirection === 'right') {
        newHead.x = newHead.x >= config.width ? 1 : currentHead.x + 1;
    }
    // Check if we've hit another snake
    if (snakeAt(round, newHead)) {
        // Truncate the snake to just the head, and ignore the requested move
        headSegment.length = 1;
        snake.segments = [
            headSegment
        ];
        return;
    }
    // Check if we've hit an apple
    const appleId = appleAt(round, newHead);
    if (appleId !== undefined) {
        // Snake ate an apple, set appleId
        snake.ateAppleId = appleId;
        tailSegment.length += 1; // Grow the snake by increasing the tail length
    }
    headSegment.head = newHead;
    // Manage snake segment growth and shrinking
    if (snake.segments.length > 1) {
        headSegment.length += 1;
        tailSegment.length -= 1;
        // Remove the tail segment if its length reaches 0
        if (tailSegment.length === 0) {
            snake.segments.pop();
        }
    }
}
function againstAnEdge(round, point, direction) {
    if (direction === 'up') {
        return point.y === 1;
    } else if (direction === 'down') {
        return point.y === round.config.height;
    } else if (direction === 'left') {
        return point.x === 1;
    } else {
        return point.x === round.config.width;
    }
}
function appleAt(round, point) {
    for (const [id, apple] of Object.entries(round.apples)){
        if (apple.x === point.x && apple.y === point.y) {
            return id;
        }
    }
    return undefined;
}
function calculatePosition(segment) {
    const { direction, head: start, length } = segment;
    let [t, b] = [
        start.y,
        start.y
    ];
    let [l, r] = [
        start.x,
        start.x
    ];
    if (direction === 'up') {
        b = t + (length - 1);
    } else if (direction === 'down') {
        t = b - (length - 1);
    } else if (direction === 'left') {
        r = l + (length - 1);
    } else {
        l = r - (length - 1);
    }
    return {
        t,
        l,
        b,
        r
    };
}
function snakeAt(round, point) {
    for (const snake of Object.values(round.snakes)){
        for (const segment of snake.segments){
            const pos = calculatePosition(segment);
            if (point.x >= pos.l && point.x <= pos.r && point.y >= pos.t && point.y <= pos.b) {
                return snake;
            }
        }
    }
    return undefined;
}
function randomEmptyPoint(round) {
    let point = {
        x: Math.ceil(Math.random() * round.config.width),
        y: Math.ceil(Math.random() * round.config.height)
    };
    // Check if any apple is at the point
    while(appleAt(round, point) || snakeAt(round, point)){
        point = {
            x: Math.ceil(Math.random() * round.config.width),
            y: Math.ceil(Math.random() * round.config.height)
        };
    }
    return point;
}
function buildRoundTeams(game) {
    const teams = {};
    for (const team of Object.values(game.teams)){
        teams[team.name] = {
            name: team.name,
            score: 0
        };
    }
    return teams;
}
async function startWorkerManagers(count) {
    const snakeWorkerManagers = Array.from({
        length: count
    }).map((_, i)=>{
        const identity = `snake-worker-${i + 1}`;
        return (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(SnakeWorkerWorkflow, {
            workflowId: identity,
            args: [
                {
                    roundId: ROUND_WF_ID,
                    identity
                }
            ]
        });
    });
    return await Promise.all(snakeWorkerManagers);
}
async function startSnakes(config, snakes) {
    const commands = Object.values(snakes).map((snake)=>(0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.startChild)(SnakeWorkflow, {
            workflowId: snake.id,
            taskQueue: 'snakes',
            args: [
                {
                    roundId: ROUND_WF_ID,
                    id: snake.id,
                    direction: snake.segments[0].direction,
                    nomActivity: config.nomActivity,
                    nomsPerMove: config.nomsPerMove,
                    nomDuration: config.nomDuration
                }
            ]
        }));
    await Promise.all(commands);
}
function randomizeRound(round) {
    for (const snake of Object.values(round.snakes)){
        snake.segments = [
            {
                head: randomEmptyPoint(round),
                direction: randomDirection(),
                length: 1
            }
        ];
    }
}


/***/ }),

/***/ "?31ff":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?2065":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/ms/dist/index.cjs":
/*!****************************************!*\
  !*** ./node_modules/ms/dist/index.cjs ***!
  \****************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ }),

/***/ "./node_modules/long/umd/index.js":
/*!****************************************!*\
  !*** ./node_modules/long/umd/index.js ***!
  \****************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;
  
  /**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  // WebAssembly optimizations to do native i64 multiplication and divide
  var wasm = null;
  
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
  } catch (e) {// no wasm support :(
  }
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @constructor
   */
  
  
  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
  
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
  
    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.
  
  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @private
   */
  
  
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true
  });
  /**
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   * @inner
   */
  
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  /**
   * @function
   * @param {*} value number
   * @returns {number}
   * @inner
   */
  
  
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  /**
   * Tests if the specified object is a Long.
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   */
  
  
  Long.isLong = isLong;
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */
  
  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */
  
  var UINT_CACHE = {};
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
  
    if (unsigned) {
      value >>>= 0;
  
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, 0, true);
      if (cache) UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
  
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache) INT_CACHE[value] = obj;
      return obj;
    }
  }
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @function
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromInt = fromInt;
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromNumber(value, unsigned) {
    if (isNaN(value)) return unsigned ? UZERO : ZERO;
  
    if (unsigned) {
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
    }
  
    if (value < 0) return fromNumber(-value, unsigned).neg();
    return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  }
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @function
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromNumber = fromNumber;
  /**
   * @param {number} lowBits
   * @param {number} highBits
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @function
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromBits = fromBits;
  /**
   * @function
   * @param {number} base
   * @param {number} exponent
   * @returns {number}
   * @inner
   */
  
  var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
  
  /**
   * @param {string} str
   * @param {(boolean|number)=} unsigned
   * @param {number=} radix
   * @returns {!Long}
   * @inner
   */
  
  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string');
  
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
  
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return unsigned ? UZERO : ZERO;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg();
    } // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
  
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
  
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
  
    result.unsigned = unsigned;
    return result;
  }
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @function
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromString = fromString;
  /**
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromValue(val, unsigned) {
    if (typeof val === 'number') return fromNumber(val, unsigned);
    if (typeof val === 'string') return fromString(val, unsigned); // Throws for non-objects, converts non-instanceof Long:
  
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
  }
  /**
   * Converts the specified value to a Long using the appropriate from* function for its type.
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long}
   */
  
  
  Long.fromValue = fromValue; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.
  
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */
  
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  /**
   * @type {!Long}
   * @inner
   */
  
  var ZERO = fromInt(0);
  /**
   * Signed zero.
   * @type {!Long}
   */
  
  Long.ZERO = ZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UZERO = fromInt(0, true);
  /**
   * Unsigned zero.
   * @type {!Long}
   */
  
  Long.UZERO = UZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var ONE = fromInt(1);
  /**
   * Signed one.
   * @type {!Long}
   */
  
  Long.ONE = ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UONE = fromInt(1, true);
  /**
   * Unsigned one.
   * @type {!Long}
   */
  
  Long.UONE = UONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var NEG_ONE = fromInt(-1);
  /**
   * Signed negative one.
   * @type {!Long}
   */
  
  Long.NEG_ONE = NEG_ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum signed value.
   * @type {!Long}
   */
  
  Long.MAX_VALUE = MAX_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   */
  
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
  /**
   * Minimum signed value.
   * @type {!Long}
   */
  
  Long.MIN_VALUE = MIN_VALUE;
  /**
   * @alias Long.prototype
   * @inner
   */
  
  var LongPrototype = Long.prototype;
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @this {!Long}
   * @returns {number}
   */
  
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @this {!Long}
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   */
  
  
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
  
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
  
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
  
    while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;
  
        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed high bits
   */
  
  
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned high bits
   */
  
  
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed low bits
   */
  
  
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned low bits
   */
  
  
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
  
    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
   * @returns {boolean}
   */
  
  
  LongPrototype.eqz = LongPrototype.isZero;
  /**
   * Tests if this Long's value is negative.
   * @this {!Long}
   * @returns {boolean}
   */
  
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive or zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.eq = LongPrototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.neq = LongPrototype.notEquals;
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ne = LongPrototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lt = LongPrototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gt = LongPrototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same
  
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned
  
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  
  LongPrototype.comp = LongPrototype.compare;
  /**
   * Negates this Long's value.
   * @this {!Long}
   * @returns {!Long} Negated Long
   */
  
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  
  
  LongPrototype.neg = LongPrototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.sub = LongPrototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier); // use wasm support if present
  
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  
    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg(); // If both longs are small, use float multiplication
  
  
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  
  LongPrototype.mul = LongPrototype.multiply;
  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero'); // use wasm support if present
  
    if (wasm) {
      // guard against signed division overflow: the largest
      // negative number / -1 would be 1 larger than the largest
      // positive number, due to two's complement.
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        // be consistent with non-wasm code path
        return this;
      }
  
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
  
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
  
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
  
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
  
      res = ZERO;
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE;
      res = UZERO;
    } // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
  
  
    rem = this;
  
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
  
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
  
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
  
  
      if (approxRes.isZero()) approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
  
    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  
  LongPrototype.div = LongPrototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor); // use wasm support if present
  
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    return this.sub(this.div(divisor).mul(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  
  LongPrototype.mod = LongPrototype.modulo;
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.rem = LongPrototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @this {!Long}
   * @returns {!Long}
   */
  
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns count leading zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  /**
   * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  /**
   * Returns count trailing zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  /**
   * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shl = LongPrototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shr = LongPrototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits rotated to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotl = LongPrototype.rotateLeft;
  /**
   * Returns this Long with bits rotated to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotr = LongPrototype.rotateRight;
  /**
   * Converts this Long to signed.
   * @this {!Long}
   * @returns {!Long} Signed long
   */
  
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return fromBits(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @this {!Long}
   * @returns {!Long} Unsigned long
   */
  
  
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  };
  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @this {!Long}
   * @returns {!Array.<number>} Byte representation
   */
  
  
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  /**
   * Converts this Long to its little endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Little endian byte representation
   */
  
  
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24];
  };
  /**
   * Converts this Long to its big endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Big endian byte representation
   */
  
  
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [hi >>> 24, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
  };
  /**
   * Creates a Long from its byte representation.
   * @param {!Array.<number>} bytes Byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  /**
   * Creates a Long from its little endian byte representation.
   * @param {!Array.<number>} bytes Little endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
  };
  /**
   * Creates a Long from its big endian byte representation.
   * @param {!Array.<number>} bytes Big endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
  };
  
  var _default = Long;
  exports.default = _default;
  return "default" in exports ? exports.default : exports;
})({});
if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() { return Long; }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/package.json":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/package.json ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"name":"@temporalio/workflow","version":"1.10.2","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"repository":{"type":"git","url":"git+https://github.com/temporalio/sdk-typescript.git","directory":"packages/workflow"},"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"1.10.2","@temporalio/proto":"1.10.2"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"a44bdfa780c1247fe7ed82b4b73c7b1577ee94af"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = globalThis.__webpack_module_cache__;
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;
/*!****************************************************!*\
  !*** ./src/workflows-autogenerated-entrypoint.cjs ***!
  \****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/workflows.ts */ "./src/workflows.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTU1MWUzY2FhYjA2ZDdmMDIzOTFhLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtSkFBMkc7QUFFM0csU0FBUyxhQUFhLENBQUMsR0FBRyxPQUFpQjtJQUN6QyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxhQUFhO0FBQ3pDLHlCQUF5QjtBQUN6Qix1RkFBdUY7QUFDdkYsMEJBQTBCO0FBQzFCLGtHQUFrRztBQUNsRyx1Q0FBdUM7QUFDdkMsMkRBQTJELENBQzVELENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLDZCQUE2QixHQUFHLGFBQWE7QUFDakQsZ0VBQWdF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QTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNMQSxZQUFZLG1CQUFPLENBQUMsaUhBQThDO0FBQ2xFLFdBQVc7O0FBRVgsUUFBUSxrQkFBa0IsRUFBRSxtQkFBTyxDQUFDLGlIQUE4QztBQUNsRjs7QUFFQSx1QkFBdUI7QUFDdkIsU0FBUyxtQkFBTyw0QkFBNEIsOENBQTBGO0FBQ3RJOztBQUVBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvYWN0aXZpdHktb3B0aW9ucy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3R5cGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZGVwcmVjYXRlZC10aW1lLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZW5jb2RpbmcudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9lcnJvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9mYWlsdXJlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvbG9nZ2VyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvcmV0cnktcG9saWN5LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdGltZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3R5cGUtaGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3ZlcnNpb25pbmctaW50ZW50LWVudW0udHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3dvcmtmbG93LWhhbmRsZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3dvcmtmbG93LW9wdGlvbnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2FsZWEudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2NhbmNlbGxhdGlvbi1zY29wZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZXJyb3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9mbGFncy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLWF0dHJpYnV0ZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2dsb2JhbC1vdmVycmlkZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2luZGV4LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ludGVyZmFjZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ludGVybmFscy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvbG9ncy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvcGtnLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9zaW5rcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvc3RhY2staGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvdHJpZ2dlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2VyLWludGVyZmFjZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3RlbXBvcmFsaW8vcmVwbGF5LTIwMjQtZGVtby9nYW1lL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2Zsb3cudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9zcmMvd29ya2Zsb3dzLnRzIiwiaWdub3JlZHwvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGlifF9fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyIiwiaWdub3JlZHwvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGlifF9fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL21zL2Rpc3QvaW5kZXguY2pzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvbm9kZV9tb2R1bGVzL2xvbmcvdW1kL2luZGV4LmpzIiwid2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9yZXBsYXktMjAyNC1kZW1vL2dhbWUvc3JjL3dvcmtmbG93cy1hdXRvZ2VuZXJhdGVkLWVudHJ5cG9pbnQuY2pzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgVmVyc2lvbmluZ0ludGVudCB9IGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGVcbmV4cG9ydCBlbnVtIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSB7XG4gIFRSWV9DQU5DRUwgPSAwLFxuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQgPSAxLFxuICBBQkFORE9OID0gMixcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLCBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU+KCk7XG5jaGVja0V4dGVuZHM8QWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLCBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZT4oKTtcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZW1vdGUgYWN0aXZpdHkgaW52b2NhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJZGVudGlmaWVyIHRvIHVzZSBmb3IgdHJhY2tpbmcgdGhlIGFjdGl2aXR5IGluIFdvcmtmbG93IGhpc3RvcnkuXG4gICAqIFRoZSBgYWN0aXZpdHlJZGAgY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSBhY3Rpdml0eSBmdW5jdGlvbi5cbiAgICogRG9lcyBub3QgbmVlZCB0byBiZSB1bmlxdWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGFuIGluY3JlbWVudGFsIHNlcXVlbmNlIG51bWJlclxuICAgKi9cbiAgYWN0aXZpdHlJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSBuYW1lLlxuICAgKlxuICAgKiBAZGVmYXVsdCBjdXJyZW50IHdvcmtlciB0YXNrIHF1ZXVlXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEhlYXJ0YmVhdCBpbnRlcnZhbC4gQWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgYmVmb3JlIHRoaXMgaW50ZXJ2YWwgcGFzc2VzIGFmdGVyIGEgbGFzdCBoZWFydGJlYXQgb3IgYWN0aXZpdHkgc3RhcnQuXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgaGVhcnRiZWF0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZSBob3cgYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgc2VydmVyLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLiBUbyBlbnN1cmUgemVybyByZXRyaWVzLCBzZXQgbWF4aW11bSBhdHRlbXB0cyB0byAxLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIG9mIGEgc2luZ2xlIEFjdGl2aXR5IGV4ZWN1dGlvbiBhdHRlbXB0LiBOb3RlIHRoYXQgdGhlIFRlbXBvcmFsIFNlcnZlciBkb2Vzbid0IGRldGVjdCBXb3JrZXIgcHJvY2Vzc1xuICAgKiBmYWlsdXJlcyBkaXJlY3RseS4gSXQgcmVsaWVzIG9uIHRoaXMgdGltZW91dCB0byBkZXRlY3QgdGhhdCBhbiBBY3Rpdml0eSB0aGF0IGRpZG4ndCBjb21wbGV0ZSBvbiB0aW1lLiBTbyB0aGlzXG4gICAqIHRpbWVvdXQgc2hvdWxkIGJlIGFzIHNob3J0IGFzIHRoZSBsb25nZXN0IHBvc3NpYmxlIGV4ZWN1dGlvbiBvZiB0aGUgQWN0aXZpdHkgYm9keS4gUG90ZW50aWFsbHkgbG9uZyBydW5uaW5nXG4gICAqIEFjdGl2aXRpZXMgbXVzdCBzcGVjaWZ5IHtAbGluayBoZWFydGJlYXRUaW1lb3V0fSBhbmQgY2FsbCB7QGxpbmsgYWN0aXZpdHkuQ29udGV4dC5oZWFydGJlYXR9IHBlcmlvZGljYWxseSBmb3JcbiAgICogdGltZWx5IGZhaWx1cmUgZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgb3IgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBUaW1lIHRoYXQgdGhlIEFjdGl2aXR5IFRhc2sgY2FuIHN0YXkgaW4gdGhlIFRhc2sgUXVldWUgYmVmb3JlIGl0IGlzIHBpY2tlZCB1cCBieSBhIFdvcmtlci4gRG8gbm90IHNwZWNpZnkgdGhpcyB0aW1lb3V0IHVubGVzcyB1c2luZyBob3N0IHNwZWNpZmljIFRhc2sgUXVldWVzIGZvciBBY3Rpdml0eSBUYXNrcyBhcmUgYmVpbmcgdXNlZCBmb3Igcm91dGluZy5cbiAgICogYHNjaGVkdWxlVG9TdGFydFRpbWVvdXRgIGlzIGFsd2F5cyBub24tcmV0cnlhYmxlLiBSZXRyeWluZyBhZnRlciB0aGlzIHRpbWVvdXQgZG9lc24ndCBtYWtlIHNlbnNlIGFzIGl0IHdvdWxkIGp1c3QgcHV0IHRoZSBBY3Rpdml0eSBUYXNrIGJhY2sgaW50byB0aGUgc2FtZSBUYXNrIFF1ZXVlLlxuICAgKlxuICAgKiBAZGVmYXVsdCBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgb3IgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBUb3RhbCB0aW1lIHRoYXQgYSB3b3JrZmxvdyBpcyB3aWxsaW5nIHRvIHdhaXQgZm9yIEFjdGl2aXR5IHRvIGNvbXBsZXRlLlxuICAgKiBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgbGltaXRzIHRoZSB0b3RhbCB0aW1lIG9mIGFuIEFjdGl2aXR5J3MgZXhlY3V0aW9uIGluY2x1ZGluZyByZXRyaWVzICh1c2Uge0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IHRvIGxpbWl0IHRoZSB0aW1lIG9mIGEgc2luZ2xlIGF0dGVtcHQpLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIGlzIGFuIG9wdGltaXphdGlvbiB0aGF0IGltcHJvdmVzIHRoZSB0aHJvdWdocHV0IGFuZCBsb2FkIG9uIHRoZSBzZXJ2ZXIgZm9yIHNjaGVkdWxpbmcgQWN0aXZpdGllcy5cbiAgICogV2hlbiB1c2VkLCB0aGUgc2VydmVyIHdpbGwgaGFuZCBvdXQgQWN0aXZpdHkgdGFza3MgYmFjayB0byB0aGUgV29ya2VyIHdoZW4gaXQgY29tcGxldGVzIGEgV29ya2Zsb3cgdGFzay5cbiAgICogSXQgaXMgYXZhaWxhYmxlIGZyb20gc2VydmVyIHZlcnNpb24gMS4xNyBiZWhpbmQgdGhlIGBzeXN0ZW0uZW5hYmxlQWN0aXZpdHlFYWdlckV4ZWN1dGlvbmAgZmVhdHVyZSBmbGFnLlxuICAgKlxuICAgKiBFYWdlciBkaXNwYXRjaCB3aWxsIG9ubHkgYmUgdXNlZCBpZiBgYWxsb3dFYWdlckRpc3BhdGNoYCBpcyBlbmFibGVkICh0aGUgZGVmYXVsdCkgYW5kIHtAbGluayB0YXNrUXVldWV9IGlzIGVpdGhlclxuICAgKiBvbWl0dGVkIG9yIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhbGxvd0VhZ2VyRGlzcGF0Y2g/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIEFjdGl2aXR5IHNob3VsZCBydW4gb24gYVxuICAgKiB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbG9jYWwgYWN0aXZpdHkgaW52b2NhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lcyBob3cgYW4gYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgU0RLLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLlxuICAgKiBOb3RlIHRoYXQgbG9jYWwgYWN0aXZpdGllcyBhcmUgYWx3YXlzIGV4ZWN1dGVkIGF0IGxlYXN0IG9uY2UsIGV2ZW4gaWYgbWF4aW11bSBhdHRlbXB0cyBpcyBzZXQgdG8gMSBkdWUgdG8gV29ya2Zsb3cgdGFzayByZXRyaWVzLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBpcyBhbGxvd2VkIHRvIGV4ZWN1dGUgYWZ0ZXIgdGhlIHRhc2sgaXMgZGlzcGF0Y2hlZC4gVGhpc1xuICAgKiB0aW1lb3V0IGlzIGFsd2F5cyByZXRyeWFibGUuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqIElmIHNldCwgdGhpcyBtdXN0IGJlIDw9IHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIExpbWl0cyB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBjYW4gaWRsZSBpbnRlcm5hbGx5IGJlZm9yZSBiZWluZyBleGVjdXRlZC4gVGhhdCBjYW4gaGFwcGVuIGlmXG4gICAqIHRoZSB3b3JrZXIgaXMgY3VycmVudGx5IGF0IG1heCBjb25jdXJyZW50IGxvY2FsIGFjdGl2aXR5IGV4ZWN1dGlvbnMuIFRoaXMgdGltZW91dCBpcyBhbHdheXNcbiAgICogbm9uIHJldHJ5YWJsZSBhcyBhbGwgYSByZXRyeSB3b3VsZCBhY2hpZXZlIGlzIHRvIHB1dCBpdCBiYWNrIGludG8gdGhlIHNhbWUgcXVldWUuIERlZmF1bHRzXG4gICAqIHRvIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpZiBub3Qgc3BlY2lmaWVkIGFuZCB0aGF0IGlzIHNldC4gTXVzdCBiZSA8PVxuICAgKiB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gd2hlbiBzZXQsIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGhvdyBsb25nIHRoZSBjYWxsZXIgaXMgd2lsbGluZyB0byB3YWl0IGZvciBsb2NhbCBhY3Rpdml0eSBjb21wbGV0aW9uLiBMaW1pdHMgaG93XG4gICAqIGxvbmcgcmV0cmllcyB3aWxsIGJlIGF0dGVtcHRlZC5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgYWN0aXZpdHkgaXMgcmV0cnlpbmcgYW5kIGJhY2tvZmYgd291bGQgZXhjZWVkIHRoaXMgdmFsdWUsIGEgc2VydmVyIHNpZGUgdGltZXIgd2lsbCBiZSBzY2hlZHVsZWQgZm9yIHRoZSBuZXh0IGF0dGVtcHQuXG4gICAqIE90aGVyd2lzZSwgYmFja29mZiB3aWxsIGhhcHBlbiBpbnRlcm5hbGx5IGluIHRoZSBTREsuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEgbWludXRlXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiovXG4gIGxvY2FsUmV0cnlUaHJlc2hvbGQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGF0IHRoZSBTREsgZG9lcyB3aGVuIHRoZSBBY3Rpdml0eSBpcyBjYW5jZWxsZWQuXG4gICAqIC0gYFRSWV9DQU5DRUxgIC0gSW5pdGlhdGUgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqIC0gYFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRGAgLSBXYWl0IGZvciBhY3Rpdml0eSBjYW5jZWxsYXRpb24gY29tcGxldGlvbi4gTm90ZSB0aGF0IGFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IHRvIHJlY2VpdmUgYVxuICAgKiAgIGNhbmNlbGxhdGlvbiBub3RpZmljYXRpb24uIFRoaXMgY2FuIGJsb2NrIHRoZSBjYW5jZWxsYXRpb24gZm9yIGEgbG9uZyB0aW1lIGlmIGFjdGl2aXR5IGRvZXNuJ3RcbiAgICogICBoZWFydGJlYXQgb3IgY2hvb3NlcyB0byBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKiAtIGBBQkFORE9OYCAtIERvIG5vdCByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiB0aGUgYWN0aXZpdHkgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlO1xufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsIEZhaWx1cmVDb252ZXJ0ZXIgfSBmcm9tICcuL2ZhaWx1cmUtY29udmVydGVyJztcbmltcG9ydCB7IFBheWxvYWRDb2RlYyB9IGZyb20gJy4vcGF5bG9hZC1jb2RlYyc7XG5pbXBvcnQgeyBkZWZhdWx0UGF5bG9hZENvbnZlcnRlciwgUGF5bG9hZENvbnZlcnRlciB9IGZyb20gJy4vcGF5bG9hZC1jb252ZXJ0ZXInO1xuXG4vKipcbiAqIFdoZW4geW91ciBkYXRhIChhcmd1bWVudHMgYW5kIHJldHVybiB2YWx1ZXMpIGlzIHNlbnQgb3ZlciB0aGUgd2lyZSBhbmQgc3RvcmVkIGJ5IFRlbXBvcmFsIFNlcnZlciwgaXQgaXMgZW5jb2RlZCBpblxuICogYmluYXJ5IGluIGEge0BsaW5rIFBheWxvYWR9IFByb3RvYnVmIG1lc3NhZ2UuXG4gKlxuICogVGhlIGRlZmF1bHQgYERhdGFDb252ZXJ0ZXJgIHN1cHBvcnRzIGB1bmRlZmluZWRgLCBgVWludDhBcnJheWAsIGFuZCBKU09OIHNlcmlhbGl6YWJsZXMgKHNvIGlmXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjZGVzY3JpcHRpb24gfCBgSlNPTi5zdHJpbmdpZnkoeW91ckFyZ09yUmV0dmFsKWB9XG4gKiB3b3JrcywgdGhlIGRlZmF1bHQgZGF0YSBjb252ZXJ0ZXIgd2lsbCB3b3JrKS4gUHJvdG9idWZzIGFyZSBzdXBwb3J0ZWQgdmlhXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGF0YS1jb252ZXJ0ZXJzI3Byb3RvYnVmcyB8IHRoaXMgQVBJfS5cbiAqXG4gKiBVc2UgYSBjdXN0b20gYERhdGFDb252ZXJ0ZXJgIHRvIGNvbnRyb2wgdGhlIGNvbnRlbnRzIG9mIHlvdXIge0BsaW5rIFBheWxvYWR9cy4gQ29tbW9uIHJlYXNvbnMgZm9yIHVzaW5nIGEgY3VzdG9tXG4gKiBgRGF0YUNvbnZlcnRlcmAgYXJlOlxuICogLSBDb252ZXJ0aW5nIHZhbHVlcyB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCAoZm9yIGV4YW1wbGUsIGBKU09OLnN0cmluZ2lmeSgpYCBkb2Vzbid0XG4gKiAgIGhhbmRsZSBgQmlnSW50YHMsIHNvIGlmIHlvdSB3YW50IHRvIHJldHVybiBgeyB0b3RhbDogMTAwMG4gfWAgZnJvbSBhIFdvcmtmbG93LCBTaWduYWwsIG9yIEFjdGl2aXR5LCB5b3UgbmVlZCB5b3VyXG4gKiAgIG93biBgRGF0YUNvbnZlcnRlcmApLlxuICogLSBFbmNyeXB0aW5nIHZhbHVlcyB0aGF0IG1heSBjb250YWluIHByaXZhdGUgaW5mb3JtYXRpb24gdGhhdCB5b3UgZG9uJ3Qgd2FudCBzdG9yZWQgaW4gcGxhaW50ZXh0IGluIFRlbXBvcmFsIFNlcnZlcidzXG4gKiAgIGRhdGFiYXNlLlxuICogLSBDb21wcmVzc2luZyB2YWx1ZXMgdG8gcmVkdWNlIGRpc2sgb3IgbmV0d29yayB1c2FnZS5cbiAqXG4gKiBUbyB1c2UgeW91ciBjdXN0b20gYERhdGFDb252ZXJ0ZXJgLCBwcm92aWRlIGl0IHRvIHRoZSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9LCB7QGxpbmsgV29ya2VyfSwgYW5kXG4gKiB7QGxpbmsgYnVuZGxlV29ya2Zsb3dDb2RlfSAoaWYgeW91IHVzZSBpdCk6XG4gKiAtIGBuZXcgV29ya2Zsb3dDbGllbnQoeyAuLi4sIGRhdGFDb252ZXJ0ZXIgfSlgXG4gKiAtIGBXb3JrZXIuY3JlYXRlKHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgYnVuZGxlV29ya2Zsb3dDb2RlKHsgLi4uLCBwYXlsb2FkQ29udmVydGVyUGF0aCB9KWBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRhQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIFBhdGggb2YgYSBmaWxlIHRoYXQgaGFzIGEgYHBheWxvYWRDb252ZXJ0ZXJgIG5hbWVkIGV4cG9ydC5cbiAgICogYHBheWxvYWRDb252ZXJ0ZXJgIHNob3VsZCBiZSBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICogSWYgbm8gcGF0aCBpcyBwcm92aWRlZCwge0BsaW5rIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyfSBpcyB1c2VkLlxuICAgKi9cbiAgcGF5bG9hZENvbnZlcnRlclBhdGg/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFBhdGggb2YgYSBmaWxlIHRoYXQgaGFzIGEgYGZhaWx1cmVDb252ZXJ0ZXJgIG5hbWVkIGV4cG9ydC5cbiAgICogYGZhaWx1cmVDb252ZXJ0ZXJgIHNob3VsZCBiZSBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHtAbGluayBGYWlsdXJlQ29udmVydGVyfS5cbiAgICogSWYgbm8gcGF0aCBpcyBwcm92aWRlZCwge0BsaW5rIGRlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBpcyB1c2VkLlxuICAgKi9cbiAgZmFpbHVyZUNvbnZlcnRlclBhdGg/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkQ29kZWN9IGluc3RhbmNlcy5cbiAgICpcbiAgICogUGF5bG9hZHMgYXJlIGVuY29kZWQgaW4gdGhlIG9yZGVyIG9mIHRoZSBhcnJheSBhbmQgZGVjb2RlZCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhXG4gICAqIGNvbXByZXNzaW9uIGNvZGVjIGFuZCBhbiBlbmNyeXB0aW9uIGNvZGVjLCB0aGVuIHlvdSB3YW50IGRhdGEgdG8gYmUgZW5jb2RlZCB3aXRoIHRoZSBjb21wcmVzc2lvbiBjb2RlYyBmaXJzdCwgc29cbiAgICogeW91J2QgZG8gYHBheWxvYWRDb2RlY3M6IFtjb21wcmVzc2lvbkNvZGVjLCBlbmNyeXB0aW9uQ29kZWNdYC5cbiAgICovXG4gIHBheWxvYWRDb2RlY3M/OiBQYXlsb2FkQ29kZWNbXTtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBEYXRhQ29udmVydGVyfSB0aGF0IGhhcyBiZWVuIGxvYWRlZCB2aWEge0BsaW5rIGxvYWREYXRhQ29udmVydGVyfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2FkZWREYXRhQ29udmVydGVyIHtcbiAgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcjtcbiAgZmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlcjtcbiAgcGF5bG9hZENvZGVjczogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIEZhaWx1cmVDb252ZXJ0ZXJ9IHVzZWQgYnkgdGhlIFNESy5cbiAqXG4gKiBFcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIGFyZSBzZXJpemFsaXplZCBhcyBwbGFpbiB0ZXh0LlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIoKTtcblxuLyoqXG4gKiBBIFwibG9hZGVkXCIgZGF0YSBjb252ZXJ0ZXIgdGhhdCB1c2VzIHRoZSBkZWZhdWx0IHNldCBvZiBmYWlsdXJlIGFuZCBwYXlsb2FkIGNvbnZlcnRlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0RGF0YUNvbnZlcnRlcjogTG9hZGVkRGF0YUNvbnZlcnRlciA9IHtcbiAgcGF5bG9hZENvbnZlcnRlcjogZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIGZhaWx1cmVDb252ZXJ0ZXI6IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyLFxuICBwYXlsb2FkQ29kZWNzOiBbXSxcbn07XG4iLCJpbXBvcnQge1xuICBBY3Rpdml0eUZhaWx1cmUsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgQ2FuY2VsbGVkRmFpbHVyZSxcbiAgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUsXG4gIEZBSUxVUkVfU09VUkNFLFxuICBQcm90b0ZhaWx1cmUsXG4gIFJldHJ5U3RhdGUsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxuICBUaW1lb3V0VHlwZSxcbn0gZnJvbSAnLi4vZmFpbHVyZSc7XG5pbXBvcnQgeyBpc0Vycm9yIH0gZnJvbSAnLi4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IGFycmF5RnJvbVBheWxvYWRzLCBmcm9tUGF5bG9hZHNBdEluZGV4LCBQYXlsb2FkQ29udmVydGVyLCB0b1BheWxvYWRzIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbmZ1bmN0aW9uIGNvbWJpbmVSZWdFeHAoLi4ucmVnZXhwczogUmVnRXhwW10pOiBSZWdFeHAge1xuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBzLm1hcCgoeCkgPT4gYCg/OiR7eC5zb3VyY2V9KWApLmpvaW4oJ3wnKSk7XG59XG5cbi8qKlxuICogU3RhY2sgdHJhY2VzIHdpbGwgYmUgY3V0b2ZmIHdoZW4gb24gb2YgdGhlc2UgcGF0dGVybnMgaXMgbWF0Y2hlZFxuICovXG5jb25zdCBDVVRPRkZfU1RBQ0tfUEFUVEVSTlMgPSBjb21iaW5lUmVnRXhwKFxuICAvKiogQWN0aXZpdHkgZXhlY3V0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZpdHlcXC5leGVjdXRlIFxcKC4qW1xcXFwvXXdvcmtlcltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11hY3Rpdml0eVxcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBhY3RpdmF0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZhdG9yXFwuXFxTK05leHRIYW5kbGVyIFxcKC4qW1xcXFwvXXdvcmtmbG93W1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWludGVybmFsc1xcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBydW4gYW55dGhpbmcgaW4gY29udGV4dCAqL1xuICAvXFxzK2F0IFNjcmlwdFxcLnJ1bkluQ29udGV4dCBcXCgoPzpub2RlOnZtfHZtXFwuanMpOlxcZCs6XFxkK1xcKS9cbik7XG5cbi8qKlxuICogQW55IHN0YWNrIHRyYWNlIGZyYW1lcyB0aGF0IG1hdGNoIGFueSBvZiB0aG9zZSB3aWwgYmUgZG9wcGVkLlxuICogVGhlIFwibnVsbC5cIiBwcmVmaXggb24gc29tZSBjYXNlcyBpcyB0byBhdm9pZCBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzQyNDE3XG4gKi9cbmNvbnN0IERST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9uZXh0IFxcKC4qW1xcXFwvXWNvbW1vbltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcmNlcHRvcnNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogSW50ZXJuYWwgZnVuY3Rpb25zIHVzZWQgdG8gcmVjdXJzaXZlbHkgY2hhaW4gaW50ZXJjZXB0b3JzICovXG4gIC9cXHMrYXQgKG51bGxcXC4pP2V4ZWN1dGVOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEN1dHMgb3V0IHRoZSBmcmFtZXdvcmsgcGFydCBvZiBhIHN0YWNrIHRyYWNlLCBsZWF2aW5nIG9ubHkgdXNlciBjb2RlIGVudHJpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1dG9mZlN0YWNrVHJhY2Uoc3RhY2s/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IChzdGFjayA/PyAnJykuc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgYWNjID0gQXJyYXk8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBpZiAoQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TLnRlc3QobGluZSkpIGJyZWFrO1xuICAgIGlmICghRFJPUFBFRF9TVEFDS19GUkFNRVNfUEFUVEVSTlMudGVzdChsaW5lKSkgYWNjLnB1c2gobGluZSk7XG4gIH1cbiAgcmV0dXJuIGFjYy5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBBIGBGYWlsdXJlQ29udmVydGVyYCBpcyByZXNwb25zaWJsZSBmb3IgY29udmVydGluZyBmcm9tIHByb3RvIGBGYWlsdXJlYCBpbnN0YW5jZXMgdG8gSlMgYEVycm9yc2AgYW5kIGJhY2suXG4gKlxuICogV2UgcmVjb21tZW5kZWQgdXNpbmcgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaW5zdGVhZCBvZiBjdXN0b21pemluZyB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpbiBvcmRlclxuICogdG8gbWFpbnRhaW4gY3Jvc3MtbGFuZ3VhZ2UgRmFpbHVyZSBzZXJpYWxpemF0aW9uIGNvbXBhdGliaWxpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFpbHVyZUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGNhdWdodCBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZS5cbiAgICovXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgcmV0dXJuZWQgZXJyb3IgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBgVGVtcG9yYWxGYWlsdXJlYC5cbiAgICovXG4gIGZhaWx1cmVUb0Vycm9yKGVycjogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlO1xufVxuXG4vKipcbiAqIFRoZSBcInNoYXBlXCIgb2YgdGhlIGF0dHJpYnV0ZXMgc2V0IGFzIHRoZSB7QGxpbmsgUHJvdG9GYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzfSBwYXlsb2FkIGluIGNhc2VcbiAqIHtAbGluayBEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXN9IGlzIHNldCB0byBgdHJ1ZWAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcyB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgc3RhY2tfdHJhY2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciB0aGUge0BsaW5rIERlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBjb25zdHJ1Y3Rvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnMge1xuICAvKipcbiAgICogV2hldGhlciB0byBlbmNvZGUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyAoZm9yIGVuY3J5cHRpbmcgdGhlc2UgYXR0cmlidXRlcyB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfSkuXG4gICAqL1xuICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlZmF1bHQsIGNyb3NzLWxhbmd1YWdlLWNvbXBhdGlibGUgRmFpbHVyZSBjb252ZXJ0ZXIuXG4gKlxuICogQnkgZGVmYXVsdCwgaXQgd2lsbCBsZWF2ZSBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIGFzIHBsYWluIHRleHQuIEluIG9yZGVyIHRvIGVuY3J5cHQgdGhlbSwgc2V0XG4gKiBgZW5jb2RlQ29tbW9uQXR0cmlidXRlc2AgdG8gYHRydWVgIGluIHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGFuZCB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfSB0aGF0IGNhbiBlbmNyeXB0IC9cbiAqIGRlY3J5cHQgUGF5bG9hZHMgaW4geW91ciB7QGxpbmsgV29ya2VyT3B0aW9ucy5kYXRhQ29udmVydGVyIHwgV29ya2VyfSBhbmRcbiAqIHtAbGluayBDbGllbnRPcHRpb25zLmRhdGFDb252ZXJ0ZXIgfCBDbGllbnQgb3B0aW9uc30uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlciBpbXBsZW1lbnRzIEZhaWx1cmVDb252ZXJ0ZXIge1xuICBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBQYXJ0aWFsPERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucz4pIHtcbiAgICBjb25zdCB7IGVuY29kZUNvbW1vbkF0dHJpYnV0ZXMgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogZW5jb2RlQ29tbW9uQXR0cmlidXRlcyA/PyBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBEb2VzIG5vdCBzZXQgY29tbW9uIHByb3BlcnRpZXMsIHRoYXQgaXMgZG9uZSBpbiB7QGxpbmsgZmFpbHVyZVRvRXJyb3J9LlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmUge1xuICAgIGlmIChmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8udHlwZSxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8ubm9uUmV0cnlhYmxlKSxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLmRldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFNlcnZlckZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIEJvb2xlYW4oZmFpbHVyZS5zZXJ2ZXJGYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWVvdXRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmcm9tUGF5bG9hZHNBdEluZGV4KHBheWxvYWRDb252ZXJ0ZXIsIDAsIGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvLmxhc3RIZWFydGJlYXREZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvLnRpbWVvdXRUeXBlID8/IFRpbWVvdXRUeXBlLlRJTUVPVVRfVFlQRV9VTlNQRUNJRklFRFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUudGVybWluYXRlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm1pbmF0ZWRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsZWRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmNhbmNlbGVkRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUucmVzZXRXb3JrZmxvd0ZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgJ1Jlc2V0V29ya2Zsb3cnLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgY29uc3QgeyBuYW1lc3BhY2UsIHdvcmtmbG93VHlwZSwgd29ya2Zsb3dFeGVjdXRpb24sIHJldHJ5U3RhdGUgfSA9IGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvO1xuICAgICAgaWYgKCEod29ya2Zsb3dUeXBlPy5uYW1lICYmIHdvcmtmbG93RXhlY3V0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGF0dHJpYnV0ZXMgb24gY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENoaWxkV29ya2Zsb3dGYWlsdXJlKFxuICAgICAgICBuYW1lc3BhY2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgd29ya2Zsb3dUeXBlLm5hbWUsXG4gICAgICAgIHJldHJ5U3RhdGUgPz8gUmV0cnlTdGF0ZS5SRVRSWV9TVEFURV9VTlNQRUNJRklFRCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8pIHtcbiAgICAgIGlmICghZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZT8ubmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2aXR5VHlwZT8ubmFtZSBvbiBhY3Rpdml0eUZhaWx1cmVJbmZvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEFjdGl2aXR5RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZS5uYW1lLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlJZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5yZXRyeVN0YXRlID8/IFJldHJ5U3RhdGUuUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5pZGVudGl0eSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlbXBvcmFsRmFpbHVyZShcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICk7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmUge1xuICAgIGlmIChmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRycyA9IHBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQ8RGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcz4oZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcyk7XG4gICAgICAvLyBEb24ndCBhcHBseSBlbmNvZGVkQXR0cmlidXRlcyB1bmxlc3MgdGhleSBjb25mb3JtIHRvIGFuIGV4cGVjdGVkIHNjaGVtYVxuICAgICAgaWYgKHR5cGVvZiBhdHRycyA9PT0gJ29iamVjdCcgJiYgYXR0cnMgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlLCBzdGFja190cmFjZSB9ID0gYXR0cnM7XG4gICAgICAgIC8vIEF2b2lkIG11dGF0aW5nIHRoZSBhcmd1bWVudFxuICAgICAgICBmYWlsdXJlID0geyAuLi5mYWlsdXJlIH07XG4gICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhY2tfdHJhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gc3RhY2tfdHJhY2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXJyID0gdGhpcy5mYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXIpO1xuICAgIGVyci5zdGFjayA9IGZhaWx1cmUuc3RhY2tUcmFjZSA/PyAnJztcbiAgICBlcnIuZmFpbHVyZSA9IGZhaWx1cmU7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgY29uc3QgZmFpbHVyZSA9IHRoaXMuZXJyb3JUb0ZhaWx1cmVJbm5lcihlcnIsIHBheWxvYWRDb252ZXJ0ZXIpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZW5jb2RlQ29tbW9uQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgeyBtZXNzYWdlLCBzdGFja1RyYWNlIH0gPSBmYWlsdXJlO1xuICAgICAgZmFpbHVyZS5tZXNzYWdlID0gJ0VuY29kZWQgZmFpbHVyZSc7XG4gICAgICBmYWlsdXJlLnN0YWNrVHJhY2UgPSAnJztcbiAgICAgIGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMgPSBwYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZCh7IG1lc3NhZ2UsIHN0YWNrX3RyYWNlOiBzdGFja1RyYWNlIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFpbHVyZTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlSW5uZXIoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICBpZiAoZXJyLmZhaWx1cmUpIHJldHVybiBlcnIuZmFpbHVyZTtcbiAgICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKGVyci5zdGFjayksXG4gICAgICAgIGNhdXNlOiB0aGlzLm9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZShlcnIuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpLFxuICAgICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgICAgfTtcblxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEFjdGl2aXR5RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgYWN0aXZpdHlGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgLi4uZXJyLFxuICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB7IG5hbWU6IGVyci5hY3Rpdml0eVR5cGUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiBlcnIuZXhlY3V0aW9uLFxuICAgICAgICAgICAgd29ya2Zsb3dUeXBlOiB7IG5hbWU6IGVyci53b3JrZmxvd1R5cGUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgYXBwbGljYXRpb25GYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgdHlwZTogZXJyLnR5cGUsXG4gICAgICAgICAgICBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUsXG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGNhbmNlbGVkRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIGRldGFpbHM6XG4gICAgICAgICAgICAgIGVyci5kZXRhaWxzICYmIGVyci5kZXRhaWxzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCAuLi5lcnIuZGV0YWlscykgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGltZW91dEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHRpbWVvdXRGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgdGltZW91dFR5cGU6IGVyci50aW1lb3V0VHlwZSxcbiAgICAgICAgICAgIGxhc3RIZWFydGJlYXREZXRhaWxzOiBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHNcbiAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGVyci5sYXN0SGVhcnRiZWF0RGV0YWlscykgfVxuICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFNlcnZlckZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHNlcnZlckZhaWx1cmVJbmZvOiB7IG5vblJldHJ5YWJsZTogZXJyLm5vblJldHJ5YWJsZSB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlcm1pbmF0ZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0ZXJtaW5hdGVkRmFpbHVyZUluZm86IHt9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gSnVzdCBhIFRlbXBvcmFsRmFpbHVyZVxuICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IHtcbiAgICAgIHNvdXJjZTogRkFJTFVSRV9TT1VSQ0UsXG4gICAgfTtcblxuICAgIGlmIChpc0Vycm9yKGVycikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2UsXG4gICAgICAgIG1lc3NhZ2U6IFN0cmluZyhlcnIubWVzc2FnZSkgPz8gJycsXG4gICAgICAgIHN0YWNrVHJhY2U6IGN1dG9mZlN0YWNrVHJhY2UoZXJyLnN0YWNrKSxcbiAgICAgICAgY2F1c2U6IHRoaXMub3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKChlcnIgYXMgYW55KS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlciksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uID0gYCBbQSBub24tRXJyb3IgdmFsdWUgd2FzIHRocm93biBmcm9tIHlvdXIgY29kZS4gV2UgcmVjb21tZW5kIHRocm93aW5nIEVycm9yIG9iamVjdHMgc28gdGhhdCB3ZSBjYW4gcHJvdmlkZSBhIHN0YWNrIHRyYWNlXWA7XG5cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IGVyciArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnb2JqZWN0Jykge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgICBtZXNzYWdlID0gU3RyaW5nKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBtZXNzYWdlICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBTdHJpbmcoZXJyKSArIHJlY29tbWVuZGF0aW9uIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QgaWYgZGVmaW5lZCBvciByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIG9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihcbiAgICBmYWlsdXJlOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXJcbiAgKTogVGVtcG9yYWxGYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcikgOiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYW4gZXJyb3IgdG8gYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgaWYgZGVmaW5lZCBvciByZXR1cm5zIHVuZGVmaW5lZFxuICAgKi9cbiAgb3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGVyciA/IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZXJyLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIGBQYXlsb2FkQ29kZWNgIGlzIGFuIG9wdGlvbmFsIHN0ZXAgdGhhdCBoYXBwZW5zIGJldHdlZW4gdGhlIHdpcmUgYW5kIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogVGVtcG9yYWwgU2VydmVyIDwtLT4gV2lyZSA8LS0+IGBQYXlsb2FkQ29kZWNgIDwtLT4gYFBheWxvYWRDb252ZXJ0ZXJgIDwtLT4gVXNlciBjb2RlXG4gKlxuICogSW1wbGVtZW50IHRoaXMgdG8gdHJhbnNmb3JtIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgdG8vZnJvbSB0aGUgZm9ybWF0IHNlbnQgb3ZlciB0aGUgd2lyZSBhbmQgc3RvcmVkIGJ5IFRlbXBvcmFsIFNlcnZlci5cbiAqIENvbW1vbiB0cmFuc2Zvcm1hdGlvbnMgYXJlIGVuY3J5cHRpb24gYW5kIGNvbXByZXNzaW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb2RlYyB7XG4gIC8qKlxuICAgKiBFbmNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyBmb3Igc2VuZGluZyBvdmVyIHRoZSB3aXJlLlxuICAgKiBAcGFyYW0gcGF5bG9hZHMgTWF5IGhhdmUgbGVuZ3RoIDAuXG4gICAqL1xuICBlbmNvZGUocGF5bG9hZHM6IFBheWxvYWRbXSk6IFByb21pc2U8UGF5bG9hZFtdPjtcblxuICAvKipcbiAgICogRGVjb2RlIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgcmVjZWl2ZWQgZnJvbSB0aGUgd2lyZS5cbiAgICovXG4gIGRlY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xufVxuIiwiaW1wb3J0IHsgZGVjb2RlLCBlbmNvZGUgfSBmcm9tICcuLi9lbmNvZGluZyc7XG5pbXBvcnQgeyBQYXlsb2FkQ29udmVydGVyRXJyb3IsIFZhbHVlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZW5jb2RpbmdLZXlzLCBlbmNvZGluZ1R5cGVzLCBNRVRBREFUQV9FTkNPRElOR19LRVkgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBVc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gc2VyaWFsaXplL2Rlc2VyaWFsaXplIGRhdGEgbGlrZSBwYXJhbWV0ZXJzIGFuZCByZXR1cm4gdmFsdWVzLlxuICpcbiAqIFRoaXMgaXMgY2FsbGVkIGluc2lkZSB0aGUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtIHwgV29ya2Zsb3cgaXNvbGF0ZX0uXG4gKiBUbyB3cml0ZSBhc3luYyBjb2RlIG9yIHVzZSBOb2RlIEFQSXMgKG9yIHVzZSBwYWNrYWdlcyB0aGF0IHVzZSBOb2RlIEFQSXMpLCB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBTaG91bGQgdGhyb3cge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHVuYWJsZSB0byBjb252ZXJ0LlxuICAgKi9cbiAgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSB7QGxpbmsgUGF5bG9hZH0gYmFjayB0byBhIHZhbHVlLlxuICAgKi9cbiAgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQ7XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGEgbGlzdCBvZiB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIHZhbHVlcyBKUyB2YWx1ZXMgdG8gY29udmVydCB0byBQYXlsb2Fkc1xuICogQHJldHVybiBsaXN0IG9mIHtAbGluayBQYXlsb2FkfXNcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIHZhbHVlIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1BheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgLi4udmFsdWVzOiB1bmtub3duW10pOiBQYXlsb2FkW10gfCB1bmRlZmluZWQge1xuICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzLm1hcCgodmFsdWUpID0+IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBtYXAuXG4gKlxuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiBhbnkgdmFsdWUgaW4gdGhlIG1hcCBmYWlsc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIG1hcDogUmVjb3JkPEssIGFueT4pOiBSZWNvcmQ8SywgUGF5bG9hZD4ge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgdl0pOiBbSywgUGF5bG9hZF0gPT4gW2sgYXMgSywgY29udmVydGVyLnRvUGF5bG9hZCh2KV0pXG4gICkgYXMgUmVjb3JkPEssIFBheWxvYWQ+O1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhbiBhcnJheSBvZiB2YWx1ZXMgb2YgZGlmZmVyZW50IHR5cGVzLiBVc2VmdWwgZm9yIGRlc2VyaWFsaXppbmdcbiAqIGFyZ3VtZW50cyBvZiBmdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBwYXlsb2Fkc1xuICogQHBhcmFtIHBheWxvYWRzIHNlcmlhbGl6ZWQgdmFsdWUgdG8gY29udmVydCB0byBKUyB2YWx1ZXMuXG4gKiBAcmV0dXJuIGNvbnZlcnRlZCBKUyB2YWx1ZVxuICogQHRocm93cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlckVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSBkYXRhIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUGF5bG9hZHNBdEluZGV4PFQ+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgaW5kZXg6IG51bWJlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogVCB7XG4gIC8vIFRvIG1ha2UgYWRkaW5nIGFyZ3VtZW50cyBhIGJhY2t3YXJkcyBjb21wYXRpYmxlIGNoYW5nZVxuICBpZiAocGF5bG9hZHMgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkcyA9PT0gbnVsbCB8fCBpbmRleCA+PSBwYXlsb2Fkcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTtcbiAgfVxuICByZXR1cm4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWRzW2luZGV4XSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVBheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogdW5rbm93bltdIHtcbiAgaWYgKCFwYXlsb2Fkcykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gcGF5bG9hZHMubWFwKChwYXlsb2FkOiBQYXlsb2FkKSA9PiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwRnJvbVBheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KFxuICBjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsXG4gIG1hcD86IFJlY29yZDxLLCBQYXlsb2FkPiB8IG51bGwgfCB1bmRlZmluZWRcbik6IFJlY29yZDxLLCB1bmtub3duPiB8IHVuZGVmaW5lZCB8IG51bGwge1xuICBpZiAobWFwID09IG51bGwpIHJldHVybiBtYXA7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCBwYXlsb2FkXSk6IFtLLCB1bmtub3duXSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkIGFzIFBheWxvYWQpO1xuICAgICAgcmV0dXJuIFtrIGFzIEssIHZhbHVlXTtcbiAgICB9KVxuICApIGFzIFJlY29yZDxLLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LCBvciBgdW5kZWZpbmVkYCBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xuXG4gIHJlYWRvbmx5IGVuY29kaW5nVHlwZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRyaWVzIHRvIGNvbnZlcnQgdmFsdWVzIHRvIHtAbGluayBQYXlsb2FkfXMgdXNpbmcgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nfXMgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBpbiB0aGUgb3JkZXIgcHJvdmlkZWQuXG4gKlxuICogQ29udmVydHMgUGF5bG9hZHMgdG8gdmFsdWVzIGJhc2VkIG9uIHRoZSBgUGF5bG9hZC5tZXRhZGF0YS5lbmNvZGluZ2AgZmllbGQsIHdoaWNoIG1hdGNoZXMgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nLmVuY29kaW5nVHlwZX1cbiAqIG9mIHRoZSBjb252ZXJ0ZXIgdGhhdCBjcmVhdGVkIHRoZSBQYXlsb2FkLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICByZWFkb25seSBjb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW107XG4gIHJlYWRvbmx5IGNvbnZlcnRlckJ5RW5jb2Rpbmc6IE1hcDxzdHJpbmcsIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKC4uLmNvbnZlcnRlcnM6IFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmdbXSkge1xuICAgIGlmIChjb252ZXJ0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFBheWxvYWRDb252ZXJ0ZXJFcnJvcignTXVzdCBwcm92aWRlIGF0IGxlYXN0IG9uZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb252ZXJ0ZXJzID0gY29udmVydGVycztcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiBjb252ZXJ0ZXJzKSB7XG4gICAgICB0aGlzLmNvbnZlcnRlckJ5RW5jb2Rpbmcuc2V0KGNvbnZlcnRlci5lbmNvZGluZ1R5cGUsIGNvbnZlcnRlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIHJ1biBgLnRvUGF5bG9hZCh2YWx1ZSlgIG9uIGVhY2ggY29udmVydGVyIGluIHRoZSBvcmRlciBwcm92aWRlZCBhdCBjb25zdHJ1Y3Rpb24uXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IHN1Y2Nlc3NmdWwgcmVzdWx0LCB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHRoZXJlIGlzIG5vIGNvbnZlcnRlciB0aGF0IGNhbiBoYW5kbGUgdGhlIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQge1xuICAgIGZvciAoY29uc3QgY29udmVydGVyIG9mIHRoaXMuY29udmVydGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5hYmxlIHRvIGNvbnZlcnQgJHt2YWx1ZX0gdG8gcGF5bG9hZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5mcm9tUGF5bG9hZH0gYmFzZWQgb24gdGhlIGBlbmNvZGluZ2AgbWV0YWRhdGEgb2YgdGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuICAgIGNvbnN0IGVuY29kaW5nID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGFbTUVUQURBVEFfRU5DT0RJTkdfS0VZXSk7XG4gICAgY29uc3QgY29udmVydGVyID0gdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLmdldChlbmNvZGluZyk7XG4gICAgaWYgKGNvbnZlcnRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5rbm93biBlbmNvZGluZzogJHtlbmNvZGluZ31gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gSlMgdW5kZWZpbmVkIGFuZCBOVUxMIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTDtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihfY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55OyAvLyBKdXN0IHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gYmluYXJ5IGRhdGEgdHlwZXMgYW5kIFJBVyBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW5hcnlQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVztcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19SQVcsXG4gICAgICB9LFxuICAgICAgZGF0YTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8vIFdyYXAgd2l0aCBVaW50OEFycmF5IGZyb20gdGhpcyBjb250ZXh0IHRvIGVuc3VyZSBgaW5zdGFuY2VvZmAgd29ya3NcbiAgICAgIChcbiAgICAgICAgY29udGVudC5kYXRhID8gbmV3IFVpbnQ4QXJyYXkoY29udGVudC5kYXRhLmJ1ZmZlciwgY29udGVudC5kYXRhLmJ5dGVPZmZzZXQsIGNvbnRlbnQuZGF0YS5sZW5ndGgpIDogY29udGVudC5kYXRhXG4gICAgICApIGFzIGFueVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIG5vbi11bmRlZmluZWQgdmFsdWVzIGFuZCBzZXJpYWxpemVkIEpTT04gUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgSnNvblBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTjtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04sXG4gICAgICB9LFxuICAgICAgZGF0YTogZW5jb2RlKGpzb24pLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChjb250ZW50LmRhdGEgPT09IHVuZGVmaW5lZCB8fCBjb250ZW50LmRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdHb3QgcGF5bG9hZCB3aXRoIG5vIGRhdGEnKTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlKGNvbnRlbnQuZGF0YSkpO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgdXNpbmcgSnNvblBheWxvYWRDb252ZXJ0ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAganNvbkNvbnZlcnRlciA9IG5ldyBKc29uUGF5bG9hZENvbnZlcnRlcigpO1xuICB2YWxpZE5vbkRhdGVUeXBlcyA9IFsnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJ107XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZXM6IHVua25vd24pOiBQYXlsb2FkIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFNlYXJjaEF0dHJpYnV0ZSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5YCk7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmaXJzdFZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgY29uc3QgZmlyc3RUeXBlID0gdHlwZW9mIGZpcnN0VmFsdWU7XG4gICAgICBpZiAoZmlyc3RUeXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZHgsIHZhbHVlXSBvZiB2YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWVzIG11c3QgYXJyYXlzIG9mIHN0cmluZ3MsIG51bWJlcnMsIGJvb2xlYW5zLCBvciBEYXRlcy4gVGhlIHZhbHVlICR7dmFsdWV9IGF0IGluZGV4ICR7aWR4fSBpcyBvZiB0eXBlICR7dHlwZW9mIHZhbHVlfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWROb25EYXRlVHlwZXMuaW5jbHVkZXMoZmlyc3RUeXBlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgYXJyYXkgdmFsdWVzIG11c3QgYmU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBEYXRlYCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtpZHgsIHZhbHVlXSBvZiB2YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gZmlyc3RUeXBlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihcbiAgICAgICAgICAgICAgYEFsbCBTZWFyY2hBdHRyaWJ1dGUgYXJyYXkgdmFsdWVzIG11c3QgYmUgb2YgdGhlIHNhbWUgdHlwZS4gVGhlIGZpcnN0IHZhbHVlICR7Zmlyc3RWYWx1ZX0gb2YgdHlwZSAke2ZpcnN0VHlwZX0gZG9lc24ndCBtYXRjaCB2YWx1ZSAke3ZhbHVlfSBvZiB0eXBlICR7dHlwZW9mIHZhbHVlfSBhdCBpbmRleCAke2lkeH1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEpTT04uc3RyaW5naWZ5IHRha2VzIGNhcmUgb2YgY29udmVydGluZyBEYXRlcyB0byBJU08gc3RyaW5nc1xuICAgIGNvbnN0IHJldCA9IHRoaXMuanNvbkNvbnZlcnRlci50b1BheWxvYWQodmFsdWVzKTtcbiAgICBpZiAocmV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdDb3VsZCBub3QgY29udmVydCBzZWFyY2ggYXR0cmlidXRlcyB0byBwYXlsb2FkcycpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLyoqXG4gICAqIERhdGV0aW1lIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIGFyZSBjb252ZXJ0ZWQgdG8gYERhdGVgc1xuICAgKi9cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAocGF5bG9hZC5tZXRhZGF0YSA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWQubWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdNaXNzaW5nIHBheWxvYWQgbWV0YWRhdGEnKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuanNvbkNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKTtcbiAgICBsZXQgYXJyYXlXcmFwcGVkVmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcblxuICAgIGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVR5cGUgPSBkZWNvZGUocGF5bG9hZC5tZXRhZGF0YS50eXBlKTtcbiAgICBpZiAoc2VhcmNoQXR0cmlidXRlVHlwZSA9PT0gJ0RhdGV0aW1lJykge1xuICAgICAgYXJyYXlXcmFwcGVkVmFsdWUgPSBhcnJheVdyYXBwZWRWYWx1ZS5tYXAoKGRhdGVTdHJpbmcpID0+IG5ldyBEYXRlKGRhdGVTdHJpbmcpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5V3JhcHBlZFZhbHVlIGFzIHVua25vd24gYXMgVDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciA9IG5ldyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyKCk7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlciBleHRlbmRzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIge1xuICAvLyBNYXRjaCB0aGUgb3JkZXIgdXNlZCBpbiBvdGhlciBTREtzLCBidXQgZXhjbHVkZSBQcm90b2J1ZiBjb252ZXJ0ZXJzIHNvIHRoYXQgdGhlIGNvZGUsIGluY2x1ZGluZ1xuICAvLyBgcHJvdG8zLWpzb24tc2VyaWFsaXplcmAsIGRvZXNuJ3QgdGFrZSBzcGFjZSBpbiBXb3JrZmxvdyBidW5kbGVzIHRoYXQgZG9uJ3QgdXNlIFByb3RvYnVmcy4gVG8gdXNlIFByb3RvYnVmcywgdXNlXG4gIC8vIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcldpdGhQcm90b2J1ZnN9LlxuICAvL1xuICAvLyBHbyBTREs6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3Nkay1nby9ibG9iLzVlNTY0NWYwYzU1MGRjZjcxN2MwOTVhZTMyYzc2YTcwODdkMmU5ODUvY29udmVydGVyL2RlZmF1bHRfZGF0YV9jb252ZXJ0ZXIuZ28jTDI4XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKG5ldyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyKCksIG5ldyBCaW5hcnlQYXlsb2FkQ29udmVydGVyKCksIG5ldyBKc29uUGF5bG9hZENvbnZlcnRlcigpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBQYXlsb2FkQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuIFN1cHBvcnRzIGBVaW50OEFycmF5YCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IHBheWxvYWQgY29udmVydGVyIHdpbGwgd29yaykuXG4gKlxuICogVG8gYWxzbyBzdXBwb3J0IFByb3RvYnVmcywgY3JlYXRlIGEgY3VzdG9tIHBheWxvYWQgY29udmVydGVyIHdpdGgge0BsaW5rIERlZmF1bHRQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBgY29uc3QgbXlDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoeyBwcm90b2J1ZlJvb3QgfSlgXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF5bG9hZENvbnZlcnRlciA9IG5ldyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcigpO1xuIiwiaW1wb3J0IHsgZW5jb2RlIH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuXG5leHBvcnQgY29uc3QgTUVUQURBVEFfRU5DT0RJTkdfS0VZID0gJ2VuY29kaW5nJztcbmV4cG9ydCBjb25zdCBlbmNvZGluZ1R5cGVzID0ge1xuICBNRVRBREFUQV9FTkNPRElOR19OVUxMOiAnYmluYXJ5L251bGwnLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6ICdiaW5hcnkvcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19KU09OOiAnanNvbi9wbGFpbicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT046ICdqc29uL3Byb3RvYnVmJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6ICdiaW5hcnkvcHJvdG9idWYnLFxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEVuY29kaW5nVHlwZSA9ICh0eXBlb2YgZW5jb2RpbmdUeXBlcylba2V5b2YgdHlwZW9mIGVuY29kaW5nVHlwZXNdO1xuXG5leHBvcnQgY29uc3QgZW5jb2RpbmdLZXlzID0ge1xuICBNRVRBREFUQV9FTkNPRElOR19OVUxMOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19OVUxMKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVcpLFxuICBNRVRBREFUQV9FTkNPRElOR19KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTiksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRiksXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgTUVUQURBVEFfTUVTU0FHRV9UWVBFX0tFWSA9ICdtZXNzYWdlVHlwZSc7XG4iLCJpbXBvcnQgKiBhcyB0aW1lIGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyB0eXBlIFRpbWVzdGFtcCwgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvdy5cbiAqIElmIHRzIGlzIG51bGwgb3IgdW5kZWZpbmVkIHJldHVybnMgdW5kZWZpbmVkLlxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm9wdGlvbmFsVHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIHJldHVybiB0aW1lLnRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zTnVtYmVyVG9UcyhtaWxsaXM6IG51bWJlcik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiB0aW1lLm1zTnVtYmVyVG9UcyhtaWxsaXMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvVHMoc3RyOiBEdXJhdGlvbik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiB0aW1lLm1zVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUubXNPcHRpb25hbFRvVHMoc3RyKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvTnVtYmVyKHZhbDogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5tc09wdGlvbmFsVG9OdW1iZXIodmFsKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNUb051bWJlcih2YWw6IER1cmF0aW9uKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUubXNUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiB0aW1lLnRzVG9EYXRlKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9EYXRlKHRzKTtcbn1cbiIsIi8vIFBhc3RlZCB3aXRoIG1vZGlmaWNhdGlvbnMgZnJvbTogaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fub255Y28vRmFzdGVzdFNtYWxsZXN0VGV4dEVuY29kZXJEZWNvZGVyL21hc3Rlci9FbmNvZGVyRGVjb2RlclRvZ2V0aGVyLnNyYy5qc1xuLyogZXNsaW50IG5vLWZhbGx0aHJvdWdoOiAwICovXG5cbmNvbnN0IGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5jb25zdCBlbmNvZGVyUmVnZXhwID0gL1tcXHg4MC1cXHVEN2ZmXFx1REMwMC1cXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdPy9nO1xuY29uc3QgdG1wQnVmZmVyVTE2ID0gbmV3IFVpbnQxNkFycmF5KDMyKTtcblxuZXhwb3J0IGNsYXNzIFRleHREZWNvZGVyIHtcbiAgZGVjb2RlKGlucHV0QXJyYXlPckJ1ZmZlcjogVWludDhBcnJheSB8IEFycmF5QnVmZmVyIHwgU2hhcmVkQXJyYXlCdWZmZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGlucHV0QXM4ID0gaW5wdXRBcnJheU9yQnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA/IGlucHV0QXJyYXlPckJ1ZmZlciA6IG5ldyBVaW50OEFycmF5KGlucHV0QXJyYXlPckJ1ZmZlcik7XG5cbiAgICBsZXQgcmVzdWx0aW5nU3RyaW5nID0gJycsXG4gICAgICB0bXBTdHIgPSAnJyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIG5leHRFbmQgPSAwLFxuICAgICAgY3AwID0gMCxcbiAgICAgIGNvZGVQb2ludCA9IDAsXG4gICAgICBtaW5CaXRzID0gMCxcbiAgICAgIGNwMSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgdG1wID0gLTE7XG4gICAgY29uc3QgbGVuID0gaW5wdXRBczgubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBsZW5NaW51czMyID0gKGxlbiAtIDMyKSB8IDA7XG4gICAgLy8gTm90ZSB0aGF0IHRtcCByZXByZXNlbnRzIHRoZSAybmQgaGFsZiBvZiBhIHN1cnJvZ2F0ZSBwYWlyIGluY2FzZSBhIHN1cnJvZ2F0ZSBnZXRzIGRpdmlkZWQgYmV0d2VlbiBibG9ja3NcbiAgICBmb3IgKDsgaW5kZXggPCBsZW47ICkge1xuICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgZm9yICg7IHBvcyA8IG5leHRFbmQ7IGluZGV4ID0gKGluZGV4ICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICAgIGNwMCA9IGlucHV0QXM4W2luZGV4XSAmIDB4ZmY7XG4gICAgICAgIHN3aXRjaCAoY3AwID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgaWYgKGNwMSA+PiA2ICE9PSAwYjEwIHx8IDBiMTExMTAxMTEgPCBjcDApIHtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29kZVBvaW50ID0gKChjcDAgJiAwYjExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gNTsgLy8gMjAgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAweDEwMDsgLy8gIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSBjcDEgPj4gNiA9PT0gMGIxMCA/IChtaW5CaXRzICsgNCkgfCAwIDogMjQ7IC8vIDI0IGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gKGNwMCArIDB4MTAwKSAmIDB4MzAwOyAvLyBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gKG1pbkJpdHMgKyA3KSB8IDA7XG5cbiAgICAgICAgICAgIC8vIE5vdywgcHJvY2VzcyB0aGUgY29kZSBwb2ludFxuICAgICAgICAgICAgaWYgKGluZGV4IDwgbGVuICYmIGNwMSA+PiA2ID09PSAwYjEwICYmIGNvZGVQb2ludCA+PiBtaW5CaXRzICYmIGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNwMCA9IGNvZGVQb2ludDtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gKGNvZGVQb2ludCAtIDB4MTAwMDApIHwgMDtcbiAgICAgICAgICAgICAgaWYgKDAgPD0gY29kZVBvaW50IC8qMHhmZmZmIDwgY29kZVBvaW50Ki8pIHtcbiAgICAgICAgICAgICAgICAvLyBCTVAgY29kZSBwb2ludFxuICAgICAgICAgICAgICAgIC8vbmV4dEVuZCA9IG5leHRFbmQgLSAxfDA7XG5cbiAgICAgICAgICAgICAgICB0bXAgPSAoKGNvZGVQb2ludCA+PiAxMCkgKyAweGQ4MDApIHwgMDsgLy8gaGlnaFN1cnJvZ2F0ZVxuICAgICAgICAgICAgICAgIGNwMCA9ICgoY29kZVBvaW50ICYgMHgzZmYpICsgMHhkYzAwKSB8IDA7IC8vIGxvd1N1cnJvZ2F0ZSAod2lsbCBiZSBpbnNlcnRlZCBsYXRlciBpbiB0aGUgc3dpdGNoLXN0YXRlbWVudClcblxuICAgICAgICAgICAgICAgIGlmIChwb3MgPCAzMSkge1xuICAgICAgICAgICAgICAgICAgLy8gbm90aWNlIDMxIGluc3RlYWQgb2YgMzJcbiAgICAgICAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gdG1wO1xuICAgICAgICAgICAgICAgICAgcG9zID0gKHBvcyArIDEpIHwgMDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBlbHNlLCB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXRBczggYW5kIGxldCB0bXAwIGJlIGZpbGxlZCBpbiBsYXRlciBvblxuICAgICAgICAgICAgICAgICAgLy8gTk9URSB0aGF0IGNwMSBpcyBiZWluZyB1c2VkIGFzIGEgdGVtcG9yYXJ5IHZhcmlhYmxlIGZvciB0aGUgc3dhcHBpbmcgb2YgdG1wIHdpdGggY3AwXG4gICAgICAgICAgICAgICAgICBjcDEgPSB0bXA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSBjcDA7XG4gICAgICAgICAgICAgICAgICBjcDAgPSBjcDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgbmV4dEVuZCA9IChuZXh0RW5kICsgMSkgfCAwOyAvLyBiZWNhdXNlIHdlIGFyZSBhZHZhbmNpbmcgaSB3aXRob3V0IGFkdmFuY2luZyBwb3NcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGludmFsaWQgY29kZSBwb2ludCBtZWFucyByZXBsYWNpbmcgdGhlIHdob2xlIHRoaW5nIHdpdGggbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgIGNwMCA+Pj0gODtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSBjcDAgLSAxKSB8IDA7IC8vIHJlc2V0IGluZGV4ICBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZVxuICAgICAgICAgICAgICBjcDAgPSAweGZmZmQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHJlc2V0IHRoZSB2YXJpYWJsZXMgZm9yIHRoZSBuZXh0IGdvLWFyb3VuZFxuICAgICAgICAgICAgbWluQml0cyA9IDA7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAwO1xuICAgICAgICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgICAgIC8qY2FzZSAxMTpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY29kZVBvaW50ID8gY29kZVBvaW50ID0gMCA6IGNwMCA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgIGNvbnRpbnVlOyovXG4gICAgICAgICAgZGVmYXVsdDogLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICB9XG4gICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgIH1cbiAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUoXG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzExXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMxXVxuICAgICAgKTtcbiAgICAgIGlmIChwb3MgPCAzMikgdG1wU3RyID0gdG1wU3RyLnNsaWNlKDAsIChwb3MgLSAzMikgfCAwKTsgLy8tKDMyLXBvcykpO1xuICAgICAgaWYgKGluZGV4IDwgbGVuKSB7XG4gICAgICAgIC8vZnJvbUNoYXJDb2RlLmFwcGx5KDAsIHRtcEJ1ZmZlclUxNiA6IFVpbnQ4QXJyYXkgPyAgdG1wQnVmZmVyVTE2LnN1YmFycmF5KDAscG9zKSA6IHRtcEJ1ZmZlclUxNi5zbGljZSgwLHBvcykpO1xuICAgICAgICB0bXBCdWZmZXJVMTZbMF0gPSB0bXA7XG4gICAgICAgIHBvcyA9IH50bXAgPj4+IDMxOyAvL3RtcCAhPT0gLTEgPyAxIDogMDtcbiAgICAgICAgdG1wID0gLTE7XG5cbiAgICAgICAgaWYgKHRtcFN0ci5sZW5ndGggPCByZXN1bHRpbmdTdHJpbmcubGVuZ3RoKSBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAodG1wICE9PSAtMSkge1xuICAgICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKHRtcCk7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdGluZ1N0cmluZyArPSB0bXBTdHI7XG4gICAgICB0bXBTdHIgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0aW5nU3RyaW5nO1xuICB9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBlbmNvZGVyUmVwbGFjZXIobm9uQXNjaWlDaGFyczogc3RyaW5nKSB7XG4gIC8vIG1ha2UgdGhlIFVURiBzdHJpbmcgaW50byBhIGJpbmFyeSBVVEYtOCBlbmNvZGVkIHN0cmluZ1xuICBsZXQgcG9pbnQgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMCkgfCAwO1xuICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgY29uc3QgbmV4dGNvZGUgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpXG4gICAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICAgICAgICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KSxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICAgICAgICk7XG4gICAgICB9IGVsc2UgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9XG4gIH1cbiAgLyppZiAocG9pbnQgPD0gMHgwMDdmKSByZXR1cm4gbm9uQXNjaWlDaGFycztcbiAgZWxzZSAqLyBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZSgoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpLCAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZikpO1xuICB9IGVsc2VcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKSxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgVGV4dEVuY29kZXIge1xuICBwdWJsaWMgZW5jb2RlKGlucHV0U3RyaW5nOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAvLyAweGMwID0+IDBiMTEwMDAwMDA7IDB4ZmYgPT4gMGIxMTExMTExMTsgMHhjMC0weGZmID0+IDBiMTF4eHh4eHhcbiAgICAvLyAweDgwID0+IDBiMTAwMDAwMDA7IDB4YmYgPT4gMGIxMDExMTExMTsgMHg4MC0weGJmID0+IDBiMTB4eHh4eHhcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogJycgKyBpbnB1dFN0cmluZyxcbiAgICAgIGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoKChsZW4gPDwgMSkgKyA4KSB8IDApO1xuICAgIGxldCB0bXBSZXN1bHQ6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGkgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHBvaW50ID0gMCxcbiAgICAgIG5leHRjb2RlID0gMDtcbiAgICBsZXQgdXBncmFkZWRlZEFycmF5U2l6ZSA9ICFVaW50OEFycmF5OyAvLyBub3JtYWwgYXJyYXlzIGFyZSBhdXRvLWV4cGFuZGluZ1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgcG9pbnQgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgaWYgKHBvaW50IDw9IDB4MDA3Zikge1xuICAgICAgICByZXN1bHRbcG9zXSA9IHBvaW50O1xuICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZGVuQ2hlY2s6IHtcbiAgICAgICAgICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgICAgICAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICAgICAgICAgIG5leHRjb2RlID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KChpID0gKGkgKyAxKSB8IDApKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgICAgICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgICAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbcG9zXSA9ICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KTtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhayB3aWRlbkNoZWNrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXVwZ3JhZGVkZWRBcnJheVNpemUgJiYgaSA8PCAxIDwgcG9zICYmIGkgPDwgMSA8ICgocG9zIC0gNykgfCAwKSkge1xuICAgICAgICAgICAgdXBncmFkZWRlZEFycmF5U2l6ZSA9IHRydWU7XG4gICAgICAgICAgICB0bXBSZXN1bHQgPSBuZXcgVWludDhBcnJheShsZW4gKiAzKTtcbiAgICAgICAgICAgIHRtcFJlc3VsdC5zZXQocmVzdWx0KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRtcFJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVWludDhBcnJheSA/IHJlc3VsdC5zdWJhcnJheSgwLCBwb3MpIDogcmVzdWx0LnNsaWNlKDAsIHBvcyk7XG4gIH1cblxuICBwdWJsaWMgZW5jb2RlSW50byhpbnB1dFN0cmluZzogc3RyaW5nLCB1OEFycjogVWludDhBcnJheSk6IHsgd3JpdHRlbjogbnVtYmVyOyByZWFkOiBudW1iZXIgfSB7XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICgnJyArIGlucHV0U3RyaW5nKS5yZXBsYWNlKGVuY29kZXJSZWdleHAsIGVuY29kZXJSZXBsYWNlcik7XG4gICAgbGV0IGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMCxcbiAgICAgIGkgPSAwLFxuICAgICAgY2hhciA9IDAsXG4gICAgICByZWFkID0gMDtcbiAgICBjb25zdCB1OEFyckxlbiA9IHU4QXJyLmxlbmd0aCB8IDA7XG4gICAgY29uc3QgaW5wdXRMZW5ndGggPSBpbnB1dFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGlmICh1OEFyckxlbiA8IGxlbikgbGVuID0gdThBcnJMZW47XG4gICAgcHV0Q2hhcnM6IHtcbiAgICAgIGZvciAoOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDApIHtcbiAgICAgICAgY2hhciA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICAgIHN3aXRjaCAoY2hhciA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAvLyBleHRlbnNpb24gcG9pbnRzOlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgaWYgKCgoaSArIDEpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBpZiAoKChpICsgMikgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIC8vaWYgKCEoY2hhciA9PT0gMHhFRiAmJiBlbmNvZGVkU3RyaW5nLnN1YnN0cihpKzF8MCwyKSA9PT0gXCJcXHhCRlxceEJEXCIpKVxuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBpZiAoKChpICsgMykgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrIHB1dENoYXJzO1xuICAgICAgICB9XG4gICAgICAgIC8vcmVhZCA9IHJlYWQgKyAoKGNoYXIgPj4gNikgIT09IDIpIHwwO1xuICAgICAgICB1OEFycltpXSA9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHdyaXR0ZW46IGksIHJlYWQ6IGlucHV0TGVuZ3RoIDwgcmVhZCA/IGlucHV0TGVuZ3RoIDogcmVhZCB9O1xuICB9XG59XG5cbi8qKlxuICogRW5jb2RlIGEgVVRGLTggc3RyaW5nIGludG8gYSBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGUoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBUZXh0RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlKHMpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIFVpbnQ4QXJyYXkgaW50byBhIFVURi04IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKGE6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gVGV4dERlY29kZXIucHJvdG90eXBlLmRlY29kZShhKTtcbn1cbiIsImltcG9ydCB7IFRlbXBvcmFsRmFpbHVyZSB9IGZyb20gJy4vZmFpbHVyZSc7XG5pbXBvcnQgeyBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLyoqXG4gKiBUaHJvd24gZnJvbSBjb2RlIHRoYXQgcmVjZWl2ZXMgYSB2YWx1ZSB0aGF0IGlzIHVuZXhwZWN0ZWQgb3IgdGhhdCBpdCdzIHVuYWJsZSB0byBoYW5kbGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVmFsdWVFcnJvcicpXG5leHBvcnQgY2xhc3MgVmFsdWVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IHVua25vd25cbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyB1bmRlZmluZWQpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBQYXlsb2FkIENvbnZlcnRlciBpcyBtaXNjb25maWd1cmVkLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1BheWxvYWRDb252ZXJ0ZXJFcnJvcicpXG5leHBvcnQgY2xhc3MgUGF5bG9hZENvbnZlcnRlckVycm9yIGV4dGVuZHMgVmFsdWVFcnJvciB7fVxuXG4vKipcbiAqIFVzZWQgaW4gZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBTREsgdG8gbm90ZSB0aGF0IHNvbWV0aGluZyB1bmV4cGVjdGVkIGhhcyBoYXBwZW5lZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdJbGxlZ2FsU3RhdGVFcnJvcicpXG5leHBvcnQgY2xhc3MgSWxsZWdhbFN0YXRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIHRocm93biBpbiB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICogIC0gV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBpcyBjdXJyZW50bHkgcnVubmluZ1xuICogIC0gVGhlcmUgaXMgYSBjbG9zZWQgV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFYFxuICogIC0gVGhlcmUgaXMgY2xvc2VkIFdvcmtmbG93IGluIHRoZSBgQ29tcGxldGVkYCBzdGF0ZSB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGFuZCB0aGUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3l9XG4gKiAgICBpcyBgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWWBcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvciBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZ1xuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgV29ya2Zsb3cgd2l0aCB0aGUgZ2l2ZW4gSWQgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqIEl0IGNvdWxkIGJlIGJlY2F1c2U6XG4gKiAtIElkIHBhc3NlZCBpcyBpbmNvcnJlY3RcbiAqIC0gV29ya2Zsb3cgaXMgY2xvc2VkIChmb3Igc29tZSBjYWxscywgZS5nLiBgdGVybWluYXRlYClcbiAqIC0gV29ya2Zsb3cgd2FzIGRlbGV0ZWQgZnJvbSB0aGUgU2VydmVyIGFmdGVyIHJlYWNoaW5nIGl0cyByZXRlbnRpb24gbGltaXRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd05vdEZvdW5kRXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93Tm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHJ1bklkOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZSBpcyBub3Qga25vd24gdG8gVGVtcG9yYWwgU2VydmVyLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ05hbWVzcGFjZU5vdEZvdW5kRXJyb3InKVxuZXhwb3J0IGNsYXNzIE5hbWVzcGFjZU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZykge1xuICAgIHN1cGVyKGBOYW1lc3BhY2Ugbm90IGZvdW5kOiAnJHtuYW1lc3BhY2V9J2ApO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBlcnJvck1lc3NhZ2UsIGlzUmVjb3JkLCBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuZXhwb3J0IGNvbnN0IEZBSUxVUkVfU09VUkNFID0gJ1R5cGVTY3JpcHRTREsnO1xuZXhwb3J0IHR5cGUgUHJvdG9GYWlsdXJlID0gdGVtcG9yYWwuYXBpLmZhaWx1cmUudjEuSUZhaWx1cmU7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGVcbmV4cG9ydCBlbnVtIFRpbWVvdXRUeXBlIHtcbiAgVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEID0gMCxcbiAgVElNRU9VVF9UWVBFX1NUQVJUX1RPX0NMT1NFID0gMSxcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX1NUQVJUID0gMixcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX0NMT1NFID0gMyxcbiAgVElNRU9VVF9UWVBFX0hFQVJUQkVBVCA9IDQsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGUsIFRpbWVvdXRUeXBlPigpO1xuY2hlY2tFeHRlbmRzPFRpbWVvdXRUeXBlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGU+KCk7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZVxuZXhwb3J0IGVudW0gUmV0cnlTdGF0ZSB7XG4gIFJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVEID0gMCxcbiAgUkVUUllfU1RBVEVfSU5fUFJPR1JFU1MgPSAxLFxuICBSRVRSWV9TVEFURV9OT05fUkVUUllBQkxFX0ZBSUxVUkUgPSAyLFxuICBSRVRSWV9TVEFURV9USU1FT1VUID0gMyxcbiAgUkVUUllfU1RBVEVfTUFYSU1VTV9BVFRFTVBUU19SRUFDSEVEID0gNCxcbiAgUkVUUllfU1RBVEVfUkVUUllfUE9MSUNZX05PVF9TRVQgPSA1LFxuICBSRVRSWV9TVEFURV9JTlRFUk5BTF9TRVJWRVJfRVJST1IgPSA2LFxuICBSRVRSWV9TVEFURV9DQU5DRUxfUkVRVUVTVEVEID0gNyxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlLCBSZXRyeVN0YXRlPigpO1xuY2hlY2tFeHRlbmRzPFJldHJ5U3RhdGUsIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlPigpO1xuXG5leHBvcnQgdHlwZSBXb3JrZmxvd0V4ZWN1dGlvbiA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVdvcmtmbG93RXhlY3V0aW9uO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgZmFpbHVyZXMgdGhhdCBjYW4gY3Jvc3MgV29ya2Zsb3cgYW5kIEFjdGl2aXR5IGJvdW5kYXJpZXMuXG4gKlxuICogKipOZXZlciBleHRlbmQgdGhpcyBjbGFzcyBvciBhbnkgb2YgaXRzIGNoaWxkcmVuLioqXG4gKlxuICogVGhlIG9ubHkgY2hpbGQgY2xhc3MgeW91IHNob3VsZCBldmVyIHRocm93IGZyb20geW91ciBjb2RlIGlzIHtAbGluayBBcHBsaWNhdGlvbkZhaWx1cmV9LlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1RlbXBvcmFsRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGVtcG9yYWxGYWlsdXJlIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIGZhaWx1cmUgdGhhdCBjb25zdHJ1Y3RlZCB0aGlzIGVycm9yLlxuICAgKlxuICAgKiBPbmx5IHByZXNlbnQgaWYgdGhpcyBlcnJvciB3YXMgZ2VuZXJhdGVkIGZyb20gYW4gZXh0ZXJuYWwgb3BlcmF0aW9uLlxuICAgKi9cbiAgcHVibGljIGZhaWx1cmU/OiBQcm90b0ZhaWx1cmU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyB1bmRlZmluZWQpO1xuICB9XG59XG5cbi8qKiBFeGNlcHRpb25zIG9yaWdpbmF0ZWQgYXQgdGhlIFRlbXBvcmFsIHNlcnZpY2UuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1NlcnZlckZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFNlcnZlckZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IG5vblJldHJ5YWJsZTogYm9vbGVhbixcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgcyBhcmUgdXNlZCB0byBjb21tdW5pY2F0ZSBhcHBsaWNhdGlvbi1zcGVjaWZpYyBmYWlsdXJlcyBpbiBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXMuXG4gKlxuICogVGhlIHtAbGluayB0eXBlfSBwcm9wZXJ0eSBpcyBtYXRjaGVkIGFnYWluc3Qge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9IHRvIGRldGVybWluZSBpZiBhbiBpbnN0YW5jZVxuICogb2YgdGhpcyBlcnJvciBpcyByZXRyeWFibGUuIEFub3RoZXIgd2F5IHRvIGF2b2lkIHJldHJ5aW5nIGlzIGJ5IHNldHRpbmcgdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgdG8gYHRydWVgLlxuICpcbiAqIEluIFdvcmtmbG93cywgaWYgeW91IHRocm93IGEgbm9uLWBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgVGFzayB3aWxsIGZhaWwgYW5kIGJlIHJldHJpZWQuIElmIHlvdSB0aHJvdyBhblxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gd2lsbCBmYWlsLlxuICpcbiAqIEluIEFjdGl2aXRpZXMsIHlvdSBjYW4gZWl0aGVyIHRocm93IGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIG9yIGFub3RoZXIgYEVycm9yYCB0byBmYWlsIHRoZSBBY3Rpdml0eSBUYXNrLiBJbiB0aGVcbiAqIGxhdHRlciBjYXNlLCB0aGUgYEVycm9yYCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYC4gVGhlIGNvbnZlcnNpb24gaXMgZG9uZSBhcyBmb2xsb3dpbmc6XG4gKlxuICogLSBgdHlwZWAgaXMgc2V0IHRvIGBlcnJvci5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBlcnJvci5uYW1lYFxuICogLSBgbWVzc2FnZWAgaXMgc2V0IHRvIGBlcnJvci5tZXNzYWdlYFxuICogLSBgbm9uUmV0cnlhYmxlYCBpcyBzZXQgdG8gZmFsc2VcbiAqIC0gYGRldGFpbHNgIGFyZSBzZXQgdG8gbnVsbFxuICogLSBzdGFjayB0cmFjZSBpcyBjb3BpZWQgZnJvbSB0aGUgb3JpZ2luYWwgZXJyb3JcbiAqXG4gKiBXaGVuIGFuIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hbi1hY3Rpdml0eS1leGVjdXRpb24gfCBBY3Rpdml0eSBFeGVjdXRpb259IGZhaWxzLCB0aGVcbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgIGZyb20gdGhlIGxhc3QgQWN0aXZpdHkgVGFzayB3aWxsIGJlIHRoZSBgY2F1c2VgIG9mIHRoZSB7QGxpbmsgQWN0aXZpdHlGYWlsdXJlfSB0aHJvd24gaW4gdGhlXG4gKiBXb3JrZmxvdy5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdBcHBsaWNhdGlvbkZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIC8qKlxuICAgKiBBbHRlcm5hdGl2ZWx5LCB1c2Uge0BsaW5rIGZyb21FcnJvcn0gb3Ige0BsaW5rIGNyZWF0ZX0uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgdHlwZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IG5vblJldHJ5YWJsZT86IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzPzogdW5rbm93bltdIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgZnJvbSBhbiBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIEZpcnN0IGNhbGxzIHtAbGluayBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUgfCBgZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKWB9IGFuZCB0aGVuIG92ZXJyaWRlcyBhbnkgZmllbGRzXG4gICAqIHByb3ZpZGVkIGluIGBvdmVycmlkZXNgLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tRXJyb3IoZXJyb3I6IEVycm9yIHwgdW5rbm93biwgb3ZlcnJpZGVzPzogQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgY29uc3QgZmFpbHVyZSA9IGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcik7XG4gICAgT2JqZWN0LmFzc2lnbihmYWlsdXJlLCBvdmVycmlkZXMpO1xuICAgIHJldHVybiBmYWlsdXJlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgd2lsbCBiZSByZXRyeWFibGUgKHVubGVzcyBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvcHRpb25zOiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZSA9IGZhbHNlLCBkZXRhaWxzLCBjYXVzZSB9ID0gb3B0aW9ucztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlLCBkZXRhaWxzLCBjYXVzZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgc2V0IHRvIGZhbHNlLiBOb3RlIHRoYXQgdGhpcyBlcnJvciB3aWxsIHN0aWxsXG4gICAqIG5vdCBiZSByZXRyaWVkIGlmIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9LlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBPcHRpb25hbCBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSB0eXBlIE9wdGlvbmFsIGVycm9yIHR5cGUgKHVzZWQgYnkge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KVxuICAgKiBAcGFyYW0gZGV0YWlscyBPcHRpb25hbCBkZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJldHJ5YWJsZShtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCwgdHlwZT86IHN0cmluZyB8IG51bGwsIC4uLmRldGFpbHM6IHVua25vd25bXSk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUgPz8gJ0Vycm9yJywgZmFsc2UsIGRldGFpbHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byB0cnVlLlxuICAgKlxuICAgKiBXaGVuIHRocm93biBmcm9tIGFuIEFjdGl2aXR5IG9yIFdvcmtmbG93LCB0aGUgQWN0aXZpdHkgb3IgV29ya2Zsb3cgd2lsbCBub3QgYmUgcmV0cmllZCAoZXZlbiBpZiBgdHlwZWAgaXMgbm90XG4gICAqIGxpc3RlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pLlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBPcHRpb25hbCBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSB0eXBlIE9wdGlvbmFsIGVycm9yIHR5cGVcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub25SZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIHRydWUsIGRldGFpbHMpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBFcnJvciBtZXNzYWdlXG4gICAqL1xuICBtZXNzYWdlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBFcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICovXG4gIHR5cGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgQWN0aXZpdHkgb3IgV29ya2Zsb3cgY2FuIGJlIHJldHJpZWRcbiAgICpcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG5vblJldHJ5YWJsZT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIERldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIGRldGFpbHM/OiB1bmtub3duW107XG5cbiAgLyoqXG4gICAqIENhdXNlIG9mIHRoZSBmYWlsdXJlXG4gICAqL1xuICBjYXVzZT86IEVycm9yO1xufVxuXG4vKipcbiAqIFRoaXMgZXJyb3IgaXMgdGhyb3duIHdoZW4gQ2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC4gVG8gYWxsb3cgQ2FuY2VsbGF0aW9uIHRvIGhhcHBlbiwgbGV0IGl0IHByb3BhZ2F0ZS4gVG9cbiAqIGlnbm9yZSBDYW5jZWxsYXRpb24sIGNhdGNoIGl0IGFuZCBjb250aW51ZSBleGVjdXRpbmcuIE5vdGUgdGhhdCBDYW5jZWxsYXRpb24gY2FuIG9ubHkgYmUgcmVxdWVzdGVkIGEgc2luZ2xlIHRpbWUsIHNvXG4gKiB5b3VyIFdvcmtmbG93L0FjdGl2aXR5IEV4ZWN1dGlvbiB3aWxsIG5vdCByZWNlaXZlIGZ1cnRoZXIgQ2FuY2VsbGF0aW9uIHJlcXVlc3RzLlxuICpcbiAqIFdoZW4gYSBXb3JrZmxvdyBvciBBY3Rpdml0eSBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY2FuY2VsbGVkLCBhIGBDYW5jZWxsZWRGYWlsdXJlYCB3aWxsIGJlIHRoZSBgY2F1c2VgLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NhbmNlbGxlZEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIENhbmNlbGxlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM6IHVua25vd25bXSA9IFtdLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCBhcyB0aGUgYGNhdXNlYCB3aGVuIGEgV29ya2Zsb3cgaGFzIGJlZW4gdGVybWluYXRlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1Rlcm1pbmF0ZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUZXJtaW5hdGVkRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCwgY2F1c2U/OiBFcnJvcikge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gcmVwcmVzZW50IHRpbWVvdXRzIG9mIEFjdGl2aXRpZXMgYW5kIFdvcmtmbG93c1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1RpbWVvdXRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUaW1lb3V0RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGFzdEhlYXJ0YmVhdERldGFpbHM6IHVua25vd24sXG4gICAgcHVibGljIHJlYWRvbmx5IHRpbWVvdXRUeXBlOiBUaW1lb3V0VHlwZVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGFuIEFjdGl2aXR5IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgb3JpZ2luYWwgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMgYGNhdXNlYC5cbiAqIEZvciBleGFtcGxlLCBpZiBhbiBBY3Rpdml0eSB0aW1lZCBvdXQsIHRoZSBjYXVzZSB3aWxsIGJlIGEge0BsaW5rIFRpbWVvdXRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQWN0aXZpdHlGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlJZDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIHB1YmxpYyByZWFkb25seSBpZGVudGl0eTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBDaGlsZCBXb3JrZmxvdyBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIHtAbGluayBjYXVzZX0uXG4gKiBGb3IgZXhhbXBsZSwgaWYgdGhlIENoaWxkIHdhcyBUZXJtaW5hdGVkLCB0aGUgYGNhdXNlYCBpcyBhIHtAbGluayBUZXJtaW5hdGVkRmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NoaWxkV29ya2Zsb3dGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDaGlsZFdvcmtmbG93RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGV4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb24sXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIoJ0NoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBmYWlsZWQnLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZiBgZXJyb3JgIGlzIGFscmVhZHkgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHJldHVybnMgYGVycm9yYC5cbiAqXG4gKiBPdGhlcndpc2UsIGNvbnZlcnRzIGBlcnJvcmAgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoOlxuICpcbiAqIC0gYG1lc3NhZ2VgOiBgZXJyb3IubWVzc2FnZWAgb3IgYFN0cmluZyhlcnJvcilgXG4gKiAtIGB0eXBlYDogYGVycm9yLmNvbnN0cnVjdG9yLm5hbWVgIG9yIGBlcnJvci5uYW1lYFxuICogLSBgc3RhY2tgOiBgZXJyb3Iuc3RhY2tgIG9yIGAnJ2BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcjogdW5rbm93bik6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2UgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5tZXNzYWdlKSkgfHwgU3RyaW5nKGVycm9yKTtcbiAgY29uc3QgdHlwZSA9IChpc1JlY29yZChlcnJvcikgJiYgKGVycm9yLmNvbnN0cnVjdG9yPy5uYW1lID8/IGVycm9yLm5hbWUpKSB8fCB1bmRlZmluZWQ7XG4gIGNvbnN0IGZhaWx1cmUgPSBBcHBsaWNhdGlvbkZhaWx1cmUuY3JlYXRlKHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlOiBmYWxzZSB9KTtcbiAgZmFpbHVyZS5zdGFjayA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLnN0YWNrKSkgfHwgJyc7XG4gIHJldHVybiBmYWlsdXJlO1xufVxuXG4vKipcbiAqIElmIGBlcnJgIGlzIGFuIEVycm9yIGl0IGlzIHR1cm5lZCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICpcbiAqIElmIGBlcnJgIHdhcyBhbHJlYWR5IGEgYFRlbXBvcmFsRmFpbHVyZWAsIHJldHVybnMgdGhlIG9yaWdpbmFsIGVycm9yLlxuICpcbiAqIE90aGVyd2lzZSByZXR1cm5zIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggYFN0cmluZyhlcnIpYCBhcyB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnI6IHVua25vd24pOiBUZW1wb3JhbEZhaWx1cmUge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuICByZXR1cm4gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycik7XG59XG5cbi8qKlxuICogR2V0IHRoZSByb290IGNhdXNlIG1lc3NhZ2Ugb2YgZ2l2ZW4gYGVycm9yYC5cbiAqXG4gKiBJbiBjYXNlIGBlcnJvcmAgaXMgYSB7QGxpbmsgVGVtcG9yYWxGYWlsdXJlfSwgcmVjdXJzZSB0aGUgYGNhdXNlYCBjaGFpbiBhbmQgcmV0dXJuIHRoZSByb290IGBjYXVzZS5tZXNzYWdlYC5cbiAqIE90aGVyd2lzZSwgcmV0dXJuIGBlcnJvci5tZXNzYWdlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvb3RDYXVzZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvci5jYXVzZSA/IHJvb3RDYXVzZShlcnJvci5jYXVzZSkgOiBlcnJvci5tZXNzYWdlO1xuICB9XG4gIHJldHVybiBlcnJvck1lc3NhZ2UoZXJyb3IpO1xufVxuIiwiLyoqXG4gKiBDb21tb24gbGlicmFyeSBmb3IgY29kZSB0aGF0J3MgdXNlZCBhY3Jvc3MgdGhlIENsaWVudCwgV29ya2VyLCBhbmQvb3IgV29ya2Zsb3dcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0ICogYXMgZW5jb2RpbmcgZnJvbSAnLi9lbmNvZGluZyc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuZXhwb3J0ICogZnJvbSAnLi9hY3Rpdml0eS1vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL2RhdGEtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL2ZhaWx1cmUtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29kZWMnO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvcGF5bG9hZC1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvdHlwZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXByZWNhdGVkLXRpbWUnO1xuZXhwb3J0ICogZnJvbSAnLi9lcnJvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9mYWlsdXJlJztcbmV4cG9ydCB7IEhlYWRlcnMsIE5leHQgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9sb2dnZXInO1xuZXhwb3J0ICogZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuZXhwb3J0IHR5cGUgeyBUaW1lc3RhbXAsIER1cmF0aW9uLCBTdHJpbmdWYWx1ZSB9IGZyb20gJy4vdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5cbi8qKlxuICogRW5jb2RlIGEgVVRGLTggc3RyaW5nIGludG8gYSBVaW50OEFycmF5XG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHU4KHM6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gZW5jb2RpbmcuZW5jb2RlKHMpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIFVpbnQ4QXJyYXkgaW50byBhIFVURi04IHN0cmluZ1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYXJyOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuY29kaW5nLmRlY29kZShhcnIpO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IubWVzc2FnZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gaGVscGVycy5lcnJvck1lc3NhZ2UoZXJyb3IpO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IuY29kZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckNvZGUoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gaGVscGVycy5lcnJvckNvZGUoZXJyb3IpO1xufVxuIiwiaW1wb3J0IHsgQW55RnVuYywgT21pdExhc3RQYXJhbSB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIFR5cGUgb2YgdGhlIG5leHQgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gaW50ZXJjZXB0b3IgZnVuY3Rpb25cbiAqXG4gKiBDYWxsZWQgZnJvbSBhbiBpbnRlcmNlcHRvciB0byBjb250aW51ZSB0aGUgaW50ZXJjZXB0aW9uIGNoYWluXG4gKi9cbmV4cG9ydCB0eXBlIE5leHQ8SUYsIEZOIGV4dGVuZHMga2V5b2YgSUY+ID0gUmVxdWlyZWQ8SUY+W0ZOXSBleHRlbmRzIEFueUZ1bmMgPyBPbWl0TGFzdFBhcmFtPFJlcXVpcmVkPElGPltGTl0+IDogbmV2ZXI7XG5cbi8qKiBIZWFkZXJzIGFyZSBqdXN0IGEgbWFwcGluZyBvZiBoZWFkZXIgbmFtZSB0byBQYXlsb2FkICovXG5leHBvcnQgdHlwZSBIZWFkZXJzID0gUmVjb3JkPHN0cmluZywgUGF5bG9hZD47XG5cbi8qKlxuICogQ29tcG9zZSBhbGwgaW50ZXJjZXB0b3IgbWV0aG9kcyBpbnRvIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIENhbGxpbmcgdGhlIGNvbXBvc2VkIGZ1bmN0aW9uIHJlc3VsdHMgaW4gY2FsbGluZyBlYWNoIG9mIHRoZSBwcm92aWRlZCBpbnRlcmNlcHRvciwgaW4gb3JkZXIgKGZyb20gdGhlIGZpcnN0IHRvXG4gKiB0aGUgbGFzdCksIGZvbGxvd2VkIGJ5IHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBwcm92aWRlZCBhcyBhcmd1bWVudCB0byBgY29tcG9zZUludGVyY2VwdG9ycygpYC5cbiAqXG4gKiBAcGFyYW0gaW50ZXJjZXB0b3JzIGEgbGlzdCBvZiBpbnRlcmNlcHRvcnNcbiAqIEBwYXJhbSBtZXRob2QgdGhlIG5hbWUgb2YgdGhlIGludGVyY2VwdG9yIG1ldGhvZCB0byBjb21wb3NlXG4gKiBAcGFyYW0gbmV4dCB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgaW50ZXJjZXB0aW9uIGNoYWluXG4gKi9cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgbGliL2ludGVyY2VwdG9ycylcbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlSW50ZXJjZXB0b3JzPEksIE0gZXh0ZW5kcyBrZXlvZiBJPihpbnRlcmNlcHRvcnM6IElbXSwgbWV0aG9kOiBNLCBuZXh0OiBOZXh0PEksIE0+KTogTmV4dDxJLCBNPiB7XG4gIGZvciAobGV0IGkgPSBpbnRlcmNlcHRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICBjb25zdCBpbnRlcmNlcHRvciA9IGludGVyY2VwdG9yc1tpXTtcbiAgICBpZiAoaW50ZXJjZXB0b3JbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcmV2ID0gbmV4dDtcbiAgICAgIC8vIFdlIGxvc2UgdHlwZSBzYWZldHkgaGVyZSBiZWNhdXNlIFR5cGVzY3JpcHQgY2FuJ3QgZGVkdWNlIHRoYXQgaW50ZXJjZXB0b3JbbWV0aG9kXSBpcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJuc1xuICAgICAgLy8gdGhlIHNhbWUgdHlwZSBhcyBOZXh0PEksIE0+XG4gICAgICBuZXh0ID0gKChpbnB1dDogYW55KSA9PiAoaW50ZXJjZXB0b3JbbWV0aG9kXSBhcyBhbnkpKGlucHV0LCBwcmV2KSkgYXMgYW55O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV4dDtcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbmV4cG9ydCB0eXBlIFBheWxvYWQgPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklQYXlsb2FkO1xuXG4vKiogVHlwZSB0aGF0IGNhbiBiZSByZXR1cm5lZCBmcm9tIGEgV29ya2Zsb3cgYGV4ZWN1dGVgIGZ1bmN0aW9uICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd1JldHVyblR5cGUgPSBQcm9taXNlPGFueT47XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZVR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8YW55PiB8IGFueTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZSA9IHtcbiAgaGFuZGxlcjogV29ya2Zsb3dVcGRhdGVUeXBlO1xuICB2YWxpZGF0b3I/OiBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGU7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93U2lnbmFsVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUgPSB7IGhhbmRsZXI6IFdvcmtmbG93U2lnbmFsVHlwZTsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSA9IHsgaGFuZGxlcjogV29ya2Zsb3dRdWVyeVR5cGU7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQnJvYWQgV29ya2Zsb3cgZnVuY3Rpb24gZGVmaW5pdGlvbiwgc3BlY2lmaWMgV29ya2Zsb3dzIHdpbGwgdHlwaWNhbGx5IHVzZSBhIG5hcnJvd2VyIHR5cGUgZGVmaW5pdGlvbiwgZS5nOlxuICogYGBgdHNcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93ID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBXb3JrZmxvd1JldHVyblR5cGU7XG5cbmRlY2xhcmUgY29uc3QgYXJnc0JyYW5kOiB1bmlxdWUgc3ltYm9sO1xuZGVjbGFyZSBjb25zdCByZXRCcmFuZDogdW5pcXVlIHN5bWJvbDtcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgdXBkYXRlIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVVwZGF0ZX1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHVwZGF0ZSBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAndXBkYXRlJztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgc2lnbmFsIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHNpZ25hbCBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbERlZmluaXRpb248QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3NpZ25hbCc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHF1ZXJ5IGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lUXVlcnl9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGFuZCBgUmV0YCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgcXVlcnkgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAncXVlcnknO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBRdWVyeURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqIEdldCB0aGUgXCJ1bndyYXBwZWRcIiByZXR1cm4gdHlwZSAod2l0aG91dCBQcm9taXNlKSBvZiB0aGUgZXhlY3V0ZSBoYW5kbGVyIGZyb20gV29ya2Zsb3cgdHlwZSBgV2AgKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmVzdWx0VHlwZTxXIGV4dGVuZHMgV29ya2Zsb3c+ID0gUmV0dXJuVHlwZTxXPiBleHRlbmRzIFByb21pc2U8aW5mZXIgUj4gPyBSIDogbmV2ZXI7XG5cbi8qKlxuICogSWYgYW5vdGhlciBTREsgY3JlYXRlcyBhIFNlYXJjaCBBdHRyaWJ1dGUgdGhhdCdzIG5vdCBhbiBhcnJheSwgd2Ugd3JhcCBpdCBpbiBhbiBhcnJheS5cbiAqXG4gKiBEYXRlcyBhcmUgc2VyaWFsaXplZCBhcyBJU08gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlcyA9IFJlY29yZDxzdHJpbmcsIFNlYXJjaEF0dHJpYnV0ZVZhbHVlIHwgUmVhZG9ubHk8U2VhcmNoQXR0cmlidXRlVmFsdWU+IHwgdW5kZWZpbmVkPjtcbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZVZhbHVlID0gc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXSB8IERhdGVbXTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUZ1bmN0aW9uPFAgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBSID0gYW55PiB7XG4gICguLi5hcmdzOiBQKTogUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqIEBkZXByZWNhdGVkIG5vdCByZXF1aXJlZCBhbnltb3JlLCBmb3IgdW50eXBlZCBhY3Rpdml0aWVzIHVzZSB7QGxpbmsgVW50eXBlZEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIFVudHlwZWRBY3Rpdml0aWVzID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogQSB3b3JrZmxvdydzIGhpc3RvcnkgYW5kIElELiBVc2VmdWwgZm9yIHJlcGxheS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5QW5kV29ya2Zsb3dJZCB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgaGlzdG9yeTogdGVtcG9yYWwuYXBpLmhpc3RvcnkudjEuSGlzdG9yeSB8IHVua25vd24gfCB1bmRlZmluZWQ7XG59XG4iLCJleHBvcnQgdHlwZSBMb2dMZXZlbCA9ICdUUkFDRScgfCAnREVCVUcnIHwgJ0lORk8nIHwgJ1dBUk4nIHwgJ0VSUk9SJztcblxuZXhwb3J0IHR5cGUgTG9nTWV0YWRhdGEgPSBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBhbnk+O1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGlzIGludGVyZmFjZSBpbiBvcmRlciB0byBjdXN0b21pemUgd29ya2VyIGxvZ2dpbmdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2cobGV2ZWw6IExvZ0xldmVsLCBtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgdHJhY2UobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbn1cblxuLyoqXG4gKiBQb3NzaWJsZSB2YWx1ZXMgb2YgdGhlIGBzZGtDb21wb25lbnRgIG1ldGEgYXR0cmlidXRlcyBvbiBsb2cgbWVzc2FnZXMuIFRoaXNcbiAqIGF0dHJpYnV0ZSBpbmRpY2F0ZXMgd2hpY2ggc3Vic3lzdGVtIGVtaXR0ZWQgdGhlIGxvZyBtZXNzYWdlOyB0aGlzIG1heSBmb3JcbiAqIGV4YW1wbGUgYmUgdXNlZCB0byBpbXBsZW1lbnQgZmluZS1ncmFpbmVkIGZpbHRlcmluZyBvZiBsb2cgbWVzc2FnZXMuXG4gKlxuICogTm90ZSB0aGF0IHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoaXMgbGlzdCB3aWxsIHJlbWFpbiBzdGFibGUgaW4gdGhlXG4gKiBmdXR1cmU7IHZhbHVlcyBtYXkgYmUgYWRkZWQgb3IgcmVtb3ZlZCwgYW5kIG1lc3NhZ2VzIHRoYXQgYXJlIGN1cnJlbnRseVxuICogZW1pdHRlZCB3aXRoIHNvbWUgYHNka0NvbXBvbmVudGAgdmFsdWUgbWF5IHVzZSBhIGRpZmZlcmVudCB2YWx1ZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgZW51bSBTZGtDb21wb25lbnQge1xuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIFdvcmtmbG93IGNvZGUsIHVzaW5nIHRoZSB7QGxpbmsgV29ya2Zsb3cgY29udGV4dCBsb2dnZXJ8d29ya2Zsb3cubG9nfS5cbiAgICogVGhlIFNESyBpdHNlbGYgbmV2ZXIgcHVibGlzaGVzIG1lc3NhZ2VzIHdpdGggdGhpcyBjb21wb25lbnQgbmFtZS5cbiAgICovXG4gIHdvcmtmbG93ID0gJ3dvcmtmbG93JyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIGFuIGFjdGl2aXR5LCB1c2luZyB0aGUge0BsaW5rIGFjdGl2aXR5IGNvbnRleHQgbG9nZ2VyfENvbnRleHQubG9nfS5cbiAgICogVGhlIFNESyBpdHNlbGYgbmV2ZXIgcHVibGlzaGVzIG1lc3NhZ2VzIHdpdGggdGhpcyBjb21wb25lbnQgbmFtZS5cbiAgICovXG4gIGFjdGl2aXR5ID0gJ2FjdGl2aXR5JyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIGEgVGVtcG9yYWwgV29ya2VyIGluc3RhbmNlLlxuICAgKlxuICAgKiBUaGlzIG5vdGFibHkgaW5jbHVkZXM6XG4gICAqIC0gSXNzdWVzIHdpdGggV29ya2VyIG9yIHJ1bnRpbWUgY29uZmlndXJhdGlvbiwgb3IgdGhlIEpTIGV4ZWN1dGlvbiBlbnZpcm9ubWVudDtcbiAgICogLSBXb3JrZXIncywgQWN0aXZpdHkncywgYW5kIFdvcmtmbG93J3MgbGlmZWN5Y2xlIGV2ZW50cztcbiAgICogLSBXb3JrZmxvdyBBY3RpdmF0aW9uIGFuZCBBY3Rpdml0eSBUYXNrIHByb2Nlc3NpbmcgZXZlbnRzO1xuICAgKiAtIFdvcmtmbG93IGJ1bmRsaW5nIG1lc3NhZ2VzO1xuICAgKiAtIFNpbmsgcHJvY2Vzc2luZyBpc3N1ZXMuXG4gICAqL1xuICB3b3JrZXIgPSAnd29ya2VyJyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIGFsbCBtZXNzYWdlcyBlbWl0dGVkIGJ5IHRoZSBSdXN0IENvcmUgU0RLIGxpYnJhcnkuXG4gICAqL1xuICBjb3JlID0gJ2NvcmUnLFxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgbXNPcHRpb25hbFRvTnVtYmVyLCBtc09wdGlvbmFsVG9UcywgbXNUb051bWJlciwgbXNUb1RzLCBvcHRpb25hbFRzVG9NcyB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgcmV0cnlpbmcgV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmV0cnlQb2xpY3kge1xuICAvKipcbiAgICogQ29lZmZpY2llbnQgdXNlZCB0byBjYWxjdWxhdGUgdGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwuXG4gICAqIFRoZSBuZXh0IHJldHJ5IGludGVydmFsIGlzIHByZXZpb3VzIGludGVydmFsIG11bHRpcGxpZWQgYnkgdGhpcyBjb2VmZmljaWVudC5cbiAgICogQG1pbmltdW0gMVxuICAgKiBAZGVmYXVsdCAyXG4gICAqL1xuICBiYWNrb2ZmQ29lZmZpY2llbnQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJbnRlcnZhbCBvZiB0aGUgZmlyc3QgcmV0cnkuXG4gICAqIElmIGNvZWZmaWNpZW50IGlzIDEgdGhlbiBpdCBpcyB1c2VkIGZvciBhbGwgcmV0cmllc1xuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICogQGRlZmF1bHQgMSBzZWNvbmRcbiAgICovXG4gIGluaXRpYWxJbnRlcnZhbD86IER1cmF0aW9uO1xuICAvKipcbiAgICogTWF4aW11bSBudW1iZXIgb2YgYXR0ZW1wdHMuIFdoZW4gZXhjZWVkZWQsIHJldHJpZXMgc3RvcCAoZXZlbiBpZiB7QGxpbmsgQWN0aXZpdHlPcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9XG4gICAqIGhhc24ndCBiZWVuIHJlYWNoZWQpLlxuICAgKlxuICAgKiBAZGVmYXVsdCBJbmZpbml0eVxuICAgKi9cbiAgbWF4aW11bUF0dGVtcHRzPzogbnVtYmVyO1xuICAvKipcbiAgICogTWF4aW11bSBpbnRlcnZhbCBiZXR3ZWVuIHJldHJpZXMuXG4gICAqIEV4cG9uZW50aWFsIGJhY2tvZmYgbGVhZHMgdG8gaW50ZXJ2YWwgaW5jcmVhc2UuXG4gICAqIFRoaXMgdmFsdWUgaXMgdGhlIGNhcCBvZiB0aGUgaW5jcmVhc2UuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEwMHggb2Yge0BsaW5rIGluaXRpYWxJbnRlcnZhbH1cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBtYXhpbXVtSW50ZXJ2YWw/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTGlzdCBvZiBhcHBsaWNhdGlvbiBmYWlsdXJlcyB0eXBlcyB0byBub3QgcmV0cnkuXG4gICAqL1xuICBub25SZXRyeWFibGVFcnJvclR5cGVzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogVHVybiBhIFRTIFJldHJ5UG9saWN5IGludG8gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlUmV0cnlQb2xpY3kocmV0cnlQb2xpY3k6IFJldHJ5UG9saWN5KTogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kge1xuICBpZiAocmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50ICE9IG51bGwgJiYgcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IDw9IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IG11c3QgYmUgZ3JlYXRlciB0aGFuIDAnKTtcbiAgfVxuICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzICE9IG51bGwpIHtcbiAgICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIC8vIGRyb3AgZmllbGQgKEluZmluaXR5IGlzIHRoZSBkZWZhdWx0KVxuICAgICAgY29uc3QgeyBtYXhpbXVtQXR0ZW1wdHM6IF8sIC4uLndpdGhvdXQgfSA9IHJldHJ5UG9saWN5O1xuICAgICAgcmV0cnlQb2xpY3kgPSB3aXRob3V0O1xuICAgIH0gZWxzZSBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXInKTtcbiAgICB9IGVsc2UgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhbiBpbnRlZ2VyJyk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG1heGltdW1JbnRlcnZhbCA9IG1zT3B0aW9uYWxUb051bWJlcihyZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwpO1xuICBjb25zdCBpbml0aWFsSW50ZXJ2YWwgPSBtc1RvTnVtYmVyKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCA/PyAxMDAwKTtcbiAgaWYgKG1heGltdW1JbnRlcnZhbCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIDAnKTtcbiAgfVxuICBpZiAoaW5pdGlhbEludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChtYXhpbXVtSW50ZXJ2YWwgIT0gbnVsbCAmJiBtYXhpbXVtSW50ZXJ2YWwgPCBpbml0aWFsSW50ZXJ2YWwpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsIGNhbm5vdCBiZSBsZXNzIHRoYW4gaXRzIGluaXRpYWxJbnRlcnZhbCcpO1xuICB9XG4gIHJldHVybiB7XG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMsXG4gICAgaW5pdGlhbEludGVydmFsOiBtc1RvVHMoaW5pdGlhbEludGVydmFsKSxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG1zT3B0aW9uYWxUb1RzKG1heGltdW1JbnRlcnZhbCksXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQsXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgcHJvdG8gY29tcGF0aWJsZSBSZXRyeVBvbGljeSBpbnRvIGEgVFMgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcGlsZVJldHJ5UG9saWN5KFxuICByZXRyeVBvbGljeT86IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVJldHJ5UG9saWN5IHwgbnVsbFxuKTogUmV0cnlQb2xpY3kgfCB1bmRlZmluZWQge1xuICBpZiAoIXJldHJ5UG9saWN5KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1BdHRlbXB0czogcmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID8/IHVuZGVmaW5lZCxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCksXG4gICAgaW5pdGlhbEludGVydmFsOiBvcHRpb25hbFRzVG9NcyhyZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwpLFxuICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IHJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXMgPz8gdW5kZWZpbmVkLFxuICB9O1xufVxuIiwiaW1wb3J0IExvbmcgZnJvbSAnbG9uZyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLW5hbWVkLWFzLWRlZmF1bHRcbmltcG9ydCBtcywgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCB0eXBlIHsgZ29vZ2xlIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcblxuLy8gTk9URTogdGhlc2UgYXJlIHRoZSBzYW1lIGludGVyZmFjZSBpbiBKU1xuLy8gZ29vZ2xlLnByb3RvYnVmLklEdXJhdGlvbjtcbi8vIGdvb2dsZS5wcm90b2J1Zi5JVGltZXN0YW1wO1xuLy8gVGhlIGNvbnZlcnNpb24gZnVuY3Rpb25zIGJlbG93IHNob3VsZCB3b3JrIGZvciBib3RoXG5cbmV4cG9ydCB0eXBlIFRpbWVzdGFtcCA9IGdvb2dsZS5wcm90b2J1Zi5JVGltZXN0YW1wO1xuXG4vKipcbiAqIEEgZHVyYXRpb24sIGV4cHJlc3NlZCBlaXRoZXIgYXMgYSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBvciBhcyBhIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9LlxuICovXG5leHBvcnQgdHlwZSBEdXJhdGlvbiA9IFN0cmluZ1ZhbHVlIHwgbnVtYmVyO1xuXG5leHBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvdy5cbiAqIElmIHRzIGlzIG51bGwgb3IgdW5kZWZpbmVkIHJldHVybnMgdW5kZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgdGltZXN0YW1wLCBnb3QgJHt0c31gKTtcbiAgfVxuICBjb25zdCB7IHNlY29uZHMsIG5hbm9zIH0gPSB0cztcbiAgcmV0dXJuIChzZWNvbmRzIHx8IExvbmcuVVpFUk8pXG4gICAgLm11bCgxMDAwKVxuICAgIC5hZGQoTWF0aC5mbG9vcigobmFub3MgfHwgMCkgLyAxMDAwMDAwKSlcbiAgICAudG9OdW1iZXIoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zTnVtYmVyVG9UcyhtaWxsaXM6IG51bWJlcik6IFRpbWVzdGFtcCB7XG4gIGNvbnN0IHNlY29uZHMgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDEwMDApO1xuICBjb25zdCBuYW5vcyA9IChtaWxsaXMgJSAxMDAwKSAqIDEwMDAwMDA7XG4gIGlmIChOdW1iZXIuaXNOYU4oc2Vjb25kcykgfHwgTnVtYmVyLmlzTmFOKG5hbm9zKSkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBJbnZhbGlkIG1pbGxpcyAke21pbGxpc31gKTtcbiAgfVxuICByZXR1cm4geyBzZWNvbmRzOiBMb25nLmZyb21OdW1iZXIoc2Vjb25kcyksIG5hbm9zIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc1RvVHMoc3RyOiBEdXJhdGlvbik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiBtc051bWJlclRvVHMobXNUb051bWJlcihzdHIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb1RzKHN0cjogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gc3RyID8gbXNUb1RzKHN0cikgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIG1zVG9OdW1iZXIodmFsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgcmV0dXJuIG1zV2l0aFZhbGlkYXRpb24odmFsKTtcbn1cblxuZnVuY3Rpb24gbXNXaXRoVmFsaWRhdGlvbihzdHI6IFN0cmluZ1ZhbHVlKTogbnVtYmVyIHtcbiAgY29uc3QgbWlsbGlzID0gbXMoc3RyKTtcbiAgaWYgKG1pbGxpcyA9PSBudWxsIHx8IGlzTmFOKG1pbGxpcykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGR1cmF0aW9uIHN0cmluZzogJyR7c3RyfSdgKTtcbiAgfVxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgc2NoZWR1bGUtaGVscGVycy50cylcbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbERhdGVUb1RzKGRhdGU6IERhdGUgfCBudWxsIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGRhdGUgPT09IHVuZGVmaW5lZCB8fCBkYXRlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbXNUb1RzKGRhdGUuZ2V0VGltZSgpKTtcbn1cbiIsIi8qKiBTaG9ydGhhbmQgYWxpYXMgKi9cbmV4cG9ydCB0eXBlIEFueUZ1bmMgPSAoLi4uYXJnczogYW55W10pID0+IGFueTtcbi8qKiBBIHR1cGxlIHdpdGhvdXQgaXRzIGxhc3QgZWxlbWVudCAqL1xuZXhwb3J0IHR5cGUgT21pdExhc3Q8VD4gPSBUIGV4dGVuZHMgWy4uLmluZmVyIFJFU1QsIGFueV0gPyBSRVNUIDogbmV2ZXI7XG4vKiogRiB3aXRoIGFsbCBhcmd1bWVudHMgYnV0IHRoZSBsYXN0ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdFBhcmFtPEYgZXh0ZW5kcyBBbnlGdW5jPiA9ICguLi5hcmdzOiBPbWl0TGFzdDxQYXJhbWV0ZXJzPEY+PikgPT4gUmV0dXJuVHlwZTxGPjtcbi8qKiBSZXF1aXJlIHRoYXQgVCBoYXMgYXQgbGVhc3Qgb25lIG9mIHRoZSBwcm92aWRlZCBwcm9wZXJ0aWVzIGRlZmluZWQgKi9cbmV4cG9ydCB0eXBlIFJlcXVpcmVBdExlYXN0T25lPFQsIEtleXMgZXh0ZW5kcyBrZXlvZiBUID0ga2V5b2YgVD4gPSBQaWNrPFQsIEV4Y2x1ZGU8a2V5b2YgVCwgS2V5cz4+ICZcbiAge1xuICAgIFtLIGluIEtleXNdLT86IFJlcXVpcmVkPFBpY2s8VCwgSz4+ICYgUGFydGlhbDxQaWNrPFQsIEV4Y2x1ZGU8S2V5cywgSz4+PjtcbiAgfVtLZXlzXTtcblxuLyoqIFZlcmlmeSB0aGF0IGFuIHR5cGUgX0NvcHkgZXh0ZW5kcyBfT3JpZyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRXh0ZW5kczxfT3JpZywgX0NvcHkgZXh0ZW5kcyBfT3JpZz4oKTogdm9pZCB7XG4gIC8vIG5vb3AsIGp1c3QgdHlwZSBjaGVja1xufVxuXG5leHBvcnQgdHlwZSBSZXBsYWNlPEJhc2UsIE5ldz4gPSBPbWl0PEJhc2UsIGtleW9mIE5ldz4gJiBOZXc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlY29yZCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eTxYIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oXG4gIHJlY29yZDogWCxcbiAgcHJvcDogWVxuKTogcmVjb3JkIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xuICByZXR1cm4gcHJvcCBpbiByZWNvcmQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0aWVzPFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wczogWVtdXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wcy5ldmVyeSgocHJvcCkgPT4gcHJvcCBpbiByZWNvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yIHtcbiAgcmV0dXJuIChcbiAgICBpc1JlY29yZChlcnJvcikgJiZcbiAgICB0eXBlb2YgZXJyb3IubmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAoZXJyb3Iuc3RhY2sgPT0gbnVsbCB8fCB0eXBlb2YgZXJyb3Iuc3RhY2sgPT09ICdzdHJpbmcnKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBYm9ydEVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3IgJiB7IG5hbWU6ICdBYm9ydEVycm9yJyB9IHtcbiAgcmV0dXJuIGlzRXJyb3IoZXJyb3IpICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yKGVycm9yKSkge1xuICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIEVycm9yV2l0aENvZGUge1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3JXaXRoQ29kZShlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yV2l0aENvZGUge1xuICByZXR1cm4gaXNSZWNvcmQoZXJyb3IpICYmIHR5cGVvZiBlcnJvci5jb2RlID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yV2l0aENvZGUoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLmNvZGU7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCBzb21lIHR5cGUgaXMgdGhlIG5ldmVyIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKG1zZzogc3RyaW5nLCB4OiBuZXZlcik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cgKyAnOiAnICsgeCk7XG59XG5cbmV4cG9ydCB0eXBlIENsYXNzPEUgZXh0ZW5kcyBFcnJvcj4gPSB7XG4gIG5ldyAoLi4uYXJnczogYW55W10pOiBFO1xuICBwcm90b3R5cGU6IEU7XG59O1xuXG4vKipcbiAqIEEgZGVjb3JhdG9yIHRvIGJlIHVzZWQgb24gZXJyb3IgY2xhc3Nlcy4gSXQgYWRkcyB0aGUgJ25hbWUnIHByb3BlcnR5IEFORCBwcm92aWRlcyBhIGN1c3RvbVxuICogJ2luc3RhbmNlb2YnIGhhbmRsZXIgdGhhdCB3b3JrcyBjb3JyZWN0bHkgYWNyb3NzIGV4ZWN1dGlvbiBjb250ZXh0cy5cbiAqXG4gKiAjIyMgRGV0YWlscyAjIyNcbiAqXG4gKiBBY2NvcmRpbmcgdG8gdGhlIEVjbWFTY3JpcHQncyBzcGVjLCB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiBKYXZhU2NyaXB0J3MgYHggaW5zdGFuY2VvZiBZYCBvcGVyYXRvciBpcyB0byB3YWxrIHVwIHRoZVxuICogcHJvdG90eXBlIGNoYWluIG9mIG9iamVjdCAneCcsIGNoZWNraW5nIGlmIGFueSBjb25zdHJ1Y3RvciBpbiB0aGF0IGhpZXJhcmNoeSBpcyBfZXhhY3RseSB0aGUgc2FtZSBvYmplY3RfIGFzIHRoZVxuICogY29uc3RydWN0b3IgZnVuY3Rpb24gJ1knLlxuICpcbiAqIFVuZm9ydHVuYXRlbHksIGl0IGhhcHBlbnMgaW4gdmFyaW91cyBzaXR1YXRpb25zIHRoYXQgZGlmZmVyZW50IGNvbnN0cnVjdG9yIGZ1bmN0aW9uIG9iamVjdHMgZ2V0IGNyZWF0ZWQgZm9yIHdoYXRcbiAqIGFwcGVhcnMgdG8gYmUgdGhlIHZlcnkgc2FtZSBjbGFzcy4gVGhpcyBsZWFkcyB0byBzdXJwcmlzaW5nIGJlaGF2aW9yIHdoZXJlIGBpbnN0YW5jZW9mYCByZXR1cm5zIGZhbHNlIHRob3VnaCBpdCBpc1xuICoga25vd24gdGhhdCB0aGUgb2JqZWN0IGlzIGluZGVlZCBhbiBpbnN0YW5jZSBvZiB0aGF0IGNsYXNzLiBPbmUgcGFydGljdWxhciBjYXNlIHdoZXJlIHRoaXMgaGFwcGVucyBpcyB3aGVuIGNvbnN0cnVjdG9yXG4gKiAnWScgYmVsb25ncyB0byBhIGRpZmZlcmVudCByZWFsbSB0aGFuIHRoZSBjb25zdHVjdG9yIHdpdGggd2hpY2ggJ3gnIHdhcyBpbnN0YW50aWF0ZWQuIEFub3RoZXIgY2FzZSBpcyB3aGVuIHR3byBjb3BpZXNcbiAqIG9mIHRoZSBzYW1lIGxpYnJhcnkgZ2V0cyBsb2FkZWQgaW4gdGhlIHNhbWUgcmVhbG0uXG4gKlxuICogSW4gcHJhY3RpY2UsIHRoaXMgdGVuZHMgdG8gY2F1c2UgaXNzdWVzIHdoZW4gY3Jvc3NpbmcgdGhlIHdvcmtmbG93LXNhbmRib3hpbmcgYm91bmRhcnkgKHNpbmNlIE5vZGUncyB2bSBtb2R1bGVcbiAqIHJlYWxseSBjcmVhdGVzIG5ldyBleGVjdXRpb24gcmVhbG1zKSwgYXMgd2VsbCBhcyB3aGVuIHJ1bm5pbmcgdGVzdHMgdXNpbmcgSmVzdCAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXN0anMvamVzdC9pc3N1ZXMvMjU0OVxuICogZm9yIHNvbWUgZGV0YWlscyBvbiB0aGF0IG9uZSkuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpbmplY3RzIGEgY3VzdG9tICdpbnN0YW5jZW9mJyBoYW5kbGVyIGludG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCB3aGljaCBpcyBib3RoIGNyb3NzLXJlYWxtIHNhZmUgYW5kXG4gKiBjcm9zcy1jb3BpZXMtb2YtdGhlLXNhbWUtbGliIHNhZmUuIEl0IHdvcmtzIGJ5IGFkZGluZyBhIHNwZWNpYWwgc3ltYm9sIHByb3BlcnR5IHRvIHRoZSBwcm90b3R5cGUgb2YgJ2NsYXp6JywgYW5kIHRoZW5cbiAqIGNoZWNraW5nIGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhhdCBzeW1ib2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcjxFIGV4dGVuZHMgRXJyb3I+KG1hcmtlck5hbWU6IHN0cmluZyk6IChjbGF6ejogQ2xhc3M8RT4pID0+IHZvaWQge1xuICByZXR1cm4gKGNsYXp6OiBDbGFzczxFPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG1hcmtlciA9IFN5bWJvbC5mb3IoYF9fdGVtcG9yYWxfaXMke21hcmtlck5hbWV9YCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCAnbmFtZScsIHsgdmFsdWU6IG1hcmtlck5hbWUsIGVudW1lcmFibGU6IHRydWUgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LnByb3RvdHlwZSwgbWFya2VyLCB7IHZhbHVlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenosIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG9iamVjdC1zaG9ydGhhbmRcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiAodGhpczogYW55LCBlcnJvcjogb2JqZWN0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzID09PSBjbGF6eikge1xuICAgICAgICAgIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgKGVycm9yIGFzIGFueSlbbWFya2VyXSA9PT0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAndGhpcycgbXVzdCBiZSBhIF9zdWJjbGFzc18gb2YgY2xhenogdGhhdCBkb2Vzbid0IHJlZGVmaW5lZCBbU3ltYm9sLmhhc0luc3RhbmNlXSwgc28gdGhhdCBpdCBpbmhlcml0ZWRcbiAgICAgICAgICAvLyBmcm9tIGNsYXp6J3MgW1N5bWJvbC5oYXNJbnN0YW5jZV0uIElmIHdlIGRvbid0IGhhbmRsZSB0aGlzIHBhcnRpY3VsYXIgc2l0dWF0aW9uLCB0aGVuXG4gICAgICAgICAgLy8gYHggaW5zdGFuY2VvZiBTdWJjbGFzc09mUGFyZW50YCB3b3VsZCByZXR1cm4gdHJ1ZSBmb3IgYW55IGluc3RhbmNlIG9mICdQYXJlbnQnLCB3aGljaCBpcyBjbGVhcmx5IHdyb25nLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSWRlYWxseSwgaXQnZCBiZSBwcmVmZXJhYmxlIHRvIGF2b2lkIHRoaXMgY2FzZSBlbnRpcmVseSwgYnkgbWFraW5nIHN1cmUgdGhhdCBhbGwgc3ViY2xhc3NlcyBvZiAnY2xhenonXG4gICAgICAgICAgLy8gcmVkZWZpbmUgW1N5bWJvbC5oYXNJbnN0YW5jZV0sIGJ1dCB3ZSBjYW4ndCBlbmZvcmNlIHRoYXQuIFdlIHRoZXJlZm9yZSBmYWxsYmFjayB0byB0aGUgZGVmYXVsdCBpbnN0YW5jZW9mXG4gICAgICAgICAgLy8gYmVoYXZpb3IgKHdoaWNoIGlzIE5PVCBjcm9zcy1yZWFsbSBzYWZlKS5cbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihlcnJvcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG59XG5cbi8vIFRoYW5rcyBNRE46IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9mcmVlemVcbmV4cG9ydCBmdW5jdGlvbiBkZWVwRnJlZXplPFQ+KG9iamVjdDogVCk6IFQge1xuICAvLyBSZXRyaWV2ZSB0aGUgcHJvcGVydHkgbmFtZXMgZGVmaW5lZCBvbiBvYmplY3RcbiAgY29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcblxuICAvLyBGcmVlemUgcHJvcGVydGllcyBiZWZvcmUgZnJlZXppbmcgc2VsZlxuICBmb3IgKGNvbnN0IG5hbWUgb2YgcHJvcE5hbWVzKSB7XG4gICAgY29uc3QgdmFsdWUgPSAob2JqZWN0IGFzIGFueSlbbmFtZV07XG5cbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZyZWV6ZSh2YWx1ZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBva2F5LCB0aGVyZSBhcmUgc29tZSB0eXBlZCBhcnJheXMgdGhhdCBjYW5ub3QgYmUgZnJvemVuIChlbmNvZGluZ0tleXMpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIE9iamVjdC5mcmVlemUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKG9iamVjdCk7XG59XG4iLCJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgdHlwZSB7IFZlcnNpb25pbmdJbnRlbnQgYXMgVmVyc2lvbmluZ0ludGVudFN0cmluZyB9IGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIsIGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnRcbi8qKlxuICogUHJvdG9idWYgZW51bSByZXByZXNlbnRhdGlvbiBvZiB7QGxpbmsgVmVyc2lvbmluZ0ludGVudFN0cmluZ30uXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZW51bSBWZXJzaW9uaW5nSW50ZW50IHtcbiAgVU5TUEVDSUZJRUQgPSAwLFxuICBDT01QQVRJQkxFID0gMSxcbiAgREVGQVVMVCA9IDIsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50LCBWZXJzaW9uaW5nSW50ZW50PigpO1xuY2hlY2tFeHRlbmRzPFZlcnNpb25pbmdJbnRlbnQsIGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhpbnRlbnQ6IFZlcnNpb25pbmdJbnRlbnRTdHJpbmcgfCB1bmRlZmluZWQpOiBWZXJzaW9uaW5nSW50ZW50IHtcbiAgc3dpdGNoIChpbnRlbnQpIHtcbiAgICBjYXNlICdERUZBVUxUJzpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LkRFRkFVTFQ7XG4gICAgY2FzZSAnQ09NUEFUSUJMRSc6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5DT01QQVRJQkxFO1xuICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuVU5TUEVDSUZJRUQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydE5ldmVyKCdVbmV4cGVjdGVkIFZlcnNpb25pbmdJbnRlbnQnLCBpbnRlbnQpO1xuICB9XG59XG4iLCIvKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSB1c2VyIGludGVuZHMgY2VydGFpbiBjb21tYW5kcyB0byBiZSBydW4gb24gYSBjb21wYXRpYmxlIHdvcmtlciBCdWlsZCBJZCB2ZXJzaW9uIG9yIG5vdC5cbiAqXG4gKiBgQ09NUEFUSUJMRWAgaW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgc2hvdWxkIHJ1biBvbiBhIHdvcmtlciB3aXRoIGNvbXBhdGlibGUgdmVyc2lvbiBpZiBwb3NzaWJsZS4gSXQgbWF5IG5vdCBiZVxuICogcG9zc2libGUgaWYgdGhlIHRhcmdldCB0YXNrIHF1ZXVlIGRvZXMgbm90IGFsc28gaGF2ZSBrbm93bGVkZ2Ugb2YgdGhlIGN1cnJlbnQgd29ya2VyJ3MgQnVpbGQgSWQuXG4gKlxuICogYERFRkFVTFRgIGluZGljYXRlcyB0aGF0IHRoZSBjb21tYW5kIHNob3VsZCBydW4gb24gdGhlIHRhcmdldCB0YXNrIHF1ZXVlJ3MgY3VycmVudCBvdmVyYWxsLWRlZmF1bHQgQnVpbGQgSWQuXG4gKlxuICogV2hlcmUgdGhpcyB0eXBlIGlzIGFjY2VwdGVkIG9wdGlvbmFsbHksIGFuIHVuc2V0IHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZSBTREsgc2hvdWxkIGNob29zZSB0aGUgbW9zdCBzZW5zaWJsZSBkZWZhdWx0XG4gKiBiZWhhdmlvciBmb3IgdGhlIHR5cGUgb2YgY29tbWFuZCwgYWNjb3VudGluZyBmb3Igd2hldGhlciB0aGUgY29tbWFuZCB3aWxsIGJlIHJ1biBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIHRoZVxuICogY3VycmVudCB3b3JrZXIuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGZvciBzdGFydGluZyBXb3JrZmxvd3MgaXMgYERFRkFVTFRgLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBmb3IgV29ya2Zsb3dzIHN0YXJ0aW5nXG4gKiBBY3Rpdml0aWVzLCBzdGFydGluZyBDaGlsZCBXb3JrZmxvd3MsIG9yIENvbnRpbnVpbmcgQXMgTmV3IGlzIGBDT01QQVRJQkxFYC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCB0eXBlIFZlcnNpb25pbmdJbnRlbnQgPSAnQ09NUEFUSUJMRScgfCAnREVGQVVMVCc7XG4iLCJpbXBvcnQgeyBXb3JrZmxvdywgV29ya2Zsb3dSZXN1bHRUeXBlLCBTaWduYWxEZWZpbml0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBCYXNlIFdvcmtmbG93SGFuZGxlIGludGVyZmFjZSwgZXh0ZW5kZWQgaW4gd29ya2Zsb3cgYW5kIGNsaWVudCBsaWJzLlxuICpcbiAqIFRyYW5zZm9ybXMgYSB3b3JrZmxvdyBpbnRlcmZhY2UgYFRgIGludG8gYSBjbGllbnQgaW50ZXJmYWNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VXb3JrZmxvd0hhbmRsZTxUIGV4dGVuZHMgV29ya2Zsb3c+IHtcbiAgLyoqXG4gICAqIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIFdvcmtmbG93IGV4ZWN1dGlvbiBjb21wbGV0ZXNcbiAgICovXG4gIHJlc3VsdCgpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbiAgLyoqXG4gICAqIFNpZ25hbCBhIHJ1bm5pbmcgV29ya2Zsb3cuXG4gICAqXG4gICAqIEBwYXJhbSBkZWYgYSBzaWduYWwgZGVmaW5pdGlvbiBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGF3YWl0IGhhbmRsZS5zaWduYWwoaW5jcmVtZW50U2lnbmFsLCAzKTtcbiAgICogYGBgXG4gICAqL1xuICBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICAgIGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPiB8IHN0cmluZyxcbiAgICAuLi5hcmdzOiBBcmdzXG4gICk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIFRoZSB3b3JrZmxvd0lkIG9mIHRoZSBjdXJyZW50IFdvcmtmbG93XG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmc7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgU2VhcmNoQXR0cmlidXRlcywgV29ya2Zsb3cgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgUmV0cnlQb2xpY3kgfSBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5XG4vKipcbiAqIENvbmNlcHQ6IHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXdvcmtmbG93LWlkLXJldXNlLXBvbGljeS8gfCBXb3JrZmxvdyBJZCBSZXVzZSBQb2xpY3l9XG4gKlxuICogV2hldGhlciBhIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIENsb3NlZCBXb3JrZmxvdy5cbiAqXG4gKiAqTm90ZTogQSBXb3JrZmxvdyBjYW4gbmV2ZXIgYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBSdW5uaW5nIFdvcmtmbG93LipcbiAqL1xuZXhwb3J0IGVudW0gV29ya2Zsb3dJZFJldXNlUG9saWN5IHtcbiAgLyoqXG4gICAqIE5vIG5lZWQgdG8gdXNlIHRoaXMuXG4gICAqXG4gICAqIChJZiBhIGBXb3JrZmxvd0lkUmV1c2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLilcbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9VTlNQRUNJRklFRCA9IDAsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUuXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFID0gMSxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZSB0aGF0IGlzIG5vdCBDb21wbGV0ZWQuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZID0gMixcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbm5vdCBiZSBzdGFydGVkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1JFSkVDVF9EVVBMSUNBVEUgPSAzLFxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGUgdGhlIGN1cnJlbnQgd29ya2Zsb3cgaWYgb25lIGlzIGFscmVhZHkgcnVubmluZy5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9URVJNSU5BVEVfSUZfUlVOTklORyA9IDQsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5LCBXb3JrZmxvd0lkUmV1c2VQb2xpY3k+KCk7XG5jaGVja0V4dGVuZHM8V29ya2Zsb3dJZFJldXNlUG9saWN5LCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5PigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VXb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV2hldGhlciBhIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIENsb3NlZCBXb3JrZmxvdy5cbiAgICpcbiAgICogKk5vdGU6IEEgV29ya2Zsb3cgY2FuIG5ldmVyIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgUnVubmluZyBXb3JrZmxvdy4qXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBXb3JrZmxvd0lkUmV1c2VQb2xpY3kuV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURX1cbiAgICovXG4gIHdvcmtmbG93SWRSZXVzZVBvbGljeT86IFdvcmtmbG93SWRSZXVzZVBvbGljeTtcblxuICAvKipcbiAgICogQ29udHJvbHMgaG93IGEgV29ya2Zsb3cgRXhlY3V0aW9uIGlzIHJldHJpZWQuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIFdvcmtmbG93IEV4ZWN1dGlvbnMgYXJlIG5vdCByZXRyaWVkLiBEbyBub3Qgb3ZlcnJpZGUgdGhpcyBiZWhhdmlvciB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuXG4gICAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXJldHJ5LXBvbGljeS8gfCBNb3JlIGluZm9ybWF0aW9ufS5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE9wdGlvbmFsIGNyb24gc2NoZWR1bGUgZm9yIFdvcmtmbG93LiBJZiBhIGNyb24gc2NoZWR1bGUgaXMgc3BlY2lmaWVkLCB0aGUgV29ya2Zsb3cgd2lsbCBydW4gYXMgYSBjcm9uIGJhc2VkIG9uIHRoZVxuICAgKiBzY2hlZHVsZS4gVGhlIHNjaGVkdWxpbmcgd2lsbCBiZSBiYXNlZCBvbiBVVEMgdGltZS4gVGhlIHNjaGVkdWxlIGZvciB0aGUgbmV4dCBydW4gb25seSBoYXBwZW5zIGFmdGVyIHRoZSBjdXJyZW50XG4gICAqIHJ1biBpcyBjb21wbGV0ZWQvZmFpbGVkL3RpbWVvdXQuIElmIGEgUmV0cnlQb2xpY3kgaXMgYWxzbyBzdXBwbGllZCwgYW5kIHRoZSBXb3JrZmxvdyBmYWlsZWQgb3IgdGltZWQgb3V0LCB0aGVcbiAgICogV29ya2Zsb3cgd2lsbCBiZSByZXRyaWVkIGJhc2VkIG9uIHRoZSByZXRyeSBwb2xpY3kuIFdoaWxlIHRoZSBXb3JrZmxvdyBpcyByZXRyeWluZywgaXQgd29uJ3Qgc2NoZWR1bGUgaXRzIG5leHQgcnVuLlxuICAgKiBJZiB0aGUgbmV4dCBzY2hlZHVsZSBpcyBkdWUgd2hpbGUgdGhlIFdvcmtmbG93IGlzIHJ1bm5pbmcgKG9yIHJldHJ5aW5nKSwgdGhlbiBpdCB3aWxsIHNraXAgdGhhdCBzY2hlZHVsZS4gQ3JvblxuICAgKiBXb3JrZmxvdyB3aWxsIG5vdCBzdG9wIHVudGlsIGl0IGlzIHRlcm1pbmF0ZWQgb3IgY2FuY2VsbGVkIChieSByZXR1cm5pbmcgdGVtcG9yYWwuQ2FuY2VsZWRFcnJvcikuXG4gICAqIGh0dHBzOi8vY3JvbnRhYi5ndXJ1LyBpcyB1c2VmdWwgZm9yIHRlc3RpbmcgeW91ciBjcm9uIGV4cHJlc3Npb25zLlxuICAgKi9cbiAgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYWRkaXRpb25hbCBub24taW5kZXhlZCBpbmZvcm1hdGlvbiB0byBhdHRhY2ggdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvbi4gVGhlIHZhbHVlcyBjYW4gYmUgYW55dGhpbmcgdGhhdFxuICAgKiBpcyBzZXJpYWxpemFibGUgYnkge0BsaW5rIERhdGFDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYWRkaXRpb25hbCBpbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBNb3JlIGluZm86XG4gICAqIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9kb2NzL3R5cGVzY3JpcHQvc2VhcmNoLWF0dHJpYnV0ZXNcbiAgICpcbiAgICogVmFsdWVzIGFyZSBhbHdheXMgY29udmVydGVkIHVzaW5nIHtAbGluayBKc29uUGF5bG9hZENvbnZlcnRlcn0sIGV2ZW4gd2hlbiBhIGN1c3RvbSBkYXRhIGNvbnZlcnRlciBpcyBwcm92aWRlZC5cbiAgICovXG4gIHNlYXJjaEF0dHJpYnV0ZXM/OiBTZWFyY2hBdHRyaWJ1dGVzO1xufVxuXG5leHBvcnQgdHlwZSBXaXRoV29ya2Zsb3dBcmdzPFcgZXh0ZW5kcyBXb3JrZmxvdywgVD4gPSBUICZcbiAgKFBhcmFtZXRlcnM8Vz4gZXh0ZW5kcyBbYW55LCAuLi5hbnlbXV1cbiAgICA/IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBXb3JrZmxvd1xuICAgICAgICAgKi9cbiAgICAgICAgYXJnczogUGFyYW1ldGVyczxXPiB8IFJlYWRvbmx5PFBhcmFtZXRlcnM8Vz4+O1xuICAgICAgfVxuICAgIDoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzPzogUGFyYW1ldGVyczxXPiB8IFJlYWRvbmx5PFBhcmFtZXRlcnM8Vz4+O1xuICAgICAgfSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgcnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3RcbiAgICogcmVseSBvbiBydW4gdGltZW91dCBmb3IgYnVzaW5lc3MgbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzXG4gICAqIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqXG4gICAqIFRoZSB0aW1lIGFmdGVyIHdoaWNoIHdvcmtmbG93IGV4ZWN1dGlvbiAod2hpY2ggaW5jbHVkZXMgcnVuIHJldHJpZXMgYW5kIGNvbnRpbnVlIGFzIG5ldykgaXNcbiAgICogYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdCByZWx5IG9uIGV4ZWN1dGlvbiB0aW1lb3V0IGZvciBidXNpbmVzc1xuICAgKiBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnMgZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTWF4aW11bSBleGVjdXRpb24gdGltZSBvZiBhIHNpbmdsZSB3b3JrZmxvdyB0YXNrLiBEZWZhdWx0IGlzIDEwIHNlY29uZHMuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IER1cmF0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBDb21tb25Xb3JrZmxvd09wdGlvbnMgPSBCYXNlV29ya2Zsb3dPcHRpb25zICYgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnM7XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0V29ya2Zsb3dUeXBlPFQgZXh0ZW5kcyBXb3JrZmxvdz4od29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBUKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmMgPT09ICdzdHJpbmcnKSByZXR1cm4gd29ya2Zsb3dUeXBlT3JGdW5jIGFzIHN0cmluZztcbiAgaWYgKHR5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAod29ya2Zsb3dUeXBlT3JGdW5jPy5uYW1lKSByZXR1cm4gd29ya2Zsb3dUeXBlT3JGdW5jLm5hbWU7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB3b3JrZmxvdyB0eXBlOiB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gaXMgYW5vbnltb3VzJyk7XG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICBgSW52YWxpZCB3b3JrZmxvdyB0eXBlOiBleHBlY3RlZCBlaXRoZXIgYSBzdHJpbmcgb3IgYSBmdW5jdGlvbiwgZ290ICcke3R5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmN9J2BcbiAgKTtcbn1cbiIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyBUYWtlbiBhbmQgbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUvc2VlZHJhbmRvbS9ibG9iL3JlbGVhc2VkL2xpYi9hbGVhLmpzXG5cbmNsYXNzIEFsZWEge1xuICBwdWJsaWMgYzogbnVtYmVyO1xuICBwdWJsaWMgczA6IG51bWJlcjtcbiAgcHVibGljIHMxOiBudW1iZXI7XG4gIHB1YmxpYyBzMjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNlZWQ6IG51bWJlcltdKSB7XG4gICAgY29uc3QgbWFzaCA9IG5ldyBNYXNoKCk7XG4gICAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICAgIHRoaXMuYyA9IDE7XG4gICAgdGhpcy5zMCA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMxID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczIgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMCAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczAgPCAwKSB7XG4gICAgICB0aGlzLnMwICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczEgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMxIDwgMCkge1xuICAgICAgdGhpcy5zMSArPSAxO1xuICAgIH1cbiAgICB0aGlzLnMyIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMiA8IDApIHtcbiAgICAgIHRoaXMuczIgKz0gMTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbmV4dCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHQgPSAyMDkxNjM5ICogdGhpcy5zMCArIHRoaXMuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgdGhpcy5zMCA9IHRoaXMuczE7XG4gICAgdGhpcy5zMSA9IHRoaXMuczI7XG4gICAgcmV0dXJuICh0aGlzLnMyID0gdCAtICh0aGlzLmMgPSB0IHwgMCkpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJORyA9ICgpID0+IG51bWJlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFsZWEoc2VlZDogbnVtYmVyW10pOiBSTkcge1xuICBjb25zdCB4ZyA9IG5ldyBBbGVhKHNlZWQpO1xuICByZXR1cm4geGcubmV4dC5iaW5kKHhnKTtcbn1cblxuZXhwb3J0IGNsYXNzIE1hc2gge1xuICBwcml2YXRlIG4gPSAweGVmYzgyNDlkO1xuXG4gIHB1YmxpYyBtYXNoKGRhdGE6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgICBsZXQgeyBuIH0gPSB0aGlzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhW2ldO1xuICAgICAgbGV0IGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICB0aGlzLm4gPSBuO1xuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IEFzeW5jTG9jYWxTdG9yYWdlIGFzIEFMUyB9IGZyb20gJ25vZGU6YXN5bmNfaG9va3MnO1xuaW1wb3J0IHsgQ2FuY2VsbGVkRmFpbHVyZSwgRHVyYXRpb24sIElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IG1zT3B0aW9uYWxUb051bWJlciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IFNka0ZsYWdzIH0gZnJvbSAnLi9mbGFncyc7XG5cbi8vIEFzeW5jTG9jYWxTdG9yYWdlIGlzIGluamVjdGVkIHZpYSB2bSBtb2R1bGUgaW50byBnbG9iYWwgc2NvcGUuXG4vLyBJbiBjYXNlIFdvcmtmbG93IGNvZGUgaXMgaW1wb3J0ZWQgaW4gTm9kZS5qcyBjb250ZXh0LCByZXBsYWNlIHdpdGggYW4gZW1wdHkgY2xhc3MuXG5leHBvcnQgY29uc3QgQXN5bmNMb2NhbFN0b3JhZ2U6IG5ldyA8VD4oKSA9PiBBTFM8VD4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLkFzeW5jTG9jYWxTdG9yYWdlID8/IGNsYXNzIHt9O1xuXG4vKiogTWFnaWMgc3ltYm9sIHVzZWQgdG8gY3JlYXRlIHRoZSByb290IHNjb3BlIC0gaW50ZW50aW9uYWxseSBub3QgZXhwb3J0ZWQgKi9cbmNvbnN0IE5PX1BBUkVOVCA9IFN5bWJvbCgnTk9fUEFSRU5UJyk7XG5cbi8qKlxuICogT3B0aW9uIGZvciBjb25zdHJ1Y3RpbmcgYSBDYW5jZWxsYXRpb25TY29wZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjb3BlIGNhbmNlbGxhdGlvbiBpcyBhdXRvbWF0aWNhbGx5IHJlcXVlc3RlZFxuICAgKi9cbiAgdGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgcHJldmVudCBvdXRlciBjYW5jZWxsYXRpb24gZnJvbSBwcm9wYWdhdGluZyB0byBpbm5lciBzY29wZXMsIEFjdGl2aXRpZXMsIHRpbWVycywgYW5kIFRyaWdnZXJzLCBkZWZhdWx0cyB0byB0cnVlLlxuICAgKiAoU2NvcGUgc3RpbGwgcHJvcGFnYXRlcyBDYW5jZWxsZWRGYWlsdXJlIHRocm93biBmcm9tIHdpdGhpbikuXG4gICAqL1xuICBjYW5jZWxsYWJsZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcykuXG4gICAqIFRoZSBgTk9fUEFSRU5UYCBzeW1ib2wgaXMgcmVzZXJ2ZWQgZm9yIHRoZSByb290IHNjb3BlLlxuICAgKi9cbiAgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGUgfCB0eXBlb2YgTk9fUEFSRU5UO1xufVxuXG4vKipcbiAqIENhbmNlbGxhdGlvbiBTY29wZXMgcHJvdmlkZSB0aGUgbWVjaGFuaWMgYnkgd2hpY2ggYSBXb3JrZmxvdyBtYXkgZ3JhY2VmdWxseSBoYW5kbGUgaW5jb21pbmcgcmVxdWVzdHMgZm9yIGNhbmNlbGxhdGlvblxuICogKGUuZy4gaW4gcmVzcG9uc2UgdG8ge0BsaW5rIFdvcmtmbG93SGFuZGxlLmNhbmNlbH0gb3IgdGhyb3VnaCB0aGUgVUkgb3IgQ0xJKSwgYXMgd2VsbCBhcyByZXF1ZXN0IGNhbmNlbGF0aW9uIG9mXG4gKiBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGl0IG93bnMgKGUuZy4gQWN0aXZpdGllcywgVGltZXJzLCBDaGlsZCBXb3JrZmxvd3MsIGV0YykuXG4gKlxuICogQ2FuY2VsbGF0aW9uIFNjb3BlcyBmb3JtIGEgdHJlZSwgd2l0aCB0aGUgV29ya2Zsb3cncyBtYWluIGZ1bmN0aW9uIHJ1bm5pbmcgaW4gdGhlIHJvb3Qgc2NvcGUgb2YgdGhhdCB0cmVlLlxuICogQnkgZGVmYXVsdCwgY2FuY2VsbGF0aW9uIHByb3BhZ2F0ZXMgZG93biBmcm9tIGEgcGFyZW50IHNjb3BlIHRvIGl0cyBjaGlsZHJlbiBhbmQgaXRzIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMuXG4gKiBBIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBjYW4gcmVjZWl2ZSBjYW5jZWxsYXRpb24gcmVxdWVzdHMsIGJ1dCBpcyBuZXZlciBlZmZlY3RpdmVseSBjb25zaWRlcmVkIGFzIGNhbmNlbGxlZCxcbiAqIHRodXMgc2hpZWxkZGluZyBpdHMgY2hpbGRyZW4gYW5kIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgZnJvbSBwcm9wYWdhdGlvbiBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgaXQgcmVjZWl2ZXMuXG4gKlxuICogU2NvcGVzIGFyZSBjcmVhdGVkIHVzaW5nIHRoZSBgQ2FuY2VsbGF0aW9uU2NvcGVgIGNvbnN0cnVjdG9yIG9yIHRoZSBzdGF0aWMgaGVscGVyIG1ldGhvZHMge0BsaW5rIGNhbmNlbGxhYmxlfSxcbiAqIHtAbGluayBub25DYW5jZWxsYWJsZX0gYW5kIHtAbGluayB3aXRoVGltZW91dH0uIGB3aXRoVGltZW91dGAgY3JlYXRlcyBhIHNjb3BlIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIGl0c2VsZiBhZnRlclxuICogc29tZSBkdXJhdGlvbi5cbiAqXG4gKiBDYW5jZWxsYXRpb24gb2YgYSBjYW5jZWxsYWJsZSBzY29wZSByZXN1bHRzIGluIGFsbCBvcGVyYXRpb25zIGNyZWF0ZWQgZGlyZWN0bHkgaW4gdGhhdCBzY29wZSB0byB0aHJvdyBhXG4gKiB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX0gKGVpdGhlciBkaXJlY3RseSwgb3IgYXMgdGhlIGBjYXVzZWAgb2YgYW4ge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gb3IgYVxuICoge0BsaW5rIENoaWxkV29ya2Zsb3dGYWlsdXJlfSkuIEZ1cnRoZXIgYXR0ZW1wdCB0byBjcmVhdGUgbmV3IGNhbmNlbGxhYmxlIHNjb3BlcyBvciBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIHdpdGhpbiBhXG4gKiBzY29wZSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY2FuY2VsbGVkIHdpbGwgYWxzbyBpbW1lZGlhdGVseSB0aHJvdyBhIHtAbGluayBDYW5jZWxsZWRGYWlsdXJlfSBleGNlcHRpb24uIEl0IGlzIGhvd2V2ZXJcbiAqIHBvc3NpYmxlIHRvIGNyZWF0ZSBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBhdCB0aGF0IHBvaW50OyB0aGlzIGlzIG9mdGVuIHVzZWQgdG8gZXhlY3V0ZSByb2xsYmFjayBvciBjbGVhbnVwXG4gKiBvcGVyYXRpb25zLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyguLi4pOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgdHJ5IHtcbiAqICAgICAvLyBUaGlzIGFjdGl2aXR5IHJ1bnMgaW4gdGhlIHJvb3QgY2FuY2VsbGF0aW9uIHNjb3BlLiBUaGVyZWZvcmUsIGEgY2FuY2VsYXRpb24gcmVxdWVzdCBvblxuICogICAgIC8vIHRoZSBXb3JrZmxvdyBleGVjdXRpb24gKGUuZy4gdGhyb3VnaCB0aGUgVUkgb3IgQ0xJKSBhdXRvbWF0aWNhbGx5IHByb3BhZ2F0ZXMgdG8gdGhpc1xuICogICAgIC8vIGFjdGl2aXR5LiBBc3N1bWluZyB0aGF0IHRoZSBhY3Rpdml0eSBwcm9wZXJseSBoYW5kbGUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCB0aGVuIHRoZVxuICogICAgIC8vIGNhbGwgYmVsb3cgd2lsbCB0aHJvdyBhbiBgQWN0aXZpdHlGYWlsdXJlYCBleGNlcHRpb24sIHdpdGggYGNhdXNlYCBzZXRzIHRvIGFuXG4gKiAgICAgLy8gaW5zdGFuY2Ugb2YgYENhbmNlbGxlZEZhaWx1cmVgLlxuICogICAgIGF3YWl0IHNvbWVBY3Rpdml0eSgpO1xuICogICB9IGNhdGNoIChlKSB7XG4gKiAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGUpKSB7XG4gKiAgICAgICAvLyBSdW4gY2xlYW51cCBhY3Rpdml0eSBpbiBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZVxuICogICAgICAgYXdhaXQgQ2FuY2VsbGF0aW9uU2NvcGUubm9uQ2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICogICAgICAgICBhd2FpdCBjbGVhbnVwQWN0aXZpdHkoKTtcbiAqICAgICAgIH1cbiAqICAgICB9IGVsc2Uge1xuICogICAgICAgdGhyb3cgZTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgY2FuY2VsbGFibGUgc2NvcGUgbWF5IGJlIHByb2dyYW1hdGljYWxseSBjYW5jZWxsZWQgYnkgY2FsbGluZyB7QGxpbmsgY2FuY2VsfGBzY29wZS5jYW5jZWwoKWB9YC4gVGhpcyBtYXkgYmUgdXNlZCxcbiAqIGZvciBleGFtcGxlLCB0byBleHBsaWNpdGx5IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIEFjdGl2aXR5IG9yIENoaWxkIFdvcmtmbG93OlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoKTtcbiAqIGNvbnN0IGFjdGl2aXR5UHJvbWlzZSA9IGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZS5ydW4oKCkgPT4gc29tZUFjdGl2aXR5KCkpO1xuICogY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlLmNhbmNlbCgpOyAvLyBDYW5jZWxzIHRoZSBhY3Rpdml0eVxuICogYXdhaXQgYWN0aXZpdHlQcm9taXNlOyAvLyBUaHJvd3MgYEFjdGl2aXR5RmFpbHVyZWAgd2l0aCBgY2F1c2VgIHNldCB0byBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSB0aW1lb3V0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgdGhlbiB0aGlzIHNjb3BlIHdpbGwgbmV2ZXIgYmUgY29uc2lkZXJlZCBjYW5jZWxsZWQsIGV2ZW4gaWYgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBpcyByZWNlaXZlZCAoZWl0aGVyXG4gICAqIGRpcmVjdGx5IGJ5IGNhbGxpbmcgYHNjb3BlLmNhbmNlbCgpYCBvciBpbmRpcmVjdGx5IGJ5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBwYXJlbnQgc2NvcGUpLiBUaGlzIGVmZmVjdGl2ZWx5XG4gICAqIHNoaWVsZHMgdGhlIHNjb3BlJ3MgY2hpbGRyZW4gYW5kIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgZnJvbSBwcm9wYWdhdGlvbiBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgbWFkZSBvbiB0aGVcbiAgICogbm9uLWNhbmNlbGxhYmxlIHNjb3BlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhlIFByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGBydW5gIGZ1bmN0aW9uIG9mIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBtYXkgc3RpbGwgdGhyb3cgYSBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAgICogaWYgc3VjaCBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gd2l0aGluIHRoYXQgc2NvcGUgKGUuZy4gYnkgZGlyZWN0bHkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIGNoaWxkIHNjb3BlKS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxsYWJsZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKSwgZGVmYXVsdHMgdG8ge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnR9KClcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZTtcblxuICAvKipcbiAgICogQSBQcm9taXNlIHRoYXQgdGhyb3dzIHdoZW4gYSBjYW5jZWxsYWJsZSBzY29wZSByZWNlaXZlcyBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCBlaXRoZXIgZGlyZWN0bHlcbiAgICogKGkuZS4gYHNjb3BlLmNhbmNlbCgpYCksIG9yIGluZGlyZWN0bHkgKGJ5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBwYXJlbnQgc2NvcGUpLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgbWF5IHJlY2VpdmUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzLCByZXN1bHRpbmcgaW4gdGhlIGBjYW5jZWxSZXF1ZXN0ZWRgIHByb21pc2UgZm9yXG4gICAqIHRoYXQgc2NvcGUgdG8gdGhyb3csIHRob3VnaCB0aGUgc2NvcGUgd2lsbCBub3QgZWZmZWN0aXZlbHkgZ2V0IGNhbmNlbGxlZCAoaS5lLiBgY29uc2lkZXJlZENhbmNlbGxlZGAgd2lsbCBzdGlsbFxuICAgKiByZXR1cm4gYGZhbHNlYCwgYW5kIGNhbmNlbGxhdGlvbiB3aWxsIG5vdCBiZSBwcm9wYWdhdGVkIHRvIGNoaWxkIHNjb3BlcyBhbmQgY29udGFpbmVkIG9wZXJhdGlvbnMpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbFJlcXVlc3RlZDogUHJvbWlzZTxuZXZlcj47XG5cbiAgI2NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHByb3RlY3RlZCByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucykge1xuICAgIHRoaXMudGltZW91dCA9IG1zT3B0aW9uYWxUb051bWJlcihvcHRpb25zPy50aW1lb3V0KTtcbiAgICB0aGlzLmNhbmNlbGxhYmxlID0gb3B0aW9ucz8uY2FuY2VsbGFibGUgPz8gdHJ1ZTtcbiAgICB0aGlzLmNhbmNlbFJlcXVlc3RlZCA9IG5ldyBQcm9taXNlKChfLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVFNDIGRvZXNuJ3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseVxuICAgICAgdGhpcy5yZWplY3QgPSAoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLmNhbmNlbFJlcXVlc3RlZCk7XG4gICAgLy8gQXZvaWQgdW5oYW5kbGVkIHJlamVjdGlvbnNcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBpZiAob3B0aW9ucz8ucGFyZW50ICE9PSBOT19QQVJFTlQpIHtcbiAgICAgIHRoaXMucGFyZW50ID0gb3B0aW9ucz8ucGFyZW50IHx8IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsbGFibGUgfHxcbiAgICAgICAgKHRoaXMucGFyZW50LiNjYW5jZWxSZXF1ZXN0ZWQgJiZcbiAgICAgICAgICAhZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkO1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmICghZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSkge1xuICAgICAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNjb3BlIHdhcyBlZmZlY3RpdmVseSBjYW5jZWxsZWQuIEEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGNhbiBuZXZlciBiZSBjb25zaWRlcmVkIGNhbmNlbGxlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgY29uc2lkZXJlZENhbmNlbGxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY2FuY2VsUmVxdWVzdGVkICYmIHRoaXMuY2FuY2VsbGFibGU7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgdGhlIHNjb3BlIGFzIGN1cnJlbnQgYW5kIHJ1biAgYGZuYFxuICAgKlxuICAgKiBBbnkgdGltZXJzLCBBY3Rpdml0aWVzLCBUcmlnZ2VycyBhbmQgQ2FuY2VsbGF0aW9uU2NvcGVzIGNyZWF0ZWQgaW4gdGhlIGJvZHkgb2YgYGZuYFxuICAgKiBhdXRvbWF0aWNhbGx5IGxpbmsgdGhlaXIgY2FuY2VsbGF0aW9uIHRvIHRoaXMgc2NvcGUuXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHJlc3VsdCBvZiBgZm5gXG4gICAqL1xuICBydW48VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gc3RvcmFnZS5ydW4odGhpcywgdGhpcy5ydW5JbkNvbnRleHQuYmluZCh0aGlzLCBmbikgYXMgKCkgPT4gUHJvbWlzZTxUPik7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRoYXQgcnVucyBhIGZ1bmN0aW9uIGluIEFzeW5jTG9jYWxTdG9yYWdlIGNvbnRleHQuXG4gICAqXG4gICAqIENvdWxkIGhhdmUgYmVlbiB3cml0dGVuIGFzIGFub255bW91cyBmdW5jdGlvbiwgbWFkZSBpbnRvIGEgbWV0aG9kIGZvciBpbXByb3ZlZCBzdGFjayB0cmFjZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcnVuSW5Db250ZXh0PFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgbGV0IHRpbWVyU2NvcGU6IENhbmNlbGxhdGlvblNjb3BlIHwgdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcbiAgICAgIHRpbWVyU2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICB0aW1lclNjb3BlXG4gICAgICAgICAgLnJ1bigoKSA9PiBzbGVlcCh0aGlzLnRpbWVvdXQgYXMgbnVtYmVyKSlcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICgpID0+IHRoaXMuY2FuY2VsKCksXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIHNjb3BlIHdhcyBhbHJlYWR5IGNhbmNlbGxlZCwgaWdub3JlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBmbigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRpbWVyU2NvcGUgJiZcbiAgICAgICAgIXRpbWVyU2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCAmJlxuICAgICAgICBnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pXG4gICAgICApIHtcbiAgICAgICAgdGltZXJTY29wZS5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0byBjYW5jZWwgdGhlIHNjb3BlIGFuZCBsaW5rZWQgY2hpbGRyZW5cbiAgICovXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnQ2FuY2VsbGF0aW9uIHNjb3BlIGNhbmNlbGxlZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgXCJhY3RpdmVcIiBzY29wZVxuICAgKi9cbiAgc3RhdGljIGN1cnJlbnQoKTogQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAgIC8vIFVzaW5nIGdsb2JhbHMgZGlyZWN0bHkgaW5zdGVhZCBvZiBhIGhlbHBlciBmdW5jdGlvbiB0byBhdm9pZCBjaXJjdWxhciBpbXBvcnRcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpID8/IChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXy5yb290U2NvcGU7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBjYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgbm9uQ2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIHdpdGhUaW1lb3V0PFQ+KHRpbWVvdXQ6IER1cmF0aW9uLCBmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlLCB0aW1lb3V0IH0pLnJ1bihmbik7XG4gIH1cbn1cblxuY29uc3Qgc3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxDYW5jZWxsYXRpb25TY29wZT4oKTtcblxuLyoqXG4gKiBBdm9pZCBleHBvc2luZyB0aGUgc3RvcmFnZSBkaXJlY3RseSBzbyBpdCBkb2Vzbid0IGdldCBmcm96ZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVTdG9yYWdlKCk6IHZvaWQge1xuICBzdG9yYWdlLmRpc2FibGUoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFJvb3RDYW5jZWxsYXRpb25TY29wZSBleHRlbmRzIENhbmNlbGxhdGlvblNjb3BlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgcGFyZW50OiBOT19QQVJFTlQgfSk7XG4gIH1cblxuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5yZWplY3QobmV3IENhbmNlbGxlZEZhaWx1cmUoJ1dvcmtmbG93IGNhbmNlbGxlZCcpKTtcbiAgfVxufVxuXG4vKiogVGhpcyBmdW5jdGlvbiBpcyBoZXJlIHRvIGF2b2lkIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBiZXR3ZWVuIHRoaXMgbW9kdWxlIGFuZCB3b3JrZmxvdy50cyAqL1xubGV0IHNsZWVwID0gKF86IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgaGFzIG5vdCBiZWVuIHByb3Blcmx5IGluaXRpYWxpemVkJyk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uKGZuOiB0eXBlb2Ygc2xlZXApOiB2b2lkIHtcbiAgc2xlZXAgPSBmbjtcbn1cbiIsImltcG9ydCB7IEFjdGl2aXR5RmFpbHVyZSwgQ2FuY2VsbGVkRmFpbHVyZSwgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCB3b3JrZmxvdyBlcnJvcnNcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd0Vycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0Vycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaHJvd24gaW4gd29ya2Zsb3cgd2hlbiBpdCB0cmllcyB0byBkbyBzb21ldGhpbmcgdGhhdCBub24tZGV0ZXJtaW5pc3RpYyBzdWNoIGFzIGNvbnN0cnVjdCBhIFdlYWtSZWYoKVxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0RldGVybWluaXNtVmlvbGF0aW9uRXJyb3InKVxuZXhwb3J0IGNsYXNzIERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHt9XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IGFjdHMgYXMgYSBtYXJrZXIgZm9yIHRoaXMgc3BlY2lhbCByZXN1bHQgdHlwZVxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0xvY2FsQWN0aXZpdHlEb0JhY2tvZmYnKVxuZXhwb3J0IGNsYXNzIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBiYWNrb2ZmOiBjb3Jlc2RrLmFjdGl2aXR5X3Jlc3VsdC5JRG9CYWNrb2ZmKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBwcm92aWRlZCBgZXJyYCBpcyBjYXVzZWQgYnkgY2FuY2VsbGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbmNlbGxhdGlvbihlcnI6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlIHx8XG4gICAgKChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUgfHwgZXJyIGluc3RhbmNlb2YgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUpICYmIGVyci5jYXVzZSBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUpXG4gICk7XG59XG4iLCJleHBvcnQgdHlwZSBTZGtGbGFnID0ge1xuICBnZXQgaWQoKTogbnVtYmVyO1xuICBnZXQgZGVmYXVsdCgpOiBib29sZWFuO1xufTtcblxuY29uc3QgZmxhZ3NSZWdpc3RyeTogTWFwPG51bWJlciwgU2RrRmxhZz4gPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjb25zdCBTZGtGbGFncyA9IHtcbiAgLyoqXG4gICAqIFRoaXMgZmxhZyBnYXRlcyBtdWx0aXBsZSBmaXhlcyByZWxhdGVkIHRvIGNhbmNlbGxhdGlvbiBzY29wZXMgYW5kIHRpbWVycyBpbnRyb2R1Y2VkIGluIDEuMTAuMi8xLjExLjA6XG4gICAqIC0gQ2FuY2VsbGF0aW9uIG9mIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG5vIGxvbmdlciBwcm9wYWdhdGVzIHRvIGNoaWxkcmVuIHNjb3Blc1xuICAgKiAgIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLXR5cGVzY3JpcHQvaXNzdWVzLzE0MjMpLlxuICAgKiAtIENhbmNlbGxhdGlvblNjb3BlLndpdGhUaW1lb3V0KGZuKSBub3cgY2FuY2VsIHRoZSB0aW1lciBpZiBgZm5gIGNvbXBsZXRlcyBiZWZvcmUgZXhwaXJhdGlvblxuICAgKiAgIG9mIHRoZSB0aW1lb3V0LCBzaW1pbGFyIHRvIGhvdyBgY29uZGl0aW9uKGZuLCB0aW1lb3V0KWAgd29ya3MuXG4gICAqIC0gVGltZXJzIGNyZWF0ZWQgdXNpbmcgc2V0VGltZW91dCBjYW4gbm93IGJlIGludGVyY2VwdGVkLlxuICAgKlxuICAgKiBAc2luY2UgSW50cm9kdWNlZCBpbiAxLjEwLjIvMS4xMS4wLlxuICAgKi9cbiAgTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbjogZGVmaW5lRmxhZygxLCBmYWxzZSksXG59IGFzIGNvbnN0O1xuXG5mdW5jdGlvbiBkZWZpbmVGbGFnKGlkOiBudW1iZXIsIGRlZjogYm9vbGVhbik6IFNka0ZsYWcge1xuICBjb25zdCBmbGFnID0geyBpZCwgZGVmYXVsdDogZGVmIH07XG4gIGZsYWdzUmVnaXN0cnkuc2V0KGlkLCBmbGFnKTtcbiAgcmV0dXJuIGZsYWc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZEZsYWcoaWQ6IG51bWJlcik6IHZvaWQge1xuICBpZiAoIWZsYWdzUmVnaXN0cnkuaGFzKGlkKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5rbm93biBTREsgZmxhZzogJHtpZH1gKTtcbn1cbiIsImltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHR5cGUgQWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCk6IHVua25vd24ge1xuICByZXR1cm4gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QWN0aXZhdG9yVW50eXBlZChhY3RpdmF0b3I6IHVua25vd24pOiB2b2lkIHtcbiAgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fID0gYWN0aXZhdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVHZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpIGFzIEFjdGl2YXRvciB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KG1lc3NhZ2U6IHN0cmluZyk6IEFjdGl2YXRvciB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG1heWJlR2V0QWN0aXZhdG9yKCk7XG4gIGlmIChhY3RpdmF0b3IgPT0gbnVsbCkgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gYWN0aXZhdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aXZhdG9yKCk6IEFjdGl2YXRvciB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG1heWJlR2V0QWN0aXZhdG9yKCk7XG4gIGlmIChhY3RpdmF0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgdW5pbml0aWFsaXplZCcpO1xuICB9XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG4iLCIvKipcbiAqIE92ZXJyaWRlcyBzb21lIGdsb2JhbCBvYmplY3RzIHRvIG1ha2UgdGhlbSBkZXRlcm1pbmlzdGljLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgbXNUb1RzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgU2RrRmxhZ3MgfSBmcm9tICcuL2ZsYWdzJztcbmltcG9ydCB7IHNsZWVwIH0gZnJvbSAnLi93b3JrZmxvdyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsVGhpcy5EYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVHbG9iYWxzKCk6IHZvaWQge1xuICAvLyBNb2NrIGFueSB3ZWFrIHJlZmVyZW5jZSBiZWNhdXNlIEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljIGFuZCB0aGUgZWZmZWN0IGlzIG9ic2VydmFibGUgZnJvbSB0aGUgV29ya2Zsb3cuXG4gIC8vIFdvcmtmbG93IGRldmVsb3BlciB3aWxsIGdldCBhIG1lYW5pbmdmdWwgZXhjZXB0aW9uIGlmIHRoZXkgdHJ5IHRvIHVzZSB0aGVzZS5cbiAgZ2xvYmFsLldlYWtSZWYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoJ1dlYWtSZWYgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnKTtcbiAgfTtcbiAgZ2xvYmFsLkZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKFxuICAgICAgJ0ZpbmFsaXphdGlvblJlZ2lzdHJ5IGNhbm5vdCBiZSB1c2VkIGluIFdvcmtmbG93cyBiZWNhdXNlIHY4IEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljJ1xuICAgICk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUgPSBmdW5jdGlvbiAoLi4uYXJnczogdW5rbm93bltdKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyAoT3JpZ2luYWxEYXRlIGFzIGFueSkoLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgT3JpZ2luYWxEYXRlKGdldEFjdGl2YXRvcigpLm5vdyk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnZXRBY3RpdmF0b3IoKS5ub3c7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUucGFyc2UgPSBPcmlnaW5hbERhdGUucGFyc2UuYmluZChPcmlnaW5hbERhdGUpO1xuICBnbG9iYWwuRGF0ZS5VVEMgPSBPcmlnaW5hbERhdGUuVVRDLmJpbmQoT3JpZ2luYWxEYXRlKTtcblxuICBnbG9iYWwuRGF0ZS5wcm90b3R5cGUgPSBPcmlnaW5hbERhdGUucHJvdG90eXBlO1xuXG4gIGNvbnN0IHRpbWVvdXRDYW5jZWxhdGlvblNjb3BlcyA9IG5ldyBNYXA8bnVtYmVyLCBDYW5jZWxsYXRpb25TY29wZT4oKTtcblxuICAvKipcbiAgICogQHBhcmFtIG1zIHNsZWVwIGR1cmF0aW9uIC0gIG51bWJlciBvZiBtaWxsaXNlY29uZHMuIElmIGdpdmVuIGEgbmVnYXRpdmUgbnVtYmVyLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICAgKi9cbiAgZ2xvYmFsLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoY2I6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBtczogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IG51bWJlciB7XG4gICAgbXMgPSBNYXRoLm1heCgxLCBtcyk7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgaWYgKGFjdGl2YXRvci5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKSB7XG4gICAgICAvLyBDYXB0dXJlIHRoZSBzZXF1ZW5jZSBudW1iZXIgdGhhdCBzbGVlcCB3aWxsIGFsbG9jYXRlXG4gICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXI7XG4gICAgICBjb25zdCB0aW1lclNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUgfSk7XG4gICAgICBjb25zdCBzbGVlcFByb21pc2UgPSB0aW1lclNjb3BlLnJ1bigoKSA9PiBzbGVlcChtcykpO1xuICAgICAgc2xlZXBQcm9taXNlLnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKHNlcSk7XG4gICAgICAgICAgY2IoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKHNlcSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzbGVlcFByb21pc2UpO1xuICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLnNldChzZXEsIHRpbWVyU2NvcGUpO1xuICAgICAgcmV0dXJuIHNlcTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7XG4gICAgICAvLyBDcmVhdGUgYSBQcm9taXNlIGZvciBBc3luY0xvY2FsU3RvcmFnZSB0byBiZSBhYmxlIHRvIHRyYWNrIHRoaXMgY29tcGxldGlvbiB1c2luZyBwcm9taXNlIGhvb2tzLlxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgc3RhcnRUaW1lcjoge1xuICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgc3RhcnRUb0ZpcmVUaW1lb3V0OiBtc1RvVHMobXMpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSkudGhlbihcbiAgICAgICAgKCkgPT4gY2IoLi4uYXJncyksXG4gICAgICAgICgpID0+IHVuZGVmaW5lZCAvKiBpZ25vcmUgY2FuY2VsbGF0aW9uICovXG4gICAgICApO1xuICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG4gIH07XG5cbiAgZ2xvYmFsLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uIChoYW5kbGU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIGNvbnN0IHRpbWVyU2NvcGUgPSB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZ2V0KGhhbmRsZSk7XG4gICAgaWYgKHRpbWVyU2NvcGUpIHtcbiAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoaGFuZGxlKTtcbiAgICAgIHRpbWVyU2NvcGUuY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrOyAvLyBTaG91bGRuJ3QgaW5jcmVhc2Ugc2VxIG51bWJlciwgYnV0IHRoYXQncyB0aGUgbGVnYWN5IGJlaGF2aW9yXG4gICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuZGVsZXRlKGhhbmRsZSk7XG4gICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICBjYW5jZWxUaW1lcjoge1xuICAgICAgICAgIHNlcTogaGFuZGxlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGFjdGl2YXRvci5yYW5kb20gaXMgbXV0YWJsZSwgZG9uJ3QgaGFyZGNvZGUgaXRzIHJlZmVyZW5jZVxuICBNYXRoLnJhbmRvbSA9ICgpID0+IGdldEFjdGl2YXRvcigpLnJhbmRvbSgpO1xufVxuIiwiLyoqXG4gKiBUaGlzIGxpYnJhcnkgcHJvdmlkZXMgdG9vbHMgcmVxdWlyZWQgZm9yIGF1dGhvcmluZyB3b3JrZmxvd3MuXG4gKlxuICogIyMgVXNhZ2VcbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2hlbGxvLXdvcmxkI3dvcmtmbG93cyB8IHR1dG9yaWFsfSBmb3Igd3JpdGluZyB5b3VyIGZpcnN0IHdvcmtmbG93LlxuICpcbiAqICMjIyBUaW1lcnNcbiAqXG4gKiBUaGUgcmVjb21tZW5kZWQgd2F5IG9mIHNjaGVkdWxpbmcgdGltZXJzIGlzIGJ5IHVzaW5nIHRoZSB7QGxpbmsgc2xlZXB9IGZ1bmN0aW9uLiBXZSd2ZSByZXBsYWNlZCBgc2V0VGltZW91dGAgYW5kXG4gKiBgY2xlYXJUaW1lb3V0YCB3aXRoIGRldGVybWluaXN0aWMgdmVyc2lvbnMgc28gdGhlc2UgYXJlIGFsc28gdXNhYmxlIGJ1dCBoYXZlIGEgbGltaXRhdGlvbiB0aGF0IHRoZXkgZG9uJ3QgcGxheSB3ZWxsXG4gKiB3aXRoIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9jYW5jZWxsYXRpb24tc2NvcGVzIHwgY2FuY2VsbGF0aW9uIHNjb3Blc30uXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXNsZWVwLXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBBY3Rpdml0aWVzXG4gKlxuICogVG8gc2NoZWR1bGUgQWN0aXZpdGllcywgdXNlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIG9idGFpbiBhbiBBY3Rpdml0eSBmdW5jdGlvbiBhbmQgY2FsbC5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2NoZWR1bGUtYWN0aXZpdHktd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIFVwZGF0ZXMsIFNpZ25hbHMgYW5kIFF1ZXJpZXNcbiAqXG4gKiBVc2Uge0BsaW5rIHNldEhhbmRsZXJ9IHRvIHNldCBoYW5kbGVycyBmb3IgVXBkYXRlcywgU2lnbmFscywgYW5kIFF1ZXJpZXMuXG4gKlxuICogVXBkYXRlIGFuZCBTaWduYWwgaGFuZGxlcnMgY2FuIGJlIGVpdGhlciBhc3luYyBvciBub24tYXN5bmMgZnVuY3Rpb25zLiBVcGRhdGUgaGFuZGxlcnMgbWF5IHJldHVybiBhIHZhbHVlLCBidXQgc2lnbmFsXG4gKiBoYW5kbGVycyBtYXkgbm90IChyZXR1cm4gYHZvaWRgIG9yIGBQcm9taXNlPHZvaWQ+YCkuIFlvdSBtYXkgdXNlIEFjdGl2aXRpZXMsIFRpbWVycywgY2hpbGQgV29ya2Zsb3dzLCBldGMgaW4gVXBkYXRlXG4gKiBhbmQgU2lnbmFsIGhhbmRsZXJzLCBidXQgdGhpcyBzaG91bGQgYmUgZG9uZSBjYXV0aW91c2x5OiBmb3IgZXhhbXBsZSwgbm90ZSB0aGF0IGlmIHlvdSBhd2FpdCBhc3luYyBvcGVyYXRpb25zIHN1Y2ggYXNcbiAqIHRoZXNlIGluIGFuIFVwZGF0ZSBvciBTaWduYWwgaGFuZGxlciwgdGhlbiB5b3UgYXJlIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGF0IHRoZSB3b3JrZmxvdyBkb2VzIG5vdCBjb21wbGV0ZSBmaXJzdC5cbiAqXG4gKiBRdWVyeSBoYW5kbGVycyBtYXkgKipub3QqKiBiZSBhc3luYyBmdW5jdGlvbnMsIGFuZCBtYXkgKipub3QqKiBtdXRhdGUgYW55IHZhcmlhYmxlcyBvciB1c2UgQWN0aXZpdGllcywgVGltZXJzLFxuICogY2hpbGQgV29ya2Zsb3dzLCBldGMuXG4gKlxuICogIyMjIyBJbXBsZW1lbnRhdGlvblxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC13b3JrZmxvdy11cGRhdGUtc2lnbmFsLXF1ZXJ5LWV4YW1wbGUtLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIE1vcmVcbiAqXG4gKiAtIFtEZXRlcm1pbmlzdGljIGJ1aWx0LWluc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20jc291cmNlcy1vZi1ub24tZGV0ZXJtaW5pc20pXG4gKiAtIFtDYW5jZWxsYXRpb24gYW5kIHNjb3Blc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcylcbiAqICAgLSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9XG4gKiAgIC0ge0BsaW5rIFRyaWdnZXJ9XG4gKiAtIFtTaW5rc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2FwcGxpY2F0aW9uLWRldmVsb3BtZW50L29ic2VydmFiaWxpdHkvP2xhbmc9dHMjbG9nZ2luZylcbiAqICAgLSB7QGxpbmsgU2lua3N9XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCB7XG4gIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgQ2FuY2VsbGVkRmFpbHVyZSxcbiAgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBQYXlsb2FkQ29udmVydGVyLFxuICBSZXRyeVBvbGljeSxcbiAgcm9vdENhdXNlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvZXJyb3JzJztcbmV4cG9ydCB7XG4gIEFjdGl2aXR5RnVuY3Rpb24sXG4gIEFjdGl2aXR5SW50ZXJmYWNlLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIFBheWxvYWQsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2VhcmNoQXR0cmlidXRlVmFsdWUsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dRdWVyeVR5cGUsXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxuICBXb3JrZmxvd1NpZ25hbFR5cGUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LW9wdGlvbnMnO1xuZXhwb3J0IHsgQXN5bmNMb2NhbFN0b3JhZ2UsIENhbmNlbGxhdGlvblNjb3BlLCBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5leHBvcnQge1xuICBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIEZpbGVMb2NhdGlvbixcbiAgRmlsZVNsaWNlLFxuICBQYXJlbnRDbG9zZVBvbGljeSxcbiAgUGFyZW50V29ya2Zsb3dJbmZvLFxuICBTREtJbmZvLFxuICBTdGFja1RyYWNlLFxuICBVbnNhZmVXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93SW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCB7IHByb3h5U2lua3MsIFNpbmssIFNpbmtDYWxsLCBTaW5rRnVuY3Rpb24sIFNpbmtzIH0gZnJvbSAnLi9zaW5rcyc7XG5leHBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZ3MnO1xuZXhwb3J0IHsgVHJpZ2dlciB9IGZyb20gJy4vdHJpZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93JztcbmV4cG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5cbi8vIEFueXRoaW5nIGJlbG93IHRoaXMgbGluZSBpcyBkZXByZWNhdGVkXG5cbmV4cG9ydCB7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICAgKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gICAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICBMb2dnZXJTaW5rc0RlcHJlY2F0ZWQgYXMgTG9nZ2VyU2lua3MsXG59IGZyb20gJy4vbG9ncyc7XG4iLCIvKipcbiAqIFR5cGUgZGVmaW5pdGlvbnMgYW5kIGdlbmVyaWMgaGVscGVycyBmb3IgaW50ZXJjZXB0b3JzLlxuICpcbiAqIFRoZSBXb3JrZmxvdyBzcGVjaWZpYyBpbnRlcmNlcHRvcnMgYXJlIGRlZmluZWQgaGVyZS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgQWN0aXZpdHlPcHRpb25zLCBIZWFkZXJzLCBMb2NhbEFjdGl2aXR5T3B0aW9ucywgTmV4dCwgVGltZXN0YW1wLCBXb3JrZmxvd0V4ZWN1dGlvbiB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cywgQ29udGludWVBc05ld09wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgeyBOZXh0LCBIZWFkZXJzIH07XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5leGVjdXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93RXhlY3V0ZUlucHV0IHtcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlVXBkYXRlIGFuZFxuICogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci52YWxpZGF0ZVVwZGF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVJbnB1dCB7XG4gIHJlYWRvbmx5IHVwZGF0ZUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlU2lnbmFsICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbElucHV0IHtcbiAgcmVhZG9ubHkgc2lnbmFsTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVRdWVyeSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUlucHV0IHtcbiAgcmVhZG9ubHkgcXVlcnlJZDogc3RyaW5nO1xuICByZWFkb25seSBxdWVyeU5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgaW5ib3VuZCBjYWxscyBsaWtlIGV4ZWN1dGlvbiwgYW5kIHNpZ25hbCBhbmQgcXVlcnkgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBleGVjdXRlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFdvcmtmbG93IGV4ZWN1dGlvblxuICAgKi9cbiAgZXhlY3V0ZT86IChpbnB1dDogV29ya2Zsb3dFeGVjdXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2V4ZWN1dGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gVXBkYXRlIGhhbmRsZXIgaXMgY2FsbGVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBVcGRhdGVcbiAgICovXG4gIGhhbmRsZVVwZGF0ZT86IChpbnB1dDogVXBkYXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVVwZGF0ZSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKiBDYWxsZWQgd2hlbiB1cGRhdGUgdmFsaWRhdG9yIGNhbGxlZCAqL1xuICB2YWxpZGF0ZVVwZGF0ZT86IChpbnB1dDogVXBkYXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3ZhbGlkYXRlVXBkYXRlJz4pID0+IHZvaWQ7XG5cbiAgLyoqIENhbGxlZCB3aGVuIHNpZ25hbCBpcyBkZWxpdmVyZWQgdG8gYSBXb3JrZmxvdyBleGVjdXRpb24gKi9cbiAgaGFuZGxlU2lnbmFsPzogKGlucHV0OiBTaWduYWxJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlU2lnbmFsJz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgV29ya2Zsb3cgaXMgcXVlcmllZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgcXVlcnlcbiAgICovXG4gIGhhbmRsZVF1ZXJ5PzogKGlucHV0OiBRdWVyeUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVRdWVyeSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNjaGVkdWxlQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlJbnB1dCB7XG4gIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVMb2NhbEFjdGl2aXR5ICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsQWN0aXZpdHlJbnB1dCB7XG4gIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbiAgcmVhZG9ubHkgb3JpZ2luYWxTY2hlZHVsZVRpbWU/OiBUaW1lc3RhbXA7XG4gIHJlYWRvbmx5IGF0dGVtcHQ6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQge1xuICByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgb3B0aW9uczogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0VGltZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZXJJbnB1dCB7XG4gIHJlYWRvbmx5IGR1cmF0aW9uTXM6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKlxuICogU2FtZSBhcyBDb250aW51ZUFzTmV3T3B0aW9ucyBidXQgd29ya2Zsb3dUeXBlIG11c3QgYmUgZGVmaW5lZFxuICovXG5leHBvcnQgdHlwZSBDb250aW51ZUFzTmV3SW5wdXRPcHRpb25zID0gQ29udGludWVBc05ld09wdGlvbnMgJiBSZXF1aXJlZDxQaWNrPENvbnRpbnVlQXNOZXdPcHRpb25zLCAnd29ya2Zsb3dUeXBlJz4+O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLmNvbnRpbnVlQXNOZXcgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGludWVBc05ld0lucHV0IHtcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBvcHRpb25zOiBDb250aW51ZUFzTmV3SW5wdXRPcHRpb25zO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNpZ25hbFdvcmtmbG93ICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbFdvcmtmbG93SW5wdXQge1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2lnbmFsTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHRhcmdldDpcbiAgICB8IHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogJ2V4dGVybmFsJztcbiAgICAgICAgcmVhZG9ubHkgd29ya2Zsb3dFeGVjdXRpb246IFdvcmtmbG93RXhlY3V0aW9uO1xuICAgICAgfVxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnY2hpbGQnO1xuICAgICAgICByZWFkb25seSBjaGlsZFdvcmtmbG93SWQ6IHN0cmluZztcbiAgICAgIH07XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuZ2V0TG9nQXR0cmlidXRlcyAqL1xuZXhwb3J0IHR5cGUgR2V0TG9nQXR0cmlidXRlc0lucHV0ID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbi8qKlxuICogSW1wbGVtZW50IGFueSBvZiB0aGVzZSBtZXRob2RzIHRvIGludGVyY2VwdCBXb3JrZmxvdyBjb2RlIGNhbGxzIHRvIHRoZSBUZW1wb3JhbCBBUElzLCBsaWtlIHNjaGVkdWxpbmcgYW4gYWN0aXZpdHkgYW5kIHN0YXJ0aW5nIGEgdGltZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzY2hlZHVsZXMgYW4gQWN0aXZpdHlcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIGFjdGl2aXR5IGV4ZWN1dGlvblxuICAgKi9cbiAgc2NoZWR1bGVBY3Rpdml0eT86IChpbnB1dDogQWN0aXZpdHlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2NoZWR1bGVBY3Rpdml0eSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzY2hlZHVsZXMgYSBsb2NhbCBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUxvY2FsQWN0aXZpdHk/OiAoaW5wdXQ6IExvY2FsQWN0aXZpdHlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2NoZWR1bGVMb2NhbEFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHN0YXJ0cyBhIHRpbWVyXG4gICAqL1xuICBzdGFydFRpbWVyPzogKGlucHV0OiBUaW1lcklucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzdGFydFRpbWVyJz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IGNhbGxzIGNvbnRpbnVlQXNOZXdcbiAgICovXG4gIGNvbnRpbnVlQXNOZXc/OiAoaW5wdXQ6IENvbnRpbnVlQXNOZXdJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29udGludWVBc05ldyc+KSA9PiBQcm9taXNlPG5ldmVyPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2lnbmFscyBhIGNoaWxkIG9yIGV4dGVybmFsIFdvcmtmbG93XG4gICAqL1xuICBzaWduYWxXb3JrZmxvdz86IChpbnB1dDogU2lnbmFsV29ya2Zsb3dJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2lnbmFsV29ya2Zsb3cnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgY2hpbGQgd29ya2Zsb3cgZXhlY3V0aW9uLCB0aGUgaW50ZXJjZXB0b3IgZnVuY3Rpb24gcmV0dXJucyAyIHByb21pc2VzOlxuICAgKlxuICAgKiAtIFRoZSBmaXJzdCByZXNvbHZlcyB3aXRoIHRoZSBgcnVuSWRgIHdoZW4gdGhlIGNoaWxkIHdvcmtmbG93IGhhcyBzdGFydGVkIG9yIHJlamVjdHMgaWYgZmFpbGVkIHRvIHN0YXJ0LlxuICAgKiAtIFRoZSBzZWNvbmQgcmVzb2x2ZXMgd2l0aCB0aGUgd29ya2Zsb3cgcmVzdWx0IHdoZW4gdGhlIGNoaWxkIHdvcmtmbG93IGNvbXBsZXRlcyBvciByZWplY3RzIG9uIGZhaWx1cmUuXG4gICAqL1xuICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24/OiAoXG4gICAgaW5wdXQ6IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0LFxuICAgIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbic+XG4gICkgPT4gUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT47XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBlYWNoIGludm9jYXRpb24gb2YgdGhlIGB3b3JrZmxvdy5sb2dgIG1ldGhvZHMuXG4gICAqXG4gICAqIFRoZSBhdHRyaWJ1dGVzIHJldHVybmVkIGluIHRoaXMgY2FsbCBhcmUgYXR0YWNoZWQgdG8gZXZlcnkgbG9nIG1lc3NhZ2UuXG4gICAqL1xuICBnZXRMb2dBdHRyaWJ1dGVzPzogKGlucHV0OiBHZXRMb2dBdHRyaWJ1dGVzSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2dldExvZ0F0dHJpYnV0ZXMnPikgPT4gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQge1xuICBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW107XG59XG5cbi8qKiBPdXRwdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuY29uY2x1ZGVBY3RpdmF0aW9uICovXG5leHBvcnQgdHlwZSBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQgPSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dDtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmFjdGl2YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRlSW5wdXQge1xuICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbjtcbiAgYmF0Y2hJbmRleDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuZGlzcG9zZSAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1pbnRlcmZhY2VcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcG9zZUlucHV0IHt9XG5cbi8qKlxuICogSW50ZXJjZXB0b3IgZm9yIHRoZSBpbnRlcm5hbHMgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUuXG4gKlxuICogVXNlIHRvIG1hbmlwdWxhdGUgb3IgdHJhY2UgV29ya2Zsb3cgYWN0aXZhdGlvbnMuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBUaGlzIEFQSSBpcyBmb3IgYWR2YW5jZWQgdXNlIGNhc2VzIGFuZCBtYXkgY2hhbmdlIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgV29ya2Zsb3cgcnVudGltZSBydW5zIGEgV29ya2Zsb3dBY3RpdmF0aW9uSm9iLlxuICAgKi9cbiAgYWN0aXZhdGU/KGlucHV0OiBBY3RpdmF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdhY3RpdmF0ZSc+KTogdm9pZDtcblxuICAvKipcbiAgICogQ2FsbGVkIGFmdGVyIGFsbCBgV29ya2Zsb3dBY3RpdmF0aW9uSm9iYHMgaGF2ZSBiZWVuIHByb2Nlc3NlZCBmb3IgYW4gYWN0aXZhdGlvbi5cbiAgICpcbiAgICogQ2FuIG1hbmlwdWxhdGUgdGhlIGNvbW1hbmRzIGdlbmVyYXRlZCBieSB0aGUgV29ya2Zsb3dcbiAgICovXG4gIGNvbmNsdWRlQWN0aXZhdGlvbj8oaW5wdXQ6IENvbmNsdWRlQWN0aXZhdGlvbklucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb25jbHVkZUFjdGl2YXRpb24nPik6IENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dDtcblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSBkaXNwb3NpbmcgdGhlIFdvcmtmbG93IGlzb2xhdGUgY29udGV4dC5cbiAgICpcbiAgICogSW1wbGVtZW50IHRoaXMgbWV0aG9kIHRvIHBlcmZvcm0gYW55IHJlc291cmNlIGNsZWFudXAuXG4gICAqL1xuICBkaXNwb3NlPyhpbnB1dDogRGlzcG9zZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdkaXNwb3NlJz4pOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgbWFwcGluZyBmcm9tIGludGVyY2VwdG9yIHR5cGUgdG8gYW4gb3B0aW9uYWwgbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0ludGVyY2VwdG9ycyB7XG4gIGluYm91bmQ/OiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIG91dGJvdW5kPzogV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3JbXTtcbiAgaW50ZXJuYWxzPzogV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvcltdO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHtAbGluayBXb3JrZmxvd0ludGVyY2VwdG9yc30gYW5kIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqXG4gKiBXb3JrZmxvdyBpbnRlcmNlcHRvciBtb2R1bGVzIHNob3VsZCBleHBvcnQgYW4gYGludGVyY2VwdG9yc2AgZnVuY3Rpb24gb2YgdGhpcyB0eXBlLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGV4cG9ydCBmdW5jdGlvbiBpbnRlcmNlcHRvcnMoKTogV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICogICByZXR1cm4ge1xuICogICAgIGluYm91bmQ6IFtdLCAgIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgICBvdXRib3VuZDogW10sICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgaW50ZXJuYWxzOiBbXSwgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9ICgpID0+IFdvcmtmbG93SW50ZXJjZXB0b3JzO1xuIiwiaW1wb3J0IHR5cGUgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7XG4gIFJldHJ5UG9saWN5LFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIENvbW1vbldvcmtmbG93T3B0aW9ucyxcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgVXBkYXRlRGVmaW5pdGlvbixcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBEdXJhdGlvbixcbiAgVmVyc2lvbmluZ0ludGVudCxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcywgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogV29ya2Zsb3cgRXhlY3V0aW9uIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIElEIG9mIHRoZSBXb3JrZmxvdywgdGhpcyBjYW4gYmUgc2V0IGJ5IHRoZSBjbGllbnQgZHVyaW5nIFdvcmtmbG93IGNyZWF0aW9uLlxuICAgKiBBIHNpbmdsZSBXb3JrZmxvdyBtYXkgcnVuIG11bHRpcGxlIHRpbWVzIGUuZy4gd2hlbiBzY2hlZHVsZWQgd2l0aCBjcm9uLlxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJRCBvZiBhIHNpbmdsZSBXb3JrZmxvdyBydW5cbiAgICovXG4gIHJlYWRvbmx5IHJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdvcmtmbG93IGZ1bmN0aW9uJ3MgbmFtZVxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKlxuICAgKiBUaGlzIHZhbHVlIG1heSBjaGFuZ2UgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqL1xuICByZWFkb25seSBzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzO1xuXG4gIC8qKlxuICAgKiBOb24taW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqL1xuICByZWFkb25seSBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFBhcmVudCBXb3JrZmxvdyBpbmZvIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDaGlsZCBXb3JrZmxvdylcbiAgICovXG4gIHJlYWRvbmx5IHBhcmVudD86IFBhcmVudFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogUmVzdWx0IGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ3JvbiBXb3JrZmxvdyBvciB3YXMgQ29udGludWVkIEFzIE5ldykuXG4gICAqXG4gICAqIEFuIGFycmF5IG9mIHZhbHVlcywgc2luY2Ugb3RoZXIgU0RLcyBtYXkgcmV0dXJuIG11bHRpcGxlIHZhbHVlcyBmcm9tIGEgV29ya2Zsb3cuXG4gICAqL1xuICByZWFkb25seSBsYXN0UmVzdWx0PzogdW5rbm93bjtcblxuICAvKipcbiAgICogRmFpbHVyZSBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgd2hlbiB0aGlzIFJ1biBpcyBhIHJldHJ5LCBvciB0aGUgbGFzdCBSdW4gb2YgYSBDcm9uIFdvcmtmbG93IGZhaWxlZClcbiAgICovXG4gIHJlYWRvbmx5IGxhc3RGYWlsdXJlPzogVGVtcG9yYWxGYWlsdXJlO1xuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgV29ya2Zsb3cgaGlzdG9yeSB1cCB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIHJlYWRvbmx5IGhpc3RvcnlMZW5ndGg6IG51bWJlcjtcblxuICAvKipcbiAgICogU2l6ZSBvZiBXb3JrZmxvdyBoaXN0b3J5IGluIGJ5dGVzIHVudGlsIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgemVybyBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5U2l6ZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBIGhpbnQgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQgV29ya2Zsb3dUYXNrU3RhcnRlZCBldmVudCByZWNvbW1lbmRpbmcgd2hldGhlciB0b1xuICAgKiB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgYGZhbHNlYCBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVBc05ld1N1Z2dlc3RlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBvblxuICAgKi9cbiAgcmVhZG9ubHkgdGFza1F1ZXVlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5hbWVzcGFjZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBpblxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJ1biBJZCBvZiB0aGUgZmlyc3QgUnVuIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICByZWFkb25seSBmaXJzdEV4ZWN1dGlvblJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IFJ1biBJZCBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVkRnJvbUV4ZWN1dGlvblJ1bklkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoaXMgW1dvcmtmbG93IEV4ZWN1dGlvbiBDaGFpbl0oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3dvcmtmbG93cyN3b3JrZmxvdy1leGVjdXRpb24tY2hhaW4pIHdhcyBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBzdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIGN1cnJlbnQgV29ya2Zsb3cgUnVuIHN0YXJ0ZWRcbiAgICovXG4gIHJlYWRvbmx5IHJ1blN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBleHBpcmVzXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25FeHBpcmF0aW9uVGltZT86IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgUnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgV29ya2Zsb3cgVGFzayBpbiBtaWxsaXNlY29uZHMuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tUaW1lb3V0TXM6IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0cnkgUG9saWN5IGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLnJldHJ5fS5cbiAgICovXG4gIHJlYWRvbmx5IHJldHJ5UG9saWN5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhdCAxIGFuZCBpbmNyZW1lbnRzIGZvciBldmVyeSByZXRyeSBpZiB0aGVyZSBpcyBhIGByZXRyeVBvbGljeWBcbiAgICovXG4gIHJlYWRvbmx5IGF0dGVtcHQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JvbiBTY2hlZHVsZSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5jcm9uU2NoZWR1bGV9LlxuICAgKi9cbiAgcmVhZG9ubHkgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBDcm9uIFJ1bnNcbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZVRvU2NoZWR1bGVJbnRlcnZhbD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIEJ1aWxkIElEIG9mIHRoZSB3b3JrZXIgd2hpY2ggZXhlY3V0ZWQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay4gTWF5IGJlIHVuZGVmaW5lZCBpZiB0aGVcbiAgICogdGFzayB3YXMgY29tcGxldGVkIGJ5IGEgd29ya2VyIHdpdGhvdXQgYSBCdWlsZCBJRC4gSWYgdGhpcyB3b3JrZXIgaXMgdGhlIG9uZSBleGVjdXRpbmcgdGhpc1xuICAgKiB0YXNrIGZvciB0aGUgZmlyc3QgdGltZSBhbmQgaGFzIGEgQnVpbGQgSUQgc2V0LCB0aGVuIGl0cyBJRCB3aWxsIGJlIHVzZWQuIFRoaXMgdmFsdWUgbWF5IGNoYW5nZVxuICAgKiBvdmVyIHRoZSBsaWZldGltZSBvZiB0aGUgd29ya2Zsb3cgcnVuLCBidXQgaXMgZGV0ZXJtaW5pc3RpYyBhbmQgc2FmZSB0byB1c2UgZm9yIGJyYW5jaGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGN1cnJlbnRCdWlsZElkPzogc3RyaW5nO1xuXG4gIHJlYWRvbmx5IHVuc2FmZTogVW5zYWZlV29ya2Zsb3dJbmZvO1xufVxuXG4vKipcbiAqIFVuc2FmZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb24uXG4gKlxuICogTmV2ZXIgcmVseSBvbiB0aGlzIGluZm9ybWF0aW9uIGluIFdvcmtmbG93IGxvZ2ljIGFzIGl0IHdpbGwgY2F1c2Ugbm9uLWRldGVybWluaXN0aWMgYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVW5zYWZlV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIEN1cnJlbnQgc3lzdGVtIHRpbWUgaW4gbWlsbGlzZWNvbmRzXG4gICAqXG4gICAqIFRoZSBzYWZlIHZlcnNpb24gb2YgdGltZSBpcyBgbmV3IERhdGUoKWAgYW5kIGBEYXRlLm5vdygpYCwgd2hpY2ggYXJlIHNldCBvbiB0aGUgZmlyc3QgaW52b2NhdGlvbiBvZiBhIFdvcmtmbG93XG4gICAqIFRhc2sgYW5kIHN0YXkgY29uc3RhbnQgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgVGFzayBhbmQgZHVyaW5nIHJlcGxheS5cbiAgICovXG4gIHJlYWRvbmx5IG5vdzogKCkgPT4gbnVtYmVyO1xuXG4gIHJlYWRvbmx5IGlzUmVwbGF5aW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmVudFdvcmtmbG93SW5mbyB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgcnVuSWQ6IHN0cmluZztcbiAgbmFtZXNwYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogTm90IGFuIGFjdHVhbCBlcnJvciwgdXNlZCBieSB0aGUgV29ya2Zsb3cgcnVudGltZSB0byBhYm9ydCBleGVjdXRpb24gd2hlbiB7QGxpbmsgY29udGludWVBc05ld30gaXMgY2FsbGVkXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ29udGludWVBc05ldycpXG5leHBvcnQgY2xhc3MgQ29udGludWVBc05ldyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGNvbW1hbmQ6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSUNvbnRpbnVlQXNOZXdXb3JrZmxvd0V4ZWN1dGlvbikge1xuICAgIHN1cGVyKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3Jyk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBjb250aW51aW5nIGEgV29ya2Zsb3cgYXMgbmV3XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGludWVBc05ld09wdGlvbnMge1xuICAvKipcbiAgICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBXb3JrZmxvdyB0eXBlIG5hbWUsIGUuZy4gdGhlIGZpbGVuYW1lIGluIHRoZSBOb2RlLmpzIFNESyBvciBjbGFzcyBuYW1lIGluIEphdmFcbiAgICovXG4gIHdvcmtmbG93VHlwZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gY29udGludWUgdGhlIFdvcmtmbG93IGluXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciB0aGUgZW50aXJlIFdvcmtmbG93IHJ1blxuICAgKiBAZm9ybWF0IHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIGEgc2luZ2xlIFdvcmtmbG93IHRhc2tcbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IER1cmF0aW9uO1xuICAvKipcbiAgICogTm9uLXNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqXG4gICAqIFNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIHNlYXJjaEF0dHJpYnV0ZXM/OiBTZWFyY2hBdHRyaWJ1dGVzO1xuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBXb3JrZmxvdyBzaG91bGRcbiAgICogQ29udGludWUtYXMtTmV3IG9udG8gYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogU3BlY2lmaWVzOlxuICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAqIC0gd2hldGhlciBhbmQgd2hlbiBhIHtAbGluayBDYW5jZWxlZEZhaWx1cmV9IGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAqXG4gKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICovXG5leHBvcnQgZW51bSBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSB7XG4gIC8qKlxuICAgKiBEb24ndCBzZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgQUJBTkRPTiA9IDAsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIEltbWVkaWF0ZWx5IHRocm93IHRoZSBlcnJvci5cbiAgICovXG4gIFRSWV9DQU5DRUwgPSAxLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaGUgQ2hpbGQgbWF5IHJlc3BlY3QgY2FuY2VsbGF0aW9uLCBpbiB3aGljaCBjYXNlIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duXG4gICAqIHdoZW4gY2FuY2VsbGF0aW9uIGhhcyBjb21wbGV0ZWQsIGFuZCB7QGxpbmsgaXNDYW5jZWxsYXRpb259KGVycm9yKSB3aWxsIGJlIHRydWUuIE9uIHRoZSBvdGhlciBoYW5kLCB0aGUgQ2hpbGQgbWF5XG4gICAqIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIGluIHdoaWNoIGNhc2UgYW4gZXJyb3IgbWlnaHQgYmUgdGhyb3duIHdpdGggYSBkaWZmZXJlbnQgY2F1c2UsIG9yIHRoZSBDaGlsZCBtYXlcbiAgICogY29tcGxldGUgc3VjY2Vzc2Z1bGx5LlxuICAgKlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEID0gMixcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gVGhyb3cgdGhlIGVycm9yIG9uY2UgdGhlIFNlcnZlciByZWNlaXZlcyB0aGUgQ2hpbGQgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9SRVFVRVNURUQgPSAzLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU+KCk7XG5jaGVja0V4dGVuZHM8Q2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU+KCk7XG5cbi8qKlxuICogSG93IGEgQ2hpbGQgV29ya2Zsb3cgcmVhY3RzIHRvIHRoZSBQYXJlbnQgV29ya2Zsb3cgcmVhY2hpbmcgYSBDbG9zZWQgc3RhdGUuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS1wYXJlbnQtY2xvc2UtcG9saWN5LyB8IFBhcmVudCBDbG9zZSBQb2xpY3l9XG4gKi9cbmV4cG9ydCBlbnVtIFBhcmVudENsb3NlUG9saWN5IHtcbiAgLyoqXG4gICAqIElmIGEgYFBhcmVudENsb3NlUG9saWN5YCBpcyBzZXQgdG8gdGhpcywgb3IgaXMgbm90IHNldCBhdCBhbGwsIHRoZSBzZXJ2ZXIgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1VOU1BFQ0lGSUVEID0gMCxcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIFRlcm1pbmF0ZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURSA9IDEsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIG5vdGhpbmcgaXMgZG9uZSB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX0FCQU5ET04gPSAyLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgQ2FuY2VsbGVkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9SRVFVRVNUX0NBTkNFTCA9IDMsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5LCBQYXJlbnRDbG9zZVBvbGljeT4oKTtcbmNoZWNrRXh0ZW5kczxQYXJlbnRDbG9zZVBvbGljeSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGlsZFdvcmtmbG93T3B0aW9ucyBleHRlbmRzIENvbW1vbldvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXb3JrZmxvdyBpZCB0byB1c2Ugd2hlbiBzdGFydGluZy4gSWYgbm90IHNwZWNpZmllZCBhIFVVSUQgaXMgZ2VuZXJhdGVkLiBOb3RlIHRoYXQgaXQgaXNcbiAgICogZGFuZ2Vyb3VzIGFzIGluIGNhc2Ugb2YgY2xpZW50IHNpZGUgcmV0cmllcyBubyBkZWR1cGxpY2F0aW9uIHdpbGwgaGFwcGVuIGJhc2VkIG9uIHRoZVxuICAgKiBnZW5lcmF0ZWQgaWQuIFNvIHByZWZlciBhc3NpZ25pbmcgYnVzaW5lc3MgbWVhbmluZ2Z1bCBpZHMgaWYgcG9zc2libGUuXG4gICAqL1xuICB3b3JrZmxvd0lkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRvIHVzZSBmb3IgV29ya2Zsb3cgdGFza3MuIEl0IHNob3VsZCBtYXRjaCBhIHRhc2sgcXVldWUgc3BlY2lmaWVkIHdoZW4gY3JlYXRpbmcgYVxuICAgKiBgV29ya2VyYCB0aGF0IGhvc3RzIHRoZSBXb3JrZmxvdyBjb2RlLlxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXM6XG4gICAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gICAqIC0gd2hldGhlciBhbmQgd2hlbiBhbiBlcnJvciBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICAgKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGhvdyB0aGUgQ2hpbGQgcmVhY3RzIHRvIHRoZSBQYXJlbnQgV29ya2Zsb3cgcmVhY2hpbmcgYSBDbG9zZWQgc3RhdGUuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBQYXJlbnRDbG9zZVBvbGljeS5QQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURX1cbiAgICovXG4gIHBhcmVudENsb3NlUG9saWN5PzogUGFyZW50Q2xvc2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgQ2hpbGQgV29ya2Zsb3cgc2hvdWxkIHJ1biBvblxuICAgKiBhIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuZXhwb3J0IHR5cGUgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucyA9IFJlcXVpcmVkPFBpY2s8Q2hpbGRXb3JrZmxvd09wdGlvbnMsICd3b3JrZmxvd0lkJyB8ICdjYW5jZWxsYXRpb25UeXBlJz4+ICYge1xuICBhcmdzOiB1bmtub3duW107XG59O1xuXG5leHBvcnQgdHlwZSBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyA9IENoaWxkV29ya2Zsb3dPcHRpb25zICYgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucztcblxuZXhwb3J0IGludGVyZmFjZSBTREtJbmZvIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNsaWNlIG9mIGEgZmlsZSBzdGFydGluZyBhdCBsaW5lT2Zmc2V0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVNsaWNlIHtcbiAgLyoqXG4gICAqIHNsaWNlIG9mIGEgZmlsZSB3aXRoIGBcXG5gIChuZXdsaW5lKSBsaW5lIHRlcm1pbmF0b3IuXG4gICAqL1xuICBjb250ZW50OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPbmx5IHVzZWQgcG9zc2libGUgdG8gdHJpbSB0aGUgZmlsZSB3aXRob3V0IGJyZWFraW5nIHN5bnRheCBoaWdobGlnaHRpbmcuXG4gICAqL1xuICBsaW5lT2Zmc2V0OiBudW1iZXI7XG59XG5cbi8qKlxuICogQSBwb2ludGVyIHRvIGEgbG9jYXRpb24gaW4gYSBmaWxlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUxvY2F0aW9uIHtcbiAgLyoqXG4gICAqIFBhdGggdG8gc291cmNlIGZpbGUgKGFic29sdXRlIG9yIHJlbGF0aXZlKS5cbiAgICogV2hlbiB1c2luZyBhIHJlbGF0aXZlIHBhdGgsIG1ha2Ugc3VyZSBhbGwgcGF0aHMgYXJlIHJlbGF0aXZlIHRvIHRoZSBzYW1lIHJvb3QuXG4gICAqL1xuICBmaWxlUGF0aD86IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcywgcmVxdWlyZWQgZm9yIGRpc3BsYXlpbmcgdGhlIGNvZGUgbG9jYXRpb24uXG4gICAqL1xuICBsaW5lPzogbnVtYmVyO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLlxuICAgKi9cbiAgY29sdW1uPzogbnVtYmVyO1xuICAvKipcbiAgICogRnVuY3Rpb24gbmFtZSB0aGlzIGxpbmUgYmVsb25ncyB0byAoaWYgYXBwbGljYWJsZSkuXG4gICAqIFVzZWQgZm9yIGZhbGxpbmcgYmFjayB0byBzdGFjayB0cmFjZSB2aWV3LlxuICAgKi9cbiAgZnVuY3Rpb25OYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2Uge1xuICBsb2NhdGlvbnM6IEZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIHJlc3VsdCBmb3IgdGhlIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRW5oYW5jZWRTdGFja1RyYWNlIHtcbiAgc2RrOiBTREtJbmZvO1xuICAvKipcbiAgICogTWFwcGluZyBvZiBmaWxlIHBhdGggdG8gZmlsZSBjb250ZW50cy5cbiAgICogU0RLIG1heSBjaG9vc2UgdG8gc2VuZCBubywgc29tZSBvciBhbGwgc291cmNlcy5cbiAgICogU291cmNlcyBtaWdodCBiZSB0cmltbWVkLCBhbmQgc29tZSB0aW1lIG9ubHkgdGhlIGZpbGUocykgb2YgdGhlIHRvcCBlbGVtZW50IG9mIHRoZSB0cmFjZSB3aWxsIGJlIHNlbnQuXG4gICAqL1xuICBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBGaWxlU2xpY2VbXT47XG4gIHN0YWNrczogU3RhY2tUcmFjZVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIGluZm86IFdvcmtmbG93SW5mbztcbiAgcmFuZG9tbmVzc1NlZWQ6IG51bWJlcltdO1xuICBub3c6IG51bWJlcjtcbiAgcGF0Y2hlczogc3RyaW5nW107XG4gIHNob3dTdGFja1RyYWNlU291cmNlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCBleHRlbmRzIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuICByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG4gIGdldFRpbWVPZkRheSgpOiBiaWdpbnQ7XG59XG5cbi8qKlxuICogQSBoYW5kbGVyIGZ1bmN0aW9uIGNhcGFibGUgb2YgYWNjZXB0aW5nIHRoZSBhcmd1bWVudHMgZm9yIGEgZ2l2ZW4gVXBkYXRlRGVmaW5pdGlvbiwgU2lnbmFsRGVmaW5pdGlvbiBvciBRdWVyeURlZmluaXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPiA9IFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPGluZmVyIFIsIGluZmVyIEE+XG4gID8gKC4uLmFyZ3M6IEEpID0+IFIgfCBQcm9taXNlPFI+XG4gIDogVCBleHRlbmRzIFNpZ25hbERlZmluaXRpb248aW5mZXIgQT5cbiAgICA/ICguLi5hcmdzOiBBKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPlxuICAgIDogVCBleHRlbmRzIFF1ZXJ5RGVmaW5pdGlvbjxpbmZlciBSLCBpbmZlciBBPlxuICAgICAgPyAoLi4uYXJnczogQSkgPT4gUlxuICAgICAgOiBuZXZlcjtcblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gYWNjZXB0aW5nIHNpZ25hbCBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICovXG5leHBvcnQgdHlwZSBEZWZhdWx0U2lnbmFsSGFuZGxlciA9IChzaWduYWxOYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG5cbi8qKlxuICogQSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGNhcGFibGUgb2YgYWNjZXB0aW5nIHRoZSBhcmd1bWVudHMgZm9yIGEgZ2l2ZW4gVXBkYXRlRGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgVXBkYXRlVmFsaWRhdG9yPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSAoLi4uYXJnczogQXJncykgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGRlc2NyaXB0aW9uIG9mIGEgcXVlcnkgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgUXVlcnlIYW5kbGVyT3B0aW9ucyA9IHsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBBIGRlc2NyaXB0aW9uIG9mIGEgc2lnbmFsIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFNpZ25hbEhhbmRsZXJPcHRpb25zID0geyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEEgdmFsaWRhdG9yIGFuZCBkZXNjcmlwdGlvbiBvZiBhbiB1cGRhdGUgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncyBleHRlbmRzIGFueVtdPiA9IHsgdmFsaWRhdG9yPzogVXBkYXRlVmFsaWRhdG9yPEFyZ3M+OyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdO1xuICB1c2VkSW50ZXJuYWxGbGFnczogbnVtYmVyW107XG59XG4iLCJpbXBvcnQgdHlwZSB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0IHtcbiAgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsXG4gIEZhaWx1cmVDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIGFycmF5RnJvbVBheWxvYWRzLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgZW5zdXJlVGVtcG9yYWxGYWlsdXJlLFxuICBJbGxlZ2FsU3RhdGVFcnJvcixcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yLFxuICBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUsXG4gIFByb3RvRmFpbHVyZSxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB0eXBlIHsgY29yZXNkaywgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBhbGVhLCBSTkcgfSBmcm9tICcuL2FsZWEnO1xuaW1wb3J0IHsgUm9vdENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciwgTG9jYWxBY3Rpdml0eURvQmFja29mZiwgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBRdWVyeUlucHV0LCBTaWduYWxJbnB1dCwgVXBkYXRlSW5wdXQsIFdvcmtmbG93RXhlY3V0ZUlucHV0LCBXb3JrZmxvd0ludGVyY2VwdG9ycyB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENvbnRpbnVlQXNOZXcsXG4gIERlZmF1bHRTaWduYWxIYW5kbGVyLFxuICBTREtJbmZvLFxuICBGaWxlU2xpY2UsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgRmlsZUxvY2F0aW9uLFxuICBXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsLFxuICBBY3RpdmF0aW9uQ29tcGxldGlvbixcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHR5cGUgU2lua0NhbGwgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCBwa2cgZnJvbSAnLi9wa2cnO1xuaW1wb3J0IHsgZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nIH0gZnJvbSAnLi9sb2dzJztcbmltcG9ydCB7IFNka0ZsYWcsIGFzc2VydFZhbGlkRmxhZyB9IGZyb20gJy4vZmxhZ3MnO1xuXG5lbnVtIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlIHtcbiAgU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9VTlNQRUNJRklFRCA9IDAsXG4gIFNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfV09SS0ZMT1dfQUxSRUFEWV9FWElTVFMgPSAxLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2U+KCk7XG5jaGVja0V4dGVuZHM8U3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2U+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2sge1xuICBmb3JtYXR0ZWQ6IHN0cmluZztcbiAgc3RydWN0dXJlZDogRmlsZUxvY2F0aW9uW107XG59XG5cbi8qKlxuICogR2xvYmFsIHN0b3JlIHRvIHRyYWNrIHByb21pc2Ugc3RhY2tzIGZvciBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb21pc2VTdGFja1N0b3JlIHtcbiAgY2hpbGRUb1BhcmVudDogTWFwPFByb21pc2U8dW5rbm93bj4sIFNldDxQcm9taXNlPHVua25vd24+Pj47XG4gIHByb21pc2VUb1N0YWNrOiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU3RhY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBsZXRpb24ge1xuICByZXNvbHZlKHZhbDogdW5rbm93bik6IHVua25vd247XG4gIHJlamVjdChyZWFzb246IHVua25vd24pOiB1bmtub3duO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XG4gIGZuKCk6IGJvb2xlYW47XG4gIHJlc29sdmUoKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxLIGV4dGVuZHMga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2I+ID0gKFxuICBhY3RpdmF0aW9uOiBOb25OdWxsYWJsZTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYltLXT5cbikgPT4gdm9pZDtcblxuLyoqXG4gKiBWZXJpZmllcyBhbGwgYWN0aXZhdGlvbiBqb2IgaGFuZGxpbmcgbWV0aG9kcyBhcmUgaW1wbGVtZW50ZWRcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXIgPSB7XG4gIFtQIGluIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iXTogQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxQPjtcbn07XG5cbi8qKlxuICogS2VlcHMgYWxsIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lIHN0YXRlIGxpa2UgcGVuZGluZyBjb21wbGV0aW9ucyBmb3IgYWN0aXZpdGllcyBhbmQgdGltZXJzLlxuICpcbiAqIEltcGxlbWVudHMgaGFuZGxlcnMgZm9yIGFsbCB3b3JrZmxvdyBhY3RpdmF0aW9uIGpvYnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0b3IgaW1wbGVtZW50cyBBY3RpdmF0aW9uSGFuZGxlciB7XG4gIC8qKlxuICAgKiBDYWNoZSBmb3IgbW9kdWxlcyAtIHJlZmVyZW5jZWQgaW4gcmV1c2FibGUtdm0udHNcbiAgICovXG4gIHJlYWRvbmx5IG1vZHVsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KCk7XG4gIC8qKlxuICAgKiBNYXAgb2YgdGFzayBzZXF1ZW5jZSB0byBhIENvbXBsZXRpb25cbiAgICovXG4gIHJlYWRvbmx5IGNvbXBsZXRpb25zID0ge1xuICAgIHRpbWVyOiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBhY3Rpdml0eTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2hpbGRXb3JrZmxvd1N0YXJ0OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93Q29tcGxldGU6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIHNpZ25hbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjYW5jZWxXb3JrZmxvdzogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gIH07XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIFVwZGF0ZSBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZFxuICAgKi9cbiAgcmVhZG9ubHkgYnVmZmVyZWRVcGRhdGVzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklEb1VwZGF0ZT4oKTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgc2lnbmFsIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFNpZ25hbHMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVNpZ25hbFdvcmtmbG93PigpO1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBxdWVyeSBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogKipJTVBPUlRBTlQqKiBxdWVyaWVzIGFyZSBvbmx5IGJ1ZmZlcmVkIHVudGlsIHdvcmtmbG93IGlzIHN0YXJ0ZWQuXG4gICAqIFRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZSBhc3luYyBpbnRlcmNlcHRvcnMgbWlnaHQgYmxvY2sgd29ya2Zsb3cgZnVuY3Rpb24gaW52b2NhdGlvblxuICAgKiB3aGljaCBkZWxheXMgcXVlcnkgaGFuZGxlciByZWdpc3RyYXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYnVmZmVyZWRRdWVyaWVzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93PigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHVwZGF0ZSBuYW1lIHRvIGhhbmRsZXIgYW5kIHZhbGlkYXRvclxuICAgKi9cbiAgcmVhZG9ubHkgdXBkYXRlSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlPigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHNpZ25hbCBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHJlYWRvbmx5IHNpZ25hbEhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZT4oKTtcblxuICAvKipcbiAgICogQSBzaWduYWwgaGFuZGxlciB0aGF0IGNhdGNoZXMgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAgICovXG4gIGRlZmF1bHRTaWduYWxIYW5kbGVyPzogRGVmYXVsdFNpZ25hbEhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIFNvdXJjZSBtYXAgZmlsZSBmb3IgbG9va2luZyB1cCB0aGUgc291cmNlIGZpbGVzIGluIHJlc3BvbnNlIHRvIF9fZW5oYW5jZWRfc3RhY2tfdHJhY2VcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdG8gc2VuZCB0aGUgc291cmNlcyBpbiBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeSByZXNwb25zZXNcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG5cbiAgcmVhZG9ubHkgcHJvbWlzZVN0YWNrU3RvcmU6IFByb21pc2VTdGFja1N0b3JlID0ge1xuICAgIHByb21pc2VUb1N0YWNrOiBuZXcgTWFwKCksXG4gICAgY2hpbGRUb1BhcmVudDogbmV3IE1hcCgpLFxuICB9O1xuXG4gIHB1YmxpYyByZWFkb25seSByb290U2NvcGUgPSBuZXcgUm9vdENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgcXVlcnkgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcXVlcnlIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZT4oW1xuICAgIFtcbiAgICAgICdfX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0YWNrVHJhY2VzKClcbiAgICAgICAgICAgIC5tYXAoKHMpID0+IHMuZm9ybWF0dGVkKVxuICAgICAgICAgICAgLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzZW5zaWJsZSBzdGFjayB0cmFjZS4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX2VuaGFuY2VkX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IEVuaGFuY2VkU3RhY2tUcmFjZSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBzb3VyY2VNYXAgfSA9IHRoaXM7XG4gICAgICAgICAgY29uc3Qgc2RrOiBTREtJbmZvID0geyBuYW1lOiAndHlwZXNjcmlwdCcsIHZlcnNpb246IHBrZy52ZXJzaW9uIH07XG4gICAgICAgICAgY29uc3Qgc3RhY2tzID0gdGhpcy5nZXRTdGFja1RyYWNlcygpLm1hcCgoeyBzdHJ1Y3R1cmVkOiBsb2NhdGlvbnMgfSkgPT4gKHsgbG9jYXRpb25zIH0pKTtcbiAgICAgICAgICBjb25zdCBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBGaWxlU2xpY2VbXT4gPSB7fTtcbiAgICAgICAgICBpZiAodGhpcy5zaG93U3RhY2tUcmFjZVNvdXJjZXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBsb2NhdGlvbnMgfSBvZiBzdGFja3MpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGZpbGVQYXRoIH0gb2YgbG9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlUGF0aCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHNvdXJjZU1hcD8uc291cmNlc0NvbnRlbnQ/Lltzb3VyY2VNYXA/LnNvdXJjZXMuaW5kZXhPZihmaWxlUGF0aCldO1xuICAgICAgICAgICAgICAgIGlmICghY29udGVudCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgc291cmNlc1tmaWxlUGF0aF0gPSBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGxpbmVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgc2RrLCBzdGFja3MsIHNvdXJjZXMgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIGEgc3RhY2sgdHJhY2UgYW5ub3RhdGVkIHdpdGggc291cmNlIGluZm9ybWF0aW9uLicsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgJ19fdGVtcG9yYWxfd29ya2Zsb3dfbWV0YWRhdGEnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKTogdGVtcG9yYWwuYXBpLnNkay52MS5JV29ya2Zsb3dNZXRhZGF0YSA9PiB7XG4gICAgICAgICAgY29uc3Qgd29ya2Zsb3dUeXBlID0gdGhpcy5pbmZvLndvcmtmbG93VHlwZTtcbiAgICAgICAgICBjb25zdCBxdWVyeURlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnF1ZXJ5SGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBjb25zdCBzaWduYWxEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy5zaWduYWxIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZURlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnVwZGF0ZUhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlZmluaXRpb246IHtcbiAgICAgICAgICAgICAgdHlwZTogd29ya2Zsb3dUeXBlLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbnVsbCwgLy8gRm9yIG5vdywgZG8gbm90IHNldCB0aGUgd29ya2Zsb3cgZGVzY3JpcHRpb24gaW4gdGhlIFRTIFNESy5cbiAgICAgICAgICAgICAgcXVlcnlEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgc2lnbmFsRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIHVwZGF0ZURlZmluaXRpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgbWV0YWRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoaXMgd29ya2Zsb3cuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgXSk7XG5cbiAgLyoqXG4gICAqIExvYWRlZCBpbiB7QGxpbmsgaW5pdFJ1bnRpbWV9XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJjZXB0b3JzOiBSZXF1aXJlZDxXb3JrZmxvd0ludGVyY2VwdG9ycz4gPSB7IGluYm91bmQ6IFtdLCBvdXRib3VuZDogW10sIGludGVybmFsczogW10gfTtcblxuICAvKipcbiAgICogQnVmZmVyIHRoYXQgc3RvcmVzIGFsbCBnZW5lcmF0ZWQgY29tbWFuZHMsIHJlc2V0IGFmdGVyIGVhY2ggYWN0aXZhdGlvblxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgYWxsIHtAbGluayBjb25kaXRpb259cyB0aGF0IGhhdmVuJ3QgYmVlbiB1bmJsb2NrZWQgeWV0XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgYmxvY2tlZENvbmRpdGlvbnMgPSBuZXcgTWFwPG51bWJlciwgQ29uZGl0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBJcyB0aGlzIFdvcmtmbG93IGNvbXBsZXRlZD9cbiAgICpcbiAgICogQSBXb3JrZmxvdyB3aWxsIGJlIGNvbnNpZGVyZWQgY29tcGxldGVkIGlmIGl0IGdlbmVyYXRlcyBhIGNvbW1hbmQgdGhhdCB0aGVcbiAgICogc3lzdGVtIGNvbnNpZGVycyBhcyBhIGZpbmFsIFdvcmtmbG93IGNvbW1hbmQgKGUuZy5cbiAgICogY29tcGxldGVXb3JrZmxvd0V4ZWN1dGlvbiBvciBmYWlsV29ya2Zsb3dFeGVjdXRpb24pLlxuICAgKi9cbiAgcHVibGljIGNvbXBsZXRlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBXYXMgdGhpcyBXb3JrZmxvdyBjYW5jZWxsZWQ/XG4gICAqL1xuICBwcm90ZWN0ZWQgY2FuY2VsbGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgdHJhY2tlZCB0byBhbGxvdyBidWZmZXJpbmcgcXVlcmllcyB1bnRpbCBhIHdvcmtmbG93IGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgICogVE9ETyhiZXJndW5keSk6IEkgZG9uJ3QgdGhpbmsgdGhpcyBtYWtlcyBzZW5zZSBzaW5jZSBxdWVyaWVzIHJ1biBsYXN0IGluIGFuIGFjdGl2YXRpb24gYW5kIG11c3QgYmUgcmVzcG9uZGVkIHRvIGluXG4gICAqIHRoZSBzYW1lIGFjdGl2YXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgd29ya2Zsb3dGdW5jdGlvbldhc0NhbGxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCAoaW5jcmVtZW50YWwpIHNlcXVlbmNlIHRvIGFzc2lnbiB3aGVuIGdlbmVyYXRpbmcgY29tcGxldGFibGUgY29tbWFuZHNcbiAgICovXG4gIHB1YmxpYyBuZXh0U2VxcyA9IHtcbiAgICB0aW1lcjogMSxcbiAgICBhY3Rpdml0eTogMSxcbiAgICBjaGlsZFdvcmtmbG93OiAxLFxuICAgIHNpZ25hbFdvcmtmbG93OiAxLFxuICAgIGNhbmNlbFdvcmtmbG93OiAxLFxuICAgIGNvbmRpdGlvbjogMSxcbiAgICAvLyBVc2VkIGludGVybmFsbHkgdG8ga2VlcCB0cmFjayBvZiBhY3RpdmUgc3RhY2sgdHJhY2VzXG4gICAgc3RhY2s6IDEsXG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgc2V0IGV2ZXJ5IHRpbWUgdGhlIHdvcmtmbG93IGV4ZWN1dGVzIGFuIGFjdGl2YXRpb25cbiAgICovXG4gIG5vdzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgV29ya2Zsb3csIGluaXRpYWxpemVkIHdoZW4gYSBXb3JrZmxvdyBpcyBzdGFydGVkXG4gICAqL1xuICBwdWJsaWMgd29ya2Zsb3c/OiBXb3JrZmxvdztcblxuICAvKipcbiAgICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICovXG4gIHB1YmxpYyBpbmZvOiBXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIEEgZGV0ZXJtaW5pc3RpYyBSTkcsIHVzZWQgYnkgdGhlIGlzb2xhdGUncyBvdmVycmlkZGVuIE1hdGgucmFuZG9tXG4gICAqL1xuICBwdWJsaWMgcmFuZG9tOiBSTkc7XG5cbiAgcHVibGljIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIgPSBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcjtcbiAgcHVibGljIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXIgPSBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcjtcblxuICAvKipcbiAgICogUGF0Y2hlcyB3ZSBrbm93IHRoZSBzdGF0dXMgb2YgZm9yIHRoaXMgd29ya2Zsb3csIGFzIGluIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBrbm93blByZXNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Ugc2VudCB0byBjb3JlIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkga25vd25GbGFncyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIC8qKlxuICAgKiBCdWZmZXJlZCBzaW5rIGNhbGxzIHBlciBhY3RpdmF0aW9uXG4gICAqL1xuICBzaW5rQ2FsbHMgPSBBcnJheTxTaW5rQ2FsbD4oKTtcblxuICAvKipcbiAgICogQSBuYW5vc2Vjb25kIHJlc29sdXRpb24gdGltZSBmdW5jdGlvbiwgZXh0ZXJuYWxseSBpbmplY3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGdldFRpbWVPZkRheTogKCkgPT4gYmlnaW50O1xuXG4gIHB1YmxpYyByZWFkb25seSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGluZm8sXG4gICAgbm93LFxuICAgIHNob3dTdGFja1RyYWNlU291cmNlcyxcbiAgICBzb3VyY2VNYXAsXG4gICAgZ2V0VGltZU9mRGF5LFxuICAgIHJhbmRvbW5lc3NTZWVkLFxuICAgIHBhdGNoZXMsXG4gICAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMsXG4gIH06IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsKSB7XG4gICAgdGhpcy5nZXRUaW1lT2ZEYXkgPSBnZXRUaW1lT2ZEYXk7XG4gICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICB0aGlzLm5vdyA9IG5vdztcbiAgICB0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcyA9IHNob3dTdGFja1RyYWNlU291cmNlcztcbiAgICB0aGlzLnNvdXJjZU1hcCA9IHNvdXJjZU1hcDtcbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEocmFuZG9tbmVzc1NlZWQpO1xuICAgIHRoaXMucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMgPSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lcztcblxuICAgIGlmIChpbmZvLnVuc2FmZS5pc1JlcGxheWluZykge1xuICAgICAgZm9yIChjb25zdCBwYXRjaElkIG9mIHBhdGNoZXMpIHtcbiAgICAgICAgdGhpcy5ub3RpZnlIYXNQYXRjaCh7IHBhdGNoSWQgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlV29ya2Zsb3dJbmZvKGZuOiAoaW5mbzogV29ya2Zsb3dJbmZvKSA9PiBXb3JrZmxvd0luZm8pOiB2b2lkIHtcbiAgICB0aGlzLmluZm8gPSBmbih0aGlzLmluZm8pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldFN0YWNrVHJhY2VzKCk6IFN0YWNrW10ge1xuICAgIGNvbnN0IHsgY2hpbGRUb1BhcmVudCwgcHJvbWlzZVRvU3RhY2sgfSA9IHRoaXMucHJvbWlzZVN0YWNrU3RvcmU7XG4gICAgY29uc3QgaW50ZXJuYWxOb2RlcyA9IFsuLi5jaGlsZFRvUGFyZW50LnZhbHVlcygpXS5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGN1cnIpIHtcbiAgICAgICAgYWNjLmFkZChwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgbmV3IFNldCgpKTtcbiAgICBjb25zdCBzdGFja3MgPSBuZXcgTWFwPHN0cmluZywgU3RhY2s+KCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZFRvUGFyZW50LmtleXMoKSkge1xuICAgICAgaWYgKCFpbnRlcm5hbE5vZGVzLmhhcyhjaGlsZCkpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBwcm9taXNlVG9TdGFjay5nZXQoY2hpbGQpO1xuICAgICAgICBpZiAoIXN0YWNrIHx8ICFzdGFjay5mb3JtYXR0ZWQpIGNvbnRpbnVlO1xuICAgICAgICBzdGFja3Muc2V0KHN0YWNrLmZvcm1hdHRlZCwgc3RhY2spO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3QgMTAwJSBzdXJlIHdoZXJlIHRoaXMgY29tZXMgZnJvbSwganVzdCBmaWx0ZXIgaXQgb3V0XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pJyk7XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pXFxuJyk7XG4gICAgcmV0dXJuIFsuLi5zdGFja3NdLm1hcCgoW18sIHN0YWNrXSkgPT4gc3RhY2spO1xuICB9XG5cbiAgZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gICAgY29uc3QgeyBzaW5rQ2FsbHMgfSA9IHRoaXM7XG4gICAgdGhpcy5zaW5rQ2FsbHMgPSBbXTtcbiAgICByZXR1cm4gc2lua0NhbGxzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIFdvcmtmbG93IGNvbW1hbmQgdG8gYmUgY29sbGVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogUHJldmVudHMgY29tbWFuZHMgZnJvbSBiZWluZyBhZGRlZCBhZnRlciBXb3JrZmxvdyBjb21wbGV0aW9uLlxuICAgKi9cbiAgcHVzaENvbW1hbmQoY21kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmQsIGNvbXBsZXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICAvLyBPbmx5IHF1ZXJ5IHJlc3BvbnNlcyBtYXkgYmUgc2VudCBhZnRlciBjb21wbGV0aW9uXG4gICAgaWYgKHRoaXMuY29tcGxldGVkICYmICFjbWQucmVzcG9uZFRvUXVlcnkpIHJldHVybjtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY21kKTtcbiAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgIHRoaXMuY29tcGxldGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25jbHVkZUFjdGl2YXRpb24oKTogQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICBjb21tYW5kczogdGhpcy5jb21tYW5kcy5zcGxpY2UoMCksXG4gICAgICB1c2VkSW50ZXJuYWxGbGFnczogWy4uLnRoaXMua25vd25GbGFnc10sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydFdvcmtmbG93TmV4dEhhbmRsZXIoeyBhcmdzIH06IFdvcmtmbG93RXhlY3V0ZUlucHV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHdvcmtmbG93IH0gPSB0aGlzO1xuICAgIGlmICh3b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgbGV0IHByb21pc2U6IFByb21pc2U8YW55PjtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZSA9IHdvcmtmbG93KC4uLmFyZ3MpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBRdWVyaWVzIG11c3QgYmUgaGFuZGxlZCBldmVuIGlmIHRoZXJlIHdhcyBhbiBleGNlcHRpb24gd2hlbiBpbnZva2luZyB0aGUgV29ya2Zsb3cgZnVuY3Rpb24uXG4gICAgICB0aGlzLndvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQgPSB0cnVlO1xuICAgICAgLy8gRW1wdHkgdGhlIGJ1ZmZlclxuICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5idWZmZXJlZFF1ZXJpZXMuc3BsaWNlKDApO1xuICAgICAgZm9yIChjb25zdCBhY3RpdmF0aW9uIG9mIGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBwcm9taXNlO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTdGFydFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnModGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCwgJ2V4ZWN1dGUnLCB0aGlzLnN0YXJ0V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpKTtcblxuICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKCgpID0+XG4gICAgICAgIGV4ZWN1dGUoe1xuICAgICAgICAgIGhlYWRlcnM6IGFjdGl2YXRpb24uaGVhZGVycyA/PyB7fSxcbiAgICAgICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgICAgfSlcbiAgICAgICkudGhlbih0aGlzLmNvbXBsZXRlV29ya2Zsb3cuYmluZCh0aGlzKSwgdGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGNhbmNlbFdvcmtmbG93KF9hY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUNhbmNlbFdvcmtmbG93KTogdm9pZCB7XG4gICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgIHRoaXMucm9vdFNjb3BlLmNhbmNlbCgpO1xuICB9XG5cbiAgcHVibGljIGZpcmVUaW1lcihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUZpcmVUaW1lcik6IHZvaWQge1xuICAgIC8vIFRpbWVycyBhcmUgYSBzcGVjaWFsIGNhc2Ugd2hlcmUgdGhlaXIgY29tcGxldGlvbiBtaWdodCBub3QgYmUgaW4gV29ya2Zsb3cgc3RhdGUsXG4gICAgLy8gdGhpcyBpcyBkdWUgdG8gaW1tZWRpYXRlIHRpbWVyIGNhbmNlbGxhdGlvbiB0aGF0IGRvZXNuJ3QgZ28gd2FpdCBmb3IgQ29yZS5cbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKCd0aW1lcicsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgY29tcGxldGlvbj8ucmVzb2x2ZSh1bmRlZmluZWQpO1xuICB9XG5cbiAgcHVibGljIHJlc29sdmVBY3Rpdml0eShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVBY3Rpdml0eSk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQWN0aXZpdHkgYWN0aXZhdGlvbiB3aXRoIG5vIHJlc3VsdCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignYWN0aXZpdHknLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikge1xuICAgICAgcmVqZWN0KG5ldyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydChcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnRcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dTdGFydCcsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uc3VjY2VlZGVkKSB7XG4gICAgICByZXNvbHZlKGFjdGl2YXRpb24uc3VjY2VlZGVkLnJ1bklkKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uZmFpbGVkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLmNhdXNlICE9PVxuICAgICAgICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZS5TVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdHb3QgdW5rbm93biBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZScpO1xuICAgICAgfVxuICAgICAgaWYgKCEoYWN0aXZhdGlvbi5zZXEgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBpbiBhY3RpdmF0aW9uIGpvYicpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yKFxuICAgICAgICAgICdXb3JrZmxvdyBleGVjdXRpb24gYWxyZWFkeSBzdGFydGVkJyxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5jYW5jZWxsZWQpIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3Qgbm8gZmFpbHVyZSBpbiBjYW5jZWxsZWQgdmFyaWFudCcpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydCB3aXRoIG5vIHN0YXR1cycpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uIGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dDb21wbGV0ZScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGZhaWxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgY2FuY2VsbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW50ZW50aW9uYWxseSBub24tYXN5bmMgZnVuY3Rpb24gc28gdGhpcyBoYW5kbGVyIGRvZXNuJ3Qgc2hvdyB1cCBpbiB0aGUgc3RhY2sgdHJhY2VcbiAgcHJvdGVjdGVkIHF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlcih7IHF1ZXJ5TmFtZSwgYXJncyB9OiBRdWVyeUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnF1ZXJ5SGFuZGxlcnMuZ2V0KHF1ZXJ5TmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGtub3duUXVlcnlUeXBlcyA9IFsuLi50aGlzLnF1ZXJ5SGFuZGxlcnMua2V5cygpXS5qb2luKCcgJyk7XG4gICAgICAvLyBGYWlsIHRoZSBxdWVyeVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGRpZCBub3QgcmVnaXN0ZXIgYSBoYW5kbGVyIGZvciAke3F1ZXJ5TmFtZX0uIFJlZ2lzdGVyZWQgcXVlcmllczogWyR7a25vd25RdWVyeVR5cGVzfV1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBmbiguLi5hcmdzKTtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignUXVlcnkgaGFuZGxlcnMgc2hvdWxkIG5vdCByZXR1cm4gYSBQcm9taXNlJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRRdWVyaWVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBxdWVyeVR5cGUsIHF1ZXJ5SWQsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCEocXVlcnlUeXBlICYmIHF1ZXJ5SWQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIHF1ZXJ5IGFjdGl2YXRpb24gYXR0cmlidXRlcycpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVRdWVyeScsXG4gICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIHF1ZXJ5TmFtZTogcXVlcnlUeXBlLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICBxdWVyeUlkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQsIHJlc3VsdCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmZhaWxRdWVyeShxdWVyeUlkLCByZWFzb24pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkb1VwZGF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlKTogdm9pZCB7XG4gICAgY29uc3QgeyBpZDogdXBkYXRlSWQsIHByb3RvY29sSW5zdGFuY2VJZCwgbmFtZSwgaGVhZGVycywgcnVuVmFsaWRhdG9yIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghdXBkYXRlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgaWQnKTtcbiAgICB9XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIG5hbWUnKTtcbiAgICB9XG4gICAgaWYgKCFwcm90b2NvbEluc3RhbmNlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgcHJvdG9jb2xJbnN0YW5jZUlkJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy51cGRhdGVIYW5kbGVycy5oYXMobmFtZSkpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRVcGRhdGVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFrZUlucHV0ID0gKCk6IFVwZGF0ZUlucHV0ID0+ICh7XG4gICAgICB1cGRhdGVJZCxcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBuYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KTtcblxuICAgIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBiZWxvdyBpcyByZXNwb25zaWJsZSBmb3IgdXBob2xkaW5nLCBhbmQgY29uc3RyYWluZWRcbiAgICAvLyBieSwgdGhlIGZvbGxvd2luZyBjb250cmFjdDpcbiAgICAvL1xuICAgIC8vIDEuIElmIG5vIHZhbGlkYXRvciBpcyBwcmVzZW50IHRoZW4gdmFsaWRhdGlvbiBpbnRlcmNlcHRvcnMgd2lsbCBub3QgYmUgcnVuLlxuICAgIC8vXG4gICAgLy8gMi4gRHVyaW5nIHZhbGlkYXRpb24sIGFueSBlcnJvciBtdXN0IGZhaWwgdGhlIFVwZGF0ZTsgZHVyaW5nIHRoZSBVcGRhdGVcbiAgICAvLyAgICBpdHNlbGYsIFRlbXBvcmFsIGVycm9ycyBmYWlsIHRoZSBVcGRhdGUgd2hlcmVhcyBvdGhlciBlcnJvcnMgZmFpbCB0aGVcbiAgICAvLyAgICBhY3RpdmF0aW9uLlxuICAgIC8vXG4gICAgLy8gMy4gVGhlIGhhbmRsZXIgbXVzdCBub3Qgc2VlIGFueSBtdXRhdGlvbnMgb2YgdGhlIGFyZ3VtZW50cyBtYWRlIGJ5IHRoZVxuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDQuIEFueSBlcnJvciB3aGVuIGRlY29kaW5nL2Rlc2VyaWFsaXppbmcgaW5wdXQgbXVzdCBiZSBjYXVnaHQgYW5kIHJlc3VsdFxuICAgIC8vICAgIGluIHJlamVjdGlvbiBvZiB0aGUgVXBkYXRlIGJlZm9yZSBpdCBpcyBhY2NlcHRlZCwgZXZlbiBpZiB0aGVyZSBpcyBub1xuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDUuIFRoZSBpbml0aWFsIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIChhc3luYykgVXBkYXRlIGhhbmRsZXIgc2hvdWxkXG4gICAgLy8gICAgYmUgZXhlY3V0ZWQgYWZ0ZXIgdGhlIChzeW5jKSB2YWxpZGF0b3IgY29tcGxldGVzIHN1Y2ggdGhhdCB0aGVyZSBpc1xuICAgIC8vICAgIG1pbmltYWwgb3Bwb3J0dW5pdHkgZm9yIGEgZGlmZmVyZW50IGNvbmN1cnJlbnQgdGFzayB0byBiZSBzY2hlZHVsZWRcbiAgICAvLyAgICBiZXR3ZWVuIHRoZW0uXG4gICAgLy9cbiAgICAvLyA2LiBUaGUgc3RhY2sgdHJhY2UgdmlldyBwcm92aWRlZCBpbiB0aGUgVGVtcG9yYWwgVUkgbXVzdCBub3QgYmUgcG9sbHV0ZWRcbiAgICAvLyAgICBieSBwcm9taXNlcyB0aGF0IGRvIG5vdCBkZXJpdmUgZnJvbSB1c2VyIGNvZGUuIFRoaXMgaW1wbGllcyB0aGF0XG4gICAgLy8gICAgYXN5bmMvYXdhaXQgc3ludGF4IG1heSBub3QgYmUgdXNlZC5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBhIGRlbGliZXJhdGVseSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24gYmVsb3cuXG4gICAgLy8gVGhlc2UgYXJlIGNhdWdodCBlbHNld2hlcmUgYW5kIGZhaWwgdGhlIGNvcnJlc3BvbmRpbmcgYWN0aXZhdGlvbi5cbiAgICBsZXQgaW5wdXQ6IFVwZGF0ZUlucHV0O1xuICAgIHRyeSB7XG4gICAgICBpZiAocnVuVmFsaWRhdG9yICYmIHRoaXMudXBkYXRlSGFuZGxlcnMuZ2V0KG5hbWUpPy52YWxpZGF0b3IpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAgICAgJ3ZhbGlkYXRlVXBkYXRlJyxcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlVXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgICAgICB2YWxpZGF0ZShtYWtlSW5wdXQoKSk7XG4gICAgICB9XG4gICAgICBpbnB1dCA9IG1ha2VJbnB1dCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnModGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCwgJ2hhbmRsZVVwZGF0ZScsIHRoaXMudXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5hY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkKTtcbiAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgIGV4ZWN1dGUoaW5wdXQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCByZXN1bHQpKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlTmV4dEhhbmRsZXIoeyBuYW1lLCBhcmdzIH06IFVwZGF0ZUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnVwZGF0ZUhhbmRsZXJzLmdldChuYW1lKTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyByZWdpc3RlcmVkIHVwZGF0ZSBoYW5kbGVyIGZvciB1cGRhdGU6ICR7bmFtZX1gKSk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFuZGxlciB9ID0gZW50cnk7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIoLi4uYXJncyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdmFsaWRhdGVVcGRhdGVOZXh0SGFuZGxlcih7IG5hbWUsIGFyZ3MgfTogVXBkYXRlSW5wdXQpOiB2b2lkIHtcbiAgICBjb25zdCB7IHZhbGlkYXRvciB9ID0gdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSkgPz8ge307XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFsaWRhdG9yKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFVwZGF0ZXMgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcztcbiAgICB3aGlsZSAoYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkVXBkYXRlcy5maW5kSW5kZXgoKHVwZGF0ZSkgPT4gdGhpcy51cGRhdGVIYW5kbGVycy5oYXModXBkYXRlLm5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gTm8gYnVmZmVyZWQgVXBkYXRlcyBoYXZlIGEgaGFuZGxlciB5ZXQuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgW3VwZGF0ZV0gPSBidWZmZXJlZFVwZGF0ZXMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgdGhpcy5kb1VwZGF0ZSh1cGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgdXBkYXRlID0gdGhpcy5idWZmZXJlZFVwZGF0ZXMuc2hpZnQoKTtcbiAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUoXG4gICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvbiAqL1xuICAgICAgICAgIHVwZGF0ZS5wcm90b2NvbEluc3RhbmNlSWQhLFxuICAgICAgICAgIEFwcGxpY2F0aW9uRmFpbHVyZS5ub25SZXRyeWFibGUoYE5vIHJlZ2lzdGVyZWQgaGFuZGxlciBmb3IgdXBkYXRlOiAke3VwZGF0ZS5uYW1lfWApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzaWduYWxOYW1lLCBhcmdzIH06IFNpZ25hbElucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnNpZ25hbEhhbmRsZXJzLmdldChzaWduYWxOYW1lKT8uaGFuZGxlcjtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJldHVybiBhd2FpdCBmbiguLi5hcmdzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKHNpZ25hbE5hbWUsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIHJlZ2lzdGVyZWQgc2lnbmFsIGhhbmRsZXIgZm9yIHNpZ25hbDogJHtzaWduYWxOYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzaWduYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVNpZ25hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBzaWduYWxOYW1lLCBoZWFkZXJzIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghc2lnbmFsTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHNpZ25hbE5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2lnbmFsSGFuZGxlcnMuaGFzKHNpZ25hbE5hbWUpICYmICF0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkU2lnbmFscy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVTaWduYWwnLFxuICAgICAgdGhpcy5zaWduYWxXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuICAgIGV4ZWN1dGUoe1xuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIHNpZ25hbE5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pLmNhdGNoKHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkU2lnbmFscyA9IHRoaXMuYnVmZmVyZWRTaWduYWxzO1xuICAgIHdoaWxlIChidWZmZXJlZFNpZ25hbHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgICAvLyBXZSBoYXZlIGEgZGVmYXVsdCBzaWduYWwgaGFuZGxlciwgc28gYWxsIHNpZ25hbHMgYXJlIGRpc3BhdGNoYWJsZVxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KGJ1ZmZlcmVkU2lnbmFscy5zaGlmdCgpISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRTaWduYWxzLmZpbmRJbmRleCgoc2lnbmFsKSA9PiB0aGlzLnNpZ25hbEhhbmRsZXJzLmhhcyhzaWduYWwuc2lnbmFsTmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBicmVhaztcbiAgICAgICAgY29uc3QgW3NpZ25hbF0gPSBidWZmZXJlZFNpZ25hbHMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KHNpZ25hbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignc2lnbmFsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvdyhcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd1xuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2FuY2VsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZVJhbmRvbVNlZWQoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklVcGRhdGVSYW5kb21TZWVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhY3RpdmF0aW9uIHdpdGggcmFuZG9tbmVzc1NlZWQgYXR0cmlidXRlJyk7XG4gICAgfVxuICAgIHRoaXMucmFuZG9tID0gYWxlYShhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkLnRvQnl0ZXMoKSk7XG4gIH1cblxuICBwdWJsaWMgbm90aWZ5SGFzUGF0Y2goYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklOb3RpZnlIYXNQYXRjaCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5wYXRjaElkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOb3RpZnkgaGFzIHBhdGNoIG1pc3NpbmcgcGF0Y2ggbmFtZScpO1xuICAgIH1cbiAgICB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuYWRkKGFjdGl2YXRpb24ucGF0Y2hJZCk7XG4gIH1cblxuICBwdWJsaWMgcGF0Y2hJbnRlcm5hbChwYXRjaElkOiBzdHJpbmcsIGRlcHJlY2F0ZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy53b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1BhdGNoZXMgY2Fubm90IGJlIHVzZWQgYmVmb3JlIFdvcmtmbG93IHN0YXJ0cycpO1xuICAgIH1cbiAgICBjb25zdCB1c2VQYXRjaCA9ICF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nIHx8IHRoaXMua25vd25QcmVzZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCk7XG4gICAgLy8gQXZvaWQgc2VuZGluZyBjb21tYW5kcyBmb3IgcGF0Y2hlcyBjb3JlIGFscmVhZHkga25vd3MgYWJvdXQuXG4gICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gZW5hYmxlcyBkZXZlbG9wbWVudCBvZiBhdXRvbWF0aWMgcGF0Y2hpbmcgdG9vbHMuXG4gICAgaWYgKHVzZVBhdGNoICYmICF0aGlzLnNlbnRQYXRjaGVzLmhhcyhwYXRjaElkKSkge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICAgIHNldFBhdGNoTWFya2VyOiB7IHBhdGNoSWQsIGRlcHJlY2F0ZWQgfSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zZW50UGF0Y2hlcy5hZGQocGF0Y2hJZCk7XG4gICAgfVxuICAgIHJldHVybiB1c2VQYXRjaDtcbiAgfVxuXG4gIC8vIENhbGxlZCBlYXJseSB3aGlsZSBoYW5kbGluZyBhbiBhY3RpdmF0aW9uIHRvIHJlZ2lzdGVyIGtub3duIGZsYWdzXG4gIHB1YmxpYyBhZGRLbm93bkZsYWdzKGZsYWdzOiBudW1iZXJbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZmxhZyBvZiBmbGFncykge1xuICAgICAgYXNzZXJ0VmFsaWRGbGFnKGZsYWcpO1xuICAgICAgdGhpcy5rbm93bkZsYWdzLmFkZChmbGFnKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaGFzRmxhZyhmbGFnOiBTZGtGbGFnKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMua25vd25GbGFncy5oYXMoZmxhZy5pZCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgJiYgZmxhZy5kZWZhdWx0KSB7XG4gICAgICB0aGlzLmtub3duRmxhZ3MuYWRkKGZsYWcuaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVGcm9tQ2FjaGUoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdyZW1vdmVGcm9tQ2FjaGUgYWN0aXZhdGlvbiBqb2Igc2hvdWxkIG5vdCByZWFjaCB3b3JrZmxvdycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgZmFpbHVyZXMgaW50byBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBVc2VkIHRvIGhhbmRsZSBhbnkgZmFpbHVyZSBlbWl0dGVkIGJ5IHRoZSBXb3JrZmxvdy5cbiAgICovXG4gIGFzeW5jIGhhbmRsZVdvcmtmbG93RmFpbHVyZShlcnJvcjogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCAmJiBpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjYW5jZWxXb3JrZmxvd0V4ZWN1dGlvbjoge30gfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb246IGVycm9yLmNvbW1hbmQgfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSkge1xuICAgICAgICAvLyBUaGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIHJlamVjdGlvbiB3aGljaCB3aWxsIGZhaWwgdGhlIGFjdGl2YXRpb25cbiAgICAgICAgLy8gcHJldmVudGluZyBpdCBmcm9tIGNvbXBsZXRpbmcuXG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnB1c2hDb21tYW5kKFxuICAgICAgICB7XG4gICAgICAgICAgZmFpbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBmYWlsdXJlOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVycm9yKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVRdWVyeShxdWVyeUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHsgcXVlcnlJZCwgc3VjY2VlZGVkOiB7IHJlc3BvbnNlOiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCkgfSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmYWlsUXVlcnkocXVlcnlJZDogc3RyaW5nLCBlcnJvcjogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHtcbiAgICAgICAgcXVlcnlJZCxcbiAgICAgICAgZmFpbGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYWNjZXB0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7IHVwZGF0ZVJlc3BvbnNlOiB7IHByb3RvY29sSW5zdGFuY2VJZCwgYWNjZXB0ZWQ6IHt9IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlVXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nLCByZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHVwZGF0ZVJlc3BvbnNlOiB7IHByb3RvY29sSW5zdGFuY2VJZCwgY29tcGxldGVkOiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCkgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nLCBlcnJvcjogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgdXBkYXRlUmVzcG9uc2U6IHtcbiAgICAgICAgcHJvdG9jb2xJbnN0YW5jZUlkLFxuICAgICAgICByZWplY3RlZDogdGhpcy5lcnJvclRvRmFpbHVyZShlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyb3IpKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKiogQ29uc3VtZSBhIGNvbXBsZXRpb24gaWYgaXQgZXhpc3RzIGluIFdvcmtmbG93IHN0YXRlICovXG4gIHByaXZhdGUgbWF5YmVDb25zdW1lQ29tcGxldGlvbih0eXBlOiBrZXlvZiBBY3RpdmF0b3JbJ2NvbXBsZXRpb25zJ10sIHRhc2tTZXE6IG51bWJlcik6IENvbXBsZXRpb24gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLmNvbXBsZXRpb25zW3R5cGVdLmdldCh0YXNrU2VxKTtcbiAgICBpZiAoY29tcGxldGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbXBsZXRpb25zW3R5cGVdLmRlbGV0ZSh0YXNrU2VxKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cblxuICAvKiogQ29uc3VtZSBhIGNvbXBsZXRpb24gaWYgaXQgZXhpc3RzIGluIFdvcmtmbG93IHN0YXRlLCB0aHJvd3MgaWYgaXQgZG9lc24ndCAqL1xuICBwcml2YXRlIGNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMubWF5YmVDb25zdW1lQ29tcGxldGlvbih0eXBlLCB0YXNrU2VxKTtcbiAgICBpZiAoY29tcGxldGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIGNvbXBsZXRpb24gZm9yIHRhc2tTZXEgJHt0YXNrU2VxfWApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVXb3JrZmxvdyhyZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKFxuICAgICAge1xuICAgICAgICBjb21wbGV0ZVdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgcmVzdWx0OiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24pOiBQcm90b0ZhaWx1cmUge1xuICAgIHJldHVybiB0aGlzLmZhaWx1cmVDb252ZXJ0ZXIuZXJyb3JUb0ZhaWx1cmUoZXJyLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlKTogRXJyb3Ige1xuICAgIHJldHVybiB0aGlzLmZhaWx1cmVDb252ZXJ0ZXIuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSwgdGhpcy5wYXlsb2FkQ29udmVydGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTZXE8VCBleHRlbmRzIHsgc2VxPzogbnVtYmVyIHwgbnVsbCB9PihhY3RpdmF0aW9uOiBUKTogbnVtYmVyIHtcbiAgY29uc3Qgc2VxID0gYWN0aXZhdGlvbi5zZXE7XG4gIGlmIChzZXEgPT09IHVuZGVmaW5lZCB8fCBzZXEgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBHb3QgYWN0aXZhdGlvbiB3aXRoIG5vIHNlcSBhdHRyaWJ1dGVgKTtcbiAgfVxuICByZXR1cm4gc2VxO1xufVxuIiwiaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IFNka0NvbXBvbmVudCB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyB0eXBlIFNpbmssIHR5cGUgU2lua3MsIHByb3h5U2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbmZvLCBDb250aW51ZUFzTmV3IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0IH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dMb2dnZXIgZXh0ZW5kcyBTaW5rIHtcbiAgdHJhY2UobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqXG4gKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBleHRlbmRzIFNpbmtzIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgZGVmYXVsdFdvcmtlckxvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJTaW5rc0ludGVybmFsIGV4dGVuZHMgU2lua3Mge1xuICBfX3RlbXBvcmFsX2xvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbmNvbnN0IGxvZ2dlclNpbmsgPSBwcm94eVNpbmtzPExvZ2dlclNpbmtzSW50ZXJuYWw+KCkuX190ZW1wb3JhbF9sb2dnZXI7XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgYnkgdGhlIFNESyBsb2dnZXIgdG8gZXh0cmFjdCBhIHRpbWVzdGFtcCBmcm9tIGxvZyBhdHRyaWJ1dGVzLlxuICogQWxzbyBkZWZpbmVkIGluIGB3b3JrZXIvbG9nZ2VyLnRzYCAtIGludGVudGlvbmFsbHkgbm90IHNoYXJlZC5cbiAqL1xuY29uc3QgTG9nVGltZXN0YW1wID0gU3ltYm9sLmZvcignbG9nX3RpbWVzdGFtcCcpO1xuXG4vKipcbiAqIERlZmF1bHQgd29ya2Zsb3cgbG9nZ2VyLlxuICpcbiAqIFRoaXMgbG9nZ2VyIGlzIHJlcGxheS1hd2FyZSBhbmQgd2lsbCBvbWl0IGxvZyBtZXNzYWdlcyBvbiB3b3JrZmxvdyByZXBsYXkuIE1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhpcyBsb2dnZXIgYXJlXG4gKiBmdW5uZWxsZWQgdGhyb3VnaCBhIHNpbmsgdGhhdCBmb3J3YXJkcyB0aGVtIHRvIHRoZSBsb2dnZXIgcmVnaXN0ZXJlZCBvbiB7QGxpbmsgUnVudGltZS5sb2dnZXJ9LlxuICpcbiAqIEF0dHJpYnV0ZXMgZnJvbSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb24gY29udGV4dCBhcmUgYXV0b21hdGljYWxseSBpbmNsdWRlZCBhcyBtZXRhZGF0YSBvbiBldmVyeSBsb2dcbiAqIGVudHJpZXMuIEFuIGV4dHJhIGBzZGtDb21wb25lbnRgIG1ldGFkYXRhIGF0dHJpYnV0ZSBpcyBhbHNvIGFkZGVkLCB3aXRoIHZhbHVlIGB3b3JrZmxvd2A7IHRoaXMgY2FuIGJlIHVzZWQgZm9yXG4gKiBmaW5lLWdyYWluZWQgZmlsdGVyaW5nIG9mIGxvZyBlbnRyaWVzIGZ1cnRoZXIgZG93bnN0cmVhbS5cbiAqXG4gKiBUbyBjdXN0b21pemUgbG9nIGF0dHJpYnV0ZXMsIHJlZ2lzdGVyIGEge0BsaW5rIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yfSB0aGF0IGludGVyY2VwdHMgdGhlXG4gKiBgZ2V0TG9nQXR0cmlidXRlcygpYCBtZXRob2QuXG4gKlxuICogTm90aWNlIHRoYXQgc2luY2Ugc2lua3MgYXJlIHVzZWQgdG8gcG93ZXIgdGhpcyBsb2dnZXIsIGFueSBsb2cgYXR0cmlidXRlcyBtdXN0IGJlIHRyYW5zZmVyYWJsZSB2aWEgdGhlXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9XG4gKiBBUEkuXG4gKlxuICogTk9URTogU3BlY2lmeWluZyBhIGN1c3RvbSBsb2dnZXIgdGhyb3VnaCB7QGxpbmsgZGVmYXVsdFNpbmt9IG9yIGJ5IG1hbnVhbGx5IHJlZ2lzdGVyaW5nIGEgc2luayBuYW1lZFxuICogYGRlZmF1bHRXb3JrZXJMb2dnZXJgIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2Uge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgbG9nOiBXb3JrZmxvd0xvZ2dlciA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgKFsndHJhY2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10gYXMgQXJyYXk8a2V5b2YgV29ya2Zsb3dMb2dnZXI+KS5tYXAoKGxldmVsKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIGxldmVsLFxuICAgICAgKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cubG9nKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIHdvcmtmbG93IGNvbnRleHQuJyk7XG4gICAgICAgIGNvbnN0IGdldExvZ0F0dHJpYnV0ZXMgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdnZXRMb2dBdHRyaWJ1dGVzJywgKGEpID0+IGEpO1xuICAgICAgICByZXR1cm4gbG9nZ2VyU2lua1tsZXZlbF0obWVzc2FnZSwge1xuICAgICAgICAgIC8vIEluamVjdCB0aGUgY2FsbCB0aW1lIGluIG5hbm9zZWNvbmQgcmVzb2x1dGlvbiBhcyBleHBlY3RlZCBieSB0aGUgd29ya2VyIGxvZ2dlci5cbiAgICAgICAgICBbTG9nVGltZXN0YW1wXTogYWN0aXZhdG9yLmdldFRpbWVPZkRheSgpLFxuICAgICAgICAgIHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtmbG93LFxuICAgICAgICAgIC4uLmdldExvZ0F0dHJpYnV0ZXMod29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGFjdGl2YXRvci5pbmZvKSksXG4gICAgICAgICAgLi4uYXR0cnMsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICBdO1xuICB9KVxuKSBhcyBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcoZm46ICgpID0+IFByb21pc2U8dW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgbG9nLmRlYnVnKCdXb3JrZmxvdyBzdGFydGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gIGNvbnN0IHAgPSBmbigpLnRoZW4oXG4gICAgKHJlcykgPT4ge1xuICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIC8vIEF2b2lkIHVzaW5nIGluc3RhbmNlb2YgY2hlY2tzIGluIGNhc2UgdGhlIG1vZHVsZXMgdGhleSdyZSBkZWZpbmVkIGluIGxvYWRlZCBtb3JlIHRoYW4gb25jZSxcbiAgICAgIC8vIGUuZy4gYnkgamVzdCBvciB3aGVuIG11bHRpcGxlIHZlcnNpb25zIGFyZSBpbnN0YWxsZWQuXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbXBsZXRlZCBhcyBjYW5jZWxsZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbG9nLndhcm4oJ1dvcmtmbG93IGZhaWxlZCcsIHsgZXJyb3IsIHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgKTtcbiAgLy8gQXZvaWQgc2hvd2luZyB0aGlzIGludGVyY2VwdG9yIGluIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gIHVudHJhY2tQcm9taXNlKHApO1xuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwIG9mIGF0dHJpYnV0ZXMgdG8gYmUgc2V0IF9ieSBkZWZhdWx0XyBvbiBsb2cgbWVzc2FnZXMgZm9yIGEgZ2l2ZW4gV29ya2Zsb3cuXG4gKiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBtYXkgYmUgY2FsbGVkIGZyb20gb3V0c2lkZSBvZiB0aGUgV29ya2Zsb3cgY29udGV4dCAoZWcuIGJ5IHRoZSB3b3JrZXIgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93TG9nQXR0cmlidXRlcyhpbmZvOiBXb3JrZmxvd0luZm8pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB7XG4gICAgbmFtZXNwYWNlOiBpbmZvLm5hbWVzcGFjZSxcbiAgICB0YXNrUXVldWU6IGluZm8udGFza1F1ZXVlLFxuICAgIHdvcmtmbG93SWQ6IGluZm8ud29ya2Zsb3dJZCxcbiAgICBydW5JZDogaW5mby5ydW5JZCxcbiAgICB3b3JrZmxvd1R5cGU6IGluZm8ud29ya2Zsb3dUeXBlLFxuICB9O1xufVxuIiwiLy8gLi4vcGFja2FnZS5qc29uIGlzIG91dHNpZGUgb2YgdGhlIFRTIHByb2plY3Qgcm9vdERpciB3aGljaCBjYXVzZXMgVFMgdG8gY29tcGxhaW4gYWJvdXQgdGhpcyBpbXBvcnQuXG4vLyBXZSBkbyBub3Qgd2FudCB0byBjaGFuZ2UgdGhlIHJvb3REaXIgYmVjYXVzZSBpdCBtZXNzZXMgdXAgdGhlIG91dHB1dCBzdHJ1Y3R1cmUuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGtnIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IHBrZyBhcyB7IG5hbWU6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH07XG4iLCIvKipcbiAqIFR5cGUgZGVmaW5pdGlvbnMgZm9yIHRoZSBXb3JrZmxvdyBlbmQgb2YgdGhlIHNpbmtzIG1lY2hhbmlzbS5cbiAqXG4gKiBTaW5rcyBhcmUgYSBtZWNoYW5pc20gZm9yIGV4cG9ydGluZyBkYXRhIGZyb20gdGhlIFdvcmtmbG93IGlzb2xhdGUgdG8gdGhlXG4gKiBOb2RlLmpzIGVudmlyb25tZW50LCB0aGV5IGFyZSBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgV29ya2Zsb3cgaGFzIG5vIHdheSB0b1xuICogY29tbXVuaWNhdGUgd2l0aCB0aGUgb3V0c2lkZSBXb3JsZC5cbiAqXG4gKiBTaW5rcyBhcmUgdHlwaWNhbGx5IHVzZWQgZm9yIGV4cG9ydGluZyBsb2dzLCBtZXRyaWNzIGFuZCB0cmFjZXMgb3V0IGZyb20gdGhlXG4gKiBXb3JrZmxvdy5cbiAqXG4gKiBTaW5rIGZ1bmN0aW9ucyBtYXkgbm90IHJldHVybiB2YWx1ZXMgdG8gdGhlIFdvcmtmbG93IGluIG9yZGVyIHRvIHByZXZlbnRcbiAqIGJyZWFraW5nIGRldGVybWluaXNtLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBXb3JrZmxvd0luZm8gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuLyoqXG4gKiBBbnkgZnVuY3Rpb24gc2lnbmF0dXJlIGNhbiBiZSB1c2VkIGZvciBTaW5rIGZ1bmN0aW9ucyBhcyBsb25nIGFzIHRoZSByZXR1cm4gdHlwZSBpcyBgdm9pZGAuXG4gKlxuICogV2hlbiBjYWxsaW5nIGEgU2luayBmdW5jdGlvbiwgYXJndW1lbnRzIGFyZSBjb3BpZWQgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGUgTm9kZS5qcyBlbnZpcm9ubWVudCB1c2luZ1xuICoge0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvd29ya2VyX3RocmVhZHMuaHRtbCN3b3JrZXJfdGhyZWFkc19wb3J0X3Bvc3RtZXNzYWdlX3ZhbHVlX3RyYW5zZmVybGlzdCB8IHBvc3RNZXNzYWdlfS5cblxuICogVGhpcyBjb25zdHJhaW5zIHRoZSBhcmd1bWVudCB0eXBlcyB0byBwcmltaXRpdmVzIChleGNsdWRpbmcgU3ltYm9scykuXG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtGdW5jdGlvbiA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuLyoqIEEgbWFwcGluZyBvZiBuYW1lIHRvIGZ1bmN0aW9uLCBkZWZpbmVzIGEgc2luZ2xlIHNpbmsgKGUuZy4gbG9nZ2VyKSAqL1xuZXhwb3J0IHR5cGUgU2luayA9IFJlY29yZDxzdHJpbmcsIFNpbmtGdW5jdGlvbj47XG4vKipcbiAqIFdvcmtmbG93IFNpbmsgYXJlIGEgbWFwcGluZyBvZiBuYW1lIHRvIHtAbGluayBTaW5rfVxuICovXG5leHBvcnQgdHlwZSBTaW5rcyA9IFJlY29yZDxzdHJpbmcsIFNpbms+O1xuXG4vKipcbiAqIENhbGwgaW5mb3JtYXRpb24gZm9yIGEgU2lua1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpbmtDYWxsIHtcbiAgaWZhY2VOYW1lOiBzdHJpbmc7XG4gIGZuTmFtZTogc3RyaW5nO1xuICBhcmdzOiBhbnlbXTtcbiAgd29ya2Zsb3dJbmZvOiBXb3JrZmxvd0luZm87XG59XG5cbi8qKlxuICogR2V0IGEgcmVmZXJlbmNlIHRvIFNpbmtzIGZvciBleHBvcnRpbmcgZGF0YSBvdXQgb2YgdGhlIFdvcmtmbG93LlxuICpcbiAqIFRoZXNlIFNpbmtzICoqbXVzdCoqIGJlIHJlZ2lzdGVyZWQgd2l0aCB0aGUgV29ya2VyIGluIG9yZGVyIGZvciB0aGlzXG4gKiBtZWNoYW5pc20gdG8gd29yay5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHByb3h5U2lua3MsIFNpbmtzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqIGludGVyZmFjZSBNeVNpbmtzIGV4dGVuZHMgU2lua3Mge1xuICogICBsb2dnZXI6IHtcbiAqICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gKiAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgfTtcbiAqIH1cbiAqXG4gKiBjb25zdCB7IGxvZ2dlciB9ID0gcHJveHlTaW5rczxNeURlcGVuZGVuY2llcz4oKTtcbiAqIGxvZ2dlci5pbmZvKCdzZXR0aW5nIHVwJyk7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAqICAgICAgIGxvZ2dlci5pbmZvKFwiaGV5IGhvXCIpO1xuICogICAgICAgbG9nZ2VyLmVycm9yKFwibGV0cyBnb1wiKTtcbiAqICAgICB9XG4gKiAgIH07XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5U2lua3M8VCBleHRlbmRzIFNpbmtzPigpOiBUIHtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgaWZhY2VOYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoXG4gICAgICAgICAge30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZ2V0KF8sIGZuTmFtZSkge1xuICAgICAgICAgICAgICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgICAgICAgICAgICAgICAnUHJveGllZCBzaW5rcyBmdW5jdGlvbnMgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFjdGl2YXRvci5zaW5rQ2FsbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBpZmFjZU5hbWU6IGlmYWNlTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICBmbk5hbWU6IGZuTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAvLyBTaW5rIGZ1bmN0aW9uIGRvZXNuJ3QgZ2V0IGNhbGxlZCBpbW1lZGlhdGVseS4gTWFrZSBhIGNsb25lIG9mIHRoZSBzaW5rJ3MgYXJncywgc28gdGhhdCBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlc2Ugb2JqZWN0cyBkb24ndCBjb3JydXB0IHRoZSBhcmdzIHRoYXQgdGhlIHNpbmsgZnVuY3Rpb24gd2lsbCByZWNlaXZlLiBPbmx5IGF2YWlsYWJsZSBmcm9tIG5vZGUgMTcuXG4gICAgICAgICAgICAgICAgICBhcmdzOiAoZ2xvYmFsVGhpcyBhcyBhbnkpLnN0cnVjdHVyZWRDbG9uZSA/IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lKGFyZ3MpIDogYXJncyxcbiAgICAgICAgICAgICAgICAgIC8vIGFjdGl2YXRvci5pbmZvIGlzIGludGVybmFsbHkgY29weS1vbi13cml0ZS4gVGhpcyBlbnN1cmUgdGhhdCBhbnkgZnVydGhlciBtdXRhdGlvbnNcbiAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSB3b3JrZmxvdyBzdGF0ZSBpbiB0aGUgY29udGV4dCBvZiB0aGUgcHJlc2VudCBhY3RpdmF0aW9uIHdpbGwgbm90IGNvcnJ1cHQgdGhlXG4gICAgICAgICAgICAgICAgICAvLyB3b3JrZmxvd0luZm8gc3RhdGUgdGhhdCBnZXRzIHBhc3NlZCB3aGVuIHRoZSBzaW5rIGZ1bmN0aW9uIGFjdHVhbGx5IGdldHMgY2FsbGVkLlxuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dJbmZvOiBhY3RpdmF0b3IuaW5mbyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuIiwiaW1wb3J0IHsgbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgdHlwZSB7IFByb21pc2VTdGFja1N0b3JlIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byByZW1vdmUgYSBwcm9taXNlIGZyb20gYmVpbmcgdHJhY2tlZCBmb3Igc3RhY2sgdHJhY2UgcXVlcnkgcHVycG9zZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVudHJhY2tQcm9taXNlKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pOiB2b2lkIHtcbiAgY29uc3Qgc3RvcmUgPSAobWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgYW55KT8ucHJvbWlzZVN0YWNrU3RvcmUgYXMgUHJvbWlzZVN0YWNrU3RvcmUgfCB1bmRlZmluZWQ7XG4gIGlmICghc3RvcmUpIHJldHVybjtcbiAgc3RvcmUuY2hpbGRUb1BhcmVudC5kZWxldGUocHJvbWlzZSk7XG4gIHN0b3JlLnByb21pc2VUb1N0YWNrLmRlbGV0ZShwcm9taXNlKTtcbn1cbiIsImltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG4vKipcbiAqIEEgYFByb21pc2VMaWtlYCBoZWxwZXIgd2hpY2ggZXhwb3NlcyBpdHMgYHJlc29sdmVgIGFuZCBgcmVqZWN0YCBtZXRob2RzLlxuICpcbiAqIFRyaWdnZXIgaXMgQ2FuY2VsbGF0aW9uU2NvcGUtYXdhcmU6IGl0IGlzIGxpbmtlZCB0byB0aGUgY3VycmVudCBzY29wZSBvblxuICogY29uc3RydWN0aW9uIGFuZCB0aHJvd3Mgd2hlbiB0aGF0IHNjb3BlIGlzIGNhbmNlbGxlZC5cbiAqXG4gKiBVc2VmdWwgZm9yIGUuZy4gd2FpdGluZyBmb3IgdW5ibG9ja2luZyBhIFdvcmtmbG93IGZyb20gYSBTaWduYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC10cmlnZ2VyLXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICovXG5leHBvcnQgY2xhc3MgVHJpZ2dlcjxUPiBpbXBsZW1lbnRzIFByb21pc2VMaWtlPFQ+IHtcbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCByZWFsaXplIHRoYXQgdGhlIHByb21pc2UgZXhlY3V0b3IgaXMgcnVuIHN5bmNocm9ub3VzbHkgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcHJvbWlzZTogUHJvbWlzZTxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICB9XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gICAgLy8gQXZvaWQgdW5oYW5kbGVkIHJlamVjdGlvbnNcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gIH1cblxuICB0aGVuPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4oXG4gICAgb25mdWxmaWxsZWQ/OiAoKHZhbHVlOiBUKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsXG4gICk6IFByb21pc2VMaWtlPFRSZXN1bHQxIHwgVFJlc3VsdDI+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9taXNlLnRoZW4ob25mdWxmaWxsZWQsIG9ucmVqZWN0ZWQpO1xuICB9XG59XG4iLCIvKipcbiAqIEV4cG9ydGVkIGZ1bmN0aW9ucyBmb3IgdGhlIFdvcmtlciB0byBpbnRlcmFjdCB3aXRoIHRoZSBXb3JrZmxvdyBpc29sYXRlXG4gKlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB0c1RvTXMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBkaXNhYmxlU3RvcmFnZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFjdGl2YXRvciB9IGZyb20gJy4vaW50ZXJuYWxzJztcbmltcG9ydCB7IHNldEFjdGl2YXRvclVudHlwZWQsIGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgdHlwZSBTaW5rQ2FsbCB9IGZyb20gJy4vc2lua3MnO1xuXG4vLyBFeHBvcnQgdGhlIHR5cGUgZm9yIHVzZSBvbiB0aGUgXCJ3b3JrZXJcIiBzaWRlXG5leHBvcnQgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgaXNvbGF0ZSBydW50aW1lLlxuICpcbiAqIFNldHMgcmVxdWlyZWQgaW50ZXJuYWwgc3RhdGUgYW5kIGluc3RhbnRpYXRlcyB0aGUgd29ya2Zsb3cgYW5kIGludGVyY2VwdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRSdW50aW1lKG9wdGlvbnM6IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG5ldyBBY3RpdmF0b3Ioe1xuICAgIC4uLm9wdGlvbnMsXG4gICAgaW5mbzogZml4UHJvdG90eXBlcyh7XG4gICAgICAuLi5vcHRpb25zLmluZm8sXG4gICAgICB1bnNhZmU6IHsgLi4ub3B0aW9ucy5pbmZvLnVuc2FmZSwgbm93OiBPcmlnaW5hbERhdGUubm93IH0sXG4gICAgfSksXG4gIH0pO1xuICAvLyBUaGVyZSdzIG9uIGFjdGl2YXRvciBwZXIgd29ya2Zsb3cgaW5zdGFuY2UsIHNldCBpdCBnbG9iYWxseSBvbiB0aGUgY29udGV4dC5cbiAgLy8gV2UgZG8gdGhpcyBiZWZvcmUgaW1wb3J0aW5nIGFueSB1c2VyIGNvZGUgc28gdXNlciBjb2RlIGNhbiBzdGF0aWNhbGx5IHJlZmVyZW5jZSBAdGVtcG9yYWxpby93b3JrZmxvdyBmdW5jdGlvbnNcbiAgLy8gYXMgd2VsbCBhcyBEYXRlIGFuZCBNYXRoLnJhbmRvbS5cbiAgc2V0QWN0aXZhdG9yVW50eXBlZChhY3RpdmF0b3IpO1xuXG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gcGF5bG9hZENvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgY29uc3QgY3VzdG9tUGF5bG9hZENvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyJykucGF5bG9hZENvbnZlcnRlcjtcbiAgLy8gVGhlIGBwYXlsb2FkQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyID0gY3VzdG9tUGF5bG9hZENvbnZlcnRlcjtcbiAgfVxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIGZhaWx1cmVDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIGNvbnN0IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlcicpLmZhaWx1cmVDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgZmFpbHVyZUNvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21GYWlsdXJlQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IuZmFpbHVyZUNvbnZlcnRlciA9IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXI7XG4gIH1cblxuICBjb25zdCB7IGltcG9ydFdvcmtmbG93cywgaW1wb3J0SW50ZXJjZXB0b3JzIH0gPSBnbG9iYWwuX19URU1QT1JBTF9fO1xuICBpZiAoaW1wb3J0V29ya2Zsb3dzID09PSB1bmRlZmluZWQgfHwgaW1wb3J0SW50ZXJjZXB0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGJ1bmRsZSBkaWQgbm90IHJlZ2lzdGVyIGltcG9ydCBob29rcycpO1xuICB9XG5cbiAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW1wb3J0SW50ZXJjZXB0b3JzKCk7XG4gIGZvciAoY29uc3QgbW9kIG9mIGludGVyY2VwdG9ycykge1xuICAgIGNvbnN0IGZhY3Rvcnk6IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9IG1vZC5pbnRlcmNlcHRvcnM7XG4gICAgaWYgKGZhY3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBmYWN0b3J5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93cyBpbnRlcmNlcHRvcnM6IGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke2ZhY3Rvcnl9J2ApO1xuICAgICAgfVxuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gZmFjdG9yeSgpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbmJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbmJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5vdXRib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMucHVzaCguLi4oaW50ZXJjZXB0b3JzLmludGVybmFscyA/PyBbXSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1vZCA9IGltcG9ydFdvcmtmbG93cygpO1xuICBjb25zdCB3b3JrZmxvd0ZuID0gbW9kW2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZV07XG4gIGNvbnN0IGRlZmF1bHRXb3JrZmxvd0ZuID0gbW9kWydkZWZhdWx0J107XG5cbiAgaWYgKHR5cGVvZiB3b3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gd29ya2Zsb3dGbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdFdvcmtmbG93Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3Iud29ya2Zsb3cgPSBkZWZhdWx0V29ya2Zsb3dGbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZXRhaWxzID1cbiAgICAgIHdvcmtmbG93Rm4gPT09IHVuZGVmaW5lZFxuICAgICAgICA/ICdubyBzdWNoIGZ1bmN0aW9uIGlzIGV4cG9ydGVkIGJ5IHRoZSB3b3JrZmxvdyBidW5kbGUnXG4gICAgICAgIDogYGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke3R5cGVvZiB3b3JrZmxvd0ZufSdgO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93IG9mIHR5cGUgJyR7YWN0aXZhdG9yLmluZm8ud29ya2Zsb3dUeXBlfSc6ICR7ZGV0YWlsc31gKTtcbiAgfVxufVxuXG4vKipcbiAqIE9iamVjdHMgdHJhbnNmZXJlZCB0byB0aGUgVk0gZnJvbSBvdXRzaWRlIGhhdmUgcHJvdG90eXBlcyBiZWxvbmdpbmcgdG8gdGhlXG4gKiBvdXRlciBjb250ZXh0LCB3aGljaCBtZWFucyB0aGF0IGluc3RhbmNlb2Ygd29uJ3Qgd29yayBpbnNpZGUgdGhlIFZNLiBUaGlzXG4gKiBmdW5jdGlvbiByZWN1cnNpdmVseSB3YWxrcyBvdmVyIHRoZSBjb250ZW50IG9mIGFuIG9iamVjdCwgYW5kIHJlY3JlYXRlIHNvbWVcbiAqIG9mIHRoZXNlIG9iamVjdHMgKG5vdGFibHkgQXJyYXksIERhdGUgYW5kIE9iamVjdHMpLlxuICovXG5mdW5jdGlvbiBmaXhQcm90b3R5cGVzPFg+KG9iajogWCk6IFgge1xuICBpZiAob2JqICE9IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICBzd2l0Y2ggKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopPy5jb25zdHJ1Y3Rvcj8ubmFtZSkge1xuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSgob2JqIGFzIEFycmF5PHVua25vd24+KS5tYXAoZml4UHJvdG90eXBlcykpIGFzIFg7XG4gICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iaiBhcyB1bmtub3duIGFzIERhdGUpIGFzIFg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChbaywgdl0pOiBbc3RyaW5nLCBhbnldID0+IFtrLCBmaXhQcm90b3R5cGVzKHYpXSkpIGFzIFg7XG4gICAgfVxuICB9IGVsc2UgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBSdW4gYSBjaHVuayBvZiBhY3RpdmF0aW9uIGpvYnNcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgam9iIHdhcyBwcm9jZXNzZWQgb3IgaWdub3JlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbiwgYmF0Y2hJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnYWN0aXZhdGUnLCAoeyBhY3RpdmF0aW9uLCBiYXRjaEluZGV4IH0pID0+IHtcbiAgICBpZiAoYmF0Y2hJbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFhY3RpdmF0aW9uLmpvYnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGFjdGl2YXRpb24gd2l0aCBubyBqb2JzJyk7XG4gICAgICB9XG4gICAgICBpZiAoYWN0aXZhdGlvbi50aW1lc3RhbXAgIT0gbnVsbCkge1xuICAgICAgICAvLyB0aW1lc3RhbXAgd2lsbCBub3QgYmUgdXBkYXRlZCBmb3IgYWN0aXZhdGlvbiB0aGF0IGNvbnRhaW4gb25seSBxdWVyaWVzXG4gICAgICAgIGFjdGl2YXRvci5ub3cgPSB0c1RvTXMoYWN0aXZhdGlvbi50aW1lc3RhbXApO1xuICAgICAgfVxuICAgICAgYWN0aXZhdG9yLmFkZEtub3duRmxhZ3MoYWN0aXZhdGlvbi5hdmFpbGFibGVJbnRlcm5hbEZsYWdzID8/IFtdKTtcblxuICAgICAgLy8gVGhlIFJ1c3QgQ29yZSBlbnN1cmVzIHRoYXQgdGhlc2UgYWN0aXZhdGlvbiBmaWVsZHMgYXJlIG5vdCBudWxsXG4gICAgICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvKSA9PiAoe1xuICAgICAgICAuLi5pbmZvLFxuICAgICAgICBoaXN0b3J5TGVuZ3RoOiBhY3RpdmF0aW9uLmhpc3RvcnlMZW5ndGggYXMgbnVtYmVyLFxuICAgICAgICAvLyBFeGFjdCB0cnVuY2F0aW9uIGZvciBtdWx0aS1wZXRhYnl0ZSBoaXN0b3JpZXNcbiAgICAgICAgLy8gaGlzdG9yeVNpemUgPT09IDAgbWVhbnMgV0ZUIHdhcyBnZW5lcmF0ZWQgYnkgcHJlLTEuMjAuMCBzZXJ2ZXIsIGFuZCB0aGUgaGlzdG9yeSBzaXplIGlzIHVua25vd25cbiAgICAgICAgaGlzdG9yeVNpemU6IGFjdGl2YXRpb24uaGlzdG9yeVNpemVCeXRlcz8udG9OdW1iZXIoKSB8fCAwLFxuICAgICAgICBjb250aW51ZUFzTmV3U3VnZ2VzdGVkOiBhY3RpdmF0aW9uLmNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQgPz8gZmFsc2UsXG4gICAgICAgIGN1cnJlbnRCdWlsZElkOiBhY3RpdmF0aW9uLmJ1aWxkSWRGb3JDdXJyZW50VGFzayA/PyB1bmRlZmluZWQsXG4gICAgICAgIHVuc2FmZToge1xuICAgICAgICAgIC4uLmluZm8udW5zYWZlLFxuICAgICAgICAgIGlzUmVwbGF5aW5nOiBhY3RpdmF0aW9uLmlzUmVwbGF5aW5nID8/IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIENhc3QgZnJvbSB0aGUgaW50ZXJmYWNlIHRvIHRoZSBjbGFzcyB3aGljaCBoYXMgdGhlIGB2YXJpYW50YCBhdHRyaWJ1dGUuXG4gICAgLy8gVGhpcyBpcyBzYWZlIGJlY2F1c2Ugd2Uga25vdyB0aGF0IGFjdGl2YXRpb24gaXMgYSBwcm90byBjbGFzcy5cbiAgICBjb25zdCBqb2JzID0gYWN0aXZhdGlvbi5qb2JzIGFzIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb25Kb2JbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGlmIChqb2IudmFyaWFudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGpvYi52YXJpYW50IHRvIGJlIGRlZmluZWQnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdmFyaWFudCA9IGpvYltqb2IudmFyaWFudF07XG4gICAgICBpZiAoIXZhcmlhbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgam9iLiR7am9iLnZhcmlhbnR9IHRvIGJlIHNldGApO1xuICAgICAgfVxuICAgICAgLy8gVGhlIG9ubHkgam9iIHRoYXQgY2FuIGJlIGV4ZWN1dGVkIG9uIGEgY29tcGxldGVkIHdvcmtmbG93IGlzIGEgcXVlcnkuXG4gICAgICAvLyBXZSBtaWdodCBnZXQgb3RoZXIgam9icyBhZnRlciBjb21wbGV0aW9uIGZvciBpbnN0YW5jZSB3aGVuIGEgc2luZ2xlXG4gICAgICAvLyBhY3RpdmF0aW9uIGNvbnRhaW5zIG11bHRpcGxlIGpvYnMgYW5kIHRoZSBmaXJzdCBvbmUgY29tcGxldGVzIHRoZSB3b3JrZmxvdy5cbiAgICAgIGlmIChhY3RpdmF0b3IuY29tcGxldGVkICYmIGpvYi52YXJpYW50ICE9PSAncXVlcnlXb3JrZmxvdycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYWN0aXZhdG9yW2pvYi52YXJpYW50XSh2YXJpYW50IGFzIGFueSAvKiBUUyBjYW4ndCBpbmZlciB0aGlzIHR5cGUgKi8pO1xuICAgICAgaWYgKHNob3VsZFVuYmxvY2tDb25kaXRpb25zKGpvYikpIHtcbiAgICAgICAgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpbnRlcmNlcHQoe1xuICAgIGFjdGl2YXRpb24sXG4gICAgYmF0Y2hJbmRleCxcbiAgfSk7XG59XG5cbi8qKlxuICogQ29uY2x1ZGUgYSBzaW5nbGUgYWN0aXZhdGlvbi5cbiAqIFNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgcHJvY2Vzc2luZyBhbGwgYWN0aXZhdGlvbiBqb2JzIGFuZCBxdWV1ZWQgbWljcm90YXNrcy5cbiAqXG4gKiBBY3RpdmF0aW9uIGZhaWx1cmVzIGFyZSBoYW5kbGVkIGluIHRoZSBtYWluIE5vZGUuanMgaXNvbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBjb3Jlc2RrLndvcmtmbG93X2NvbXBsZXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgYWN0aXZhdG9yLnJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJywgKGlucHV0KSA9PiBpbnB1dCk7XG4gIGNvbnN0IHsgaW5mbyB9ID0gYWN0aXZhdG9yO1xuICBjb25zdCBhY3RpdmF0aW9uQ29tcGxldGlvbiA9IGFjdGl2YXRvci5jb25jbHVkZUFjdGl2YXRpb24oKTtcbiAgY29uc3QgeyBjb21tYW5kcyB9ID0gaW50ZXJjZXB0KHsgY29tbWFuZHM6IGFjdGl2YXRpb25Db21wbGV0aW9uLmNvbW1hbmRzIH0pO1xuXG4gIHJldHVybiB7XG4gICAgcnVuSWQ6IGluZm8ucnVuSWQsXG4gICAgc3VjY2Vzc2Z1bDogeyAuLi5hY3RpdmF0aW9uQ29tcGxldGlvbiwgY29tbWFuZHMgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZFJlc2V0U2lua0NhbGxzKCk6IFNpbmtDYWxsW10ge1xuICByZXR1cm4gZ2V0QWN0aXZhdG9yKCkuZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggYWxsIGJsb2NrZWQgY29uZGl0aW9ucywgZXZhbHVhdGUgYW5kIHVuYmxvY2sgaWYgcG9zc2libGUuXG4gKlxuICogQHJldHVybnMgbnVtYmVyIG9mIHVuYmxvY2tlZCBjb25kaXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTogbnVtYmVyIHtcbiAgbGV0IG51bVVuYmxvY2tlZCA9IDA7XG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBwcmV2VW5ibG9ja2VkID0gbnVtVW5ibG9ja2VkO1xuICAgIGZvciAoY29uc3QgW3NlcSwgY29uZF0gb2YgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZW50cmllcygpKSB7XG4gICAgICBpZiAoY29uZC5mbigpKSB7XG4gICAgICAgIGNvbmQucmVzb2x2ZSgpO1xuICAgICAgICBudW1VbmJsb2NrZWQrKztcbiAgICAgICAgLy8gSXQgaXMgc2FmZSB0byBkZWxldGUgZWxlbWVudHMgZHVyaW5nIG1hcCBpdGVyYXRpb25cbiAgICAgICAgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV2VW5ibG9ja2VkID09PSBudW1VbmJsb2NrZWQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVtVW5ibG9ja2VkO1xufVxuXG4vKipcbiAqIFByZWRpY2F0ZSB1c2VkIHRvIHByZXZlbnQgdHJpZ2dlcmluZyBjb25kaXRpb25zIGZvciBub24tcXVlcnkgYW5kIG5vbi1wYXRjaCBqb2JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkVW5ibG9ja0NvbmRpdGlvbnMoam9iOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWpvYi5xdWVyeVdvcmtmbG93ICYmICFqb2Iubm90aWZ5SGFzUGF0Y2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlKCk6IHZvaWQge1xuICBjb25zdCBkaXNwb3NlID0gY29tcG9zZUludGVyY2VwdG9ycyhnZXRBY3RpdmF0b3IoKS5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnZGlzcG9zZScsIGFzeW5jICgpID0+IHtcbiAgICBkaXNhYmxlU3RvcmFnZSgpO1xuICB9KTtcbiAgZGlzcG9zZSh7fSk7XG59XG4iLCJpbXBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIGNvbXBpbGVSZXRyeVBvbGljeSxcbiAgZXh0cmFjdFdvcmtmbG93VHlwZSxcbiAgTG9jYWxBY3Rpdml0eU9wdGlvbnMsXG4gIG1hcFRvUGF5bG9hZHMsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgdG9QYXlsb2FkcyxcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFdpdGhXb3JrZmxvd0FyZ3MsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdmVyc2lvbmluZ0ludGVudFRvUHJvdG8gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3ZlcnNpb25pbmctaW50ZW50LWVudW0nO1xuaW1wb3J0IHsgRHVyYXRpb24sIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIHRzVG9NcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSwgcmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHtcbiAgQWN0aXZpdHlJbnB1dCxcbiAgTG9jYWxBY3Rpdml0eUlucHV0LFxuICBTaWduYWxXb3JrZmxvd0lucHV0LFxuICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgVGltZXJJbnB1dCxcbn0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIERlZmF1bHRTaWduYWxIYW5kbGVyLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIEhhbmRsZXIsXG4gIFF1ZXJ5SGFuZGxlck9wdGlvbnMsXG4gIFNpZ25hbEhhbmRsZXJPcHRpb25zLFxuICBVcGRhdGVIYW5kbGVyT3B0aW9ucyxcbiAgV29ya2Zsb3dJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgTG9jYWxBY3Rpdml0eURvQmFja29mZiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0LCBnZXRBY3RpdmF0b3IsIG1heWJlR2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbnJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihzbGVlcCk7XG5cbi8qKlxuICogQWRkcyBkZWZhdWx0IHZhbHVlcyB0byBgd29ya2Zsb3dJZGAgYW5kIGB3b3JrZmxvd0lkUmV1c2VQb2xpY3lgIHRvIGdpdmVuIHdvcmtmbG93IG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIG9wdHM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyB7XG4gIGNvbnN0IHsgYXJncywgd29ya2Zsb3dJZCwgLi4ucmVzdCB9ID0gb3B0cztcbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiB3b3JrZmxvd0lkID8/IHV1aWQ0KCksXG4gICAgYXJnczogKGFyZ3MgPz8gW10pIGFzIHVua25vd25bXSxcbiAgICBjYW5jZWxsYXRpb25UeXBlOiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQsXG4gICAgLi4ucmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgc3RhcnRUaW1lciBjb21tYW5kIGludG8gc3RhdGUgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuZnVuY3Rpb24gdGltZXJOZXh0SGFuZGxlcihpbnB1dDogVGltZXJJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLmRlbGV0ZShpbnB1dC5zZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICBjYW5jZWxUaW1lcjoge1xuICAgICAgICAgICAgICBzZXE6IGlucHV0LnNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc3RhcnRUaW1lcjoge1xuICAgICAgICBzZXE6IGlucHV0LnNlcSxcbiAgICAgICAgc3RhcnRUb0ZpcmVUaW1lb3V0OiBtc1RvVHMoaW5wdXQuZHVyYXRpb25NcyksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoaW5wdXQuc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXMgc2xlZXAuXG4gKlxuICogU2NoZWR1bGVzIGEgdGltZXIgb24gdGhlIFRlbXBvcmFsIHNlcnZpY2UuXG4gKlxuICogQHBhcmFtIG1zIHNsZWVwIGR1cmF0aW9uIC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfS5cbiAqIElmIGdpdmVuIGEgbmVnYXRpdmUgbnVtYmVyIG9yIDAsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcChtczogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LnNsZWVwKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJyk7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuXG4gIGNvbnN0IGR1cmF0aW9uTXMgPSBNYXRoLm1heCgxLCBtc1RvTnVtYmVyKG1zKSk7XG5cbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3N0YXJ0VGltZXInLCB0aW1lck5leHRIYW5kbGVyKTtcblxuICByZXR1cm4gZXhlY3V0ZSh7XG4gICAgZHVyYXRpb25NcyxcbiAgICBzZXEsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiB2b2lkIHtcbiAgaWYgKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVxdWlyZWQgZWl0aGVyIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgb3Igc3RhcnRUb0Nsb3NlVGltZW91dCcpO1xuICB9XG59XG5cbi8vIFVzZSBzYW1lIHZhbGlkYXRpb24gd2UgdXNlIGZvciBub3JtYWwgYWN0aXZpdGllc1xuY29uc3QgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyA9IHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zO1xuXG4vKipcbiAqIFB1c2ggYSBzY2hlZHVsZUFjdGl2aXR5IGNvbW1hbmQgaW50byBhY3RpdmF0b3IgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuZnVuY3Rpb24gc2NoZWR1bGVBY3Rpdml0eU5leHRIYW5kbGVyKHsgb3B0aW9ucywgYXJncywgaGVhZGVycywgc2VxLCBhY3Rpdml0eVR5cGUgfTogQWN0aXZpdHlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgcmVxdWVzdENhbmNlbEFjdGl2aXR5OiB7XG4gICAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2NoZWR1bGVBY3Rpdml0eToge1xuICAgICAgICBzZXEsXG4gICAgICAgIGFjdGl2aXR5SWQ6IG9wdGlvbnMuYWN0aXZpdHlJZCA/PyBgJHtzZXF9YCxcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSB8fCBhY3RpdmF0b3IuaW5mby50YXNrUXVldWUsXG4gICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuaGVhcnRiZWF0VGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb1N0YXJ0VGltZW91dCksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgZG9Ob3RFYWdlcmx5RXhlY3V0ZTogIShvcHRpb25zLmFsbG93RWFnZXJEaXNwYXRjaCA/PyB0cnVlKSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFB1c2ggYSBzY2hlZHVsZUFjdGl2aXR5IGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGFyZ3MsXG4gIGhlYWRlcnMsXG4gIHNlcSxcbiAgYWN0aXZpdHlUeXBlLFxuICBhdHRlbXB0LFxuICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbn06IExvY2FsQWN0aXZpdHlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgLy8gRWFnZXJseSBmYWlsIHRoZSBsb2NhbCBhY3Rpdml0eSAod2hpY2ggd2lsbCBpbiB0dXJuIGZhaWwgdGhlIHdvcmtmbG93IHRhc2suXG4gIC8vIERvIG5vdCBmYWlsIG9uIHJlcGxheSB3aGVyZSB0aGUgbG9jYWwgYWN0aXZpdGllcyBtYXkgbm90IGJlIHJlZ2lzdGVyZWQgb24gdGhlIHJlcGxheSB3b3JrZXIuXG4gIGlmICghYWN0aXZhdG9yLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmICFhY3RpdmF0b3IucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMuaGFzKGFjdGl2aXR5VHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYExvY2FsIGFjdGl2aXR5IG9mIHR5cGUgJyR7YWN0aXZpdHlUeXBlfScgbm90IHJlZ2lzdGVyZWQgb24gd29ya2VyYCk7XG4gIH1cbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICAgIC8vIEludGVudGlvbmFsbHkgbm90IGV4cG9zaW5nIGFjdGl2aXR5SWQgYXMgYW4gb3B0aW9uXG4gICAgICAgIGFjdGl2aXR5SWQ6IGAke3NlcX1gLFxuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBsb2NhbFJldHJ5VGhyZXNob2xkOiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmxvY2FsUmV0cnlUaHJlc2hvbGQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVBY3Rpdml0eTxSPihhY3Rpdml0eVR5cGU6IHN0cmluZywgYXJnczogYW55W10sIG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IFByb21pc2U8Uj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2NoZWR1bGVBY3Rpdml0eSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbidcbiAgKTtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBlbXB0eSBhY3Rpdml0eSBvcHRpb25zJyk7XG4gIH1cbiAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmFjdGl2aXR5Kys7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzY2hlZHVsZUFjdGl2aXR5Jywgc2NoZWR1bGVBY3Rpdml0eU5leHRIYW5kbGVyKTtcblxuICByZXR1cm4gZXhlY3V0ZSh7XG4gICAgYWN0aXZpdHlUeXBlLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIG9wdGlvbnMsXG4gICAgYXJncyxcbiAgICBzZXEsXG4gIH0pIGFzIFByb21pc2U8Uj47XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYW4gYWN0aXZpdHkgYW5kIHJ1biBvdXRib3VuZCBpbnRlcmNlcHRvcnNcbiAqIEBoaWRkZW5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlTG9jYWxBY3Rpdml0eTxSPihcbiAgYWN0aXZpdHlUeXBlOiBzdHJpbmcsXG4gIGFyZ3M6IGFueVtdLFxuICBvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9uc1xuKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zY2hlZHVsZUxvY2FsQWN0aXZpdHkoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nXG4gICk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG5cbiAgbGV0IGF0dGVtcHQgPSAxO1xuICBsZXQgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSB1bmRlZmluZWQ7XG5cbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknLFxuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXJcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgZXhlY3V0ZSh7XG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICB9KSkgYXMgUHJvbWlzZTxSPjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKHRzVG9NcyhlcnIuYmFja29mZi5iYWNrb2ZmRHVyYXRpb24pKTtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnIuYmFja29mZi5hdHRlbXB0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYmFja29mZiBhdHRlbXB0IHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICBhdHRlbXB0ID0gZXJyLmJhY2tvZmYuYXR0ZW1wdDtcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSBlcnIuYmFja29mZi5vcmlnaW5hbFNjaGVkdWxlVGltZSA/PyB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgaGVhZGVycyxcbiAgd29ya2Zsb3dUeXBlLFxuICBzZXEsXG59OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCk6IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IHdvcmtmbG93SWQgPSBvcHRpb25zLndvcmtmbG93SWQgPz8gdXVpZDQoKTtcbiAgY29uc3Qgc3RhcnRQcm9taXNlID0gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICFhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLmhhcyhzZXEpO1xuXG4gICAgICAgICAgaWYgKCFjb21wbGV0ZSkge1xuICAgICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgICAgY2FuY2VsQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjogeyBjaGlsZFdvcmtmbG93U2VxOiBzZXEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOb3RoaW5nIHRvIGNhbmNlbCBvdGhlcndpc2VcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICB3b3JrZmxvd1R5cGUsXG4gICAgICAgIGlucHV0OiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5vcHRpb25zLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSB8fCBhY3RpdmF0b3IuaW5mby50YXNrUXVldWUsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsIC8vIE5vdCBjb25maWd1cmFibGVcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k6IG9wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5LFxuICAgICAgICBwYXJlbnRDbG9zZVBvbGljeTogb3B0aW9ucy5wYXJlbnRDbG9zZVBvbGljeSxcbiAgICAgICAgY3JvblNjaGVkdWxlOiBvcHRpb25zLmNyb25TY2hlZHVsZSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbWVtbzogb3B0aW9ucy5tZW1vICYmIG1hcFRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMubWVtbyksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93U3RhcnQuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gV2UgY29uc3RydWN0IGEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNoaWxkIFdvcmtmbG93IGJlZm9yZSB3ZSBrbm93XG4gIC8vIGlmIHRoZSBXb3JrZmxvdyBjb2RlIHdpbGwgYXdhaXQgaXQgdG8gY2FwdHVyZSB0aGUgcmVzdWx0IGluIGNhc2UgaXQgZG9lcy5cbiAgY29uc3QgY29tcGxldGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIENoYWluIHN0YXJ0IFByb21pc2UgcmVqZWN0aW9uIHRvIHRoZSBjb21wbGV0ZSBQcm9taXNlLlxuICAgIHVudHJhY2tQcm9taXNlKHN0YXJ0UHJvbWlzZS5jYXRjaChyZWplY3QpKTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UpO1xuICAvLyBQcmV2ZW50IHVuaGFuZGxlZCByZWplY3Rpb24gYmVjYXVzZSB0aGUgY29tcGxldGlvbiBtaWdodCBub3QgYmUgYXdhaXRlZFxuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPigocmVzb2x2ZSkgPT4gcmVzb2x2ZShbc3RhcnRQcm9taXNlLCBjb21wbGV0ZVByb21pc2VdKSk7XG4gIHVudHJhY2tQcm9taXNlKHJldCk7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzZXEsIHNpZ25hbE5hbWUsIGFyZ3MsIHRhcmdldCwgaGVhZGVycyB9OiBTaWduYWxXb3JrZmxvd0lucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7IGNhbmNlbFNpZ25hbFdvcmtmbG93OiB7IHNlcSB9IH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNpZ25hbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhcmdzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc2lnbmFsTmFtZSxcbiAgICAgICAgLi4uKHRhcmdldC50eXBlID09PSAnZXh0ZXJuYWwnXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgLi4udGFyZ2V0LndvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IHRhcmdldC5jaGlsZFdvcmtmbG93SWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuc2lnbmFsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN5bWJvbCB1c2VkIGluIHRoZSByZXR1cm4gdHlwZSBvZiBwcm94eSBtZXRob2RzIHRvIG1hcmsgdGhhdCBhbiBhdHRyaWJ1dGUgb24gdGhlIHNvdXJjZSB0eXBlIGlzIG5vdCBhIG1ldGhvZC5cbiAqXG4gKiBAc2VlIHtAbGluayBBY3Rpdml0eUludGVyZmFjZUZvcn1cbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc31cbiAqIEBzZWUge0BsaW5rIHByb3h5TG9jYWxBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgY29uc3QgTm90QW5BY3Rpdml0eU1ldGhvZCA9IFN5bWJvbC5mb3IoJ19fVEVNUE9SQUxfTk9UX0FOX0FDVElWSVRZX01FVEhPRCcpO1xuXG4vKipcbiAqIFR5cGUgaGVscGVyIHRoYXQgdGFrZXMgYSB0eXBlIGBUYCBhbmQgdHJhbnNmb3JtcyBhdHRyaWJ1dGVzIHRoYXQgYXJlIG5vdCB7QGxpbmsgQWN0aXZpdHlGdW5jdGlvbn0gdG9cbiAqIHtAbGluayBOb3RBbkFjdGl2aXR5TWV0aG9kfS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIFVzZWQgYnkge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gZ2V0IHRoaXMgY29tcGlsZS10aW1lIGVycm9yOlxuICpcbiAqIGBgYHRzXG4gKiBpbnRlcmZhY2UgTXlBY3Rpdml0aWVzIHtcbiAqICAgdmFsaWQoaW5wdXQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyPjtcbiAqICAgaW52YWxpZChpbnB1dDogbnVtYmVyKTogbnVtYmVyO1xuICogfVxuICpcbiAqIGNvbnN0IGFjdCA9IHByb3h5QWN0aXZpdGllczxNeUFjdGl2aXRpZXM+KHsgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyB9KTtcbiAqXG4gKiBhd2FpdCBhY3QudmFsaWQodHJ1ZSk7XG4gKiBhd2FpdCBhY3QuaW52YWxpZCgpO1xuICogLy8gXiBUUyBjb21wbGFpbnMgd2l0aDpcbiAqIC8vIChwcm9wZXJ0eSkgaW52YWxpZERlZmluaXRpb246IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kXG4gKiAvLyBUaGlzIGV4cHJlc3Npb24gaXMgbm90IGNhbGxhYmxlLlxuICogLy8gVHlwZSAnU3ltYm9sJyBoYXMgbm8gY2FsbCBzaWduYXR1cmVzLigyMzQ5KVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlRm9yPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzIEFjdGl2aXR5RnVuY3Rpb24gPyBUW0tdIDogdHlwZW9mIE5vdEFuQWN0aXZpdHlNZXRob2Q7XG59O1xuXG4vKipcbiAqIENvbmZpZ3VyZSBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9IGZvclxuICogICAgICAgICB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm94eUFjdGl2aXRpZXMgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKiBpbXBvcnQgKiBhcyBhY3Rpdml0aWVzIGZyb20gJy4uL2FjdGl2aXRpZXMnO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBtb2R1bGUgZXhwb3J0c1xuICogY29uc3QgeyBodHRwR2V0LCBvdGhlckFjdGl2aXR5IH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzMwIG1pbnV0ZXMnLFxuICogfSk7XG4gKlxuICogLy8gU2V0dXAgQWN0aXZpdGllcyBmcm9tIGFuIGV4cGxpY2l0IGludGVyZmFjZSAoZS5nLiB3aGVuIGRlZmluZWQgYnkgYW5vdGhlciBTREspXG4gKiBpbnRlcmZhY2UgSmF2YUFjdGl2aXRpZXMge1xuICogICBodHRwR2V0RnJvbUphdmEodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz5cbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogfVxuICpcbiAqIGNvbnN0IHtcbiAqICAgaHR0cEdldEZyb21KYXZhLFxuICogICBzb21lT3RoZXJKYXZhQWN0aXZpdHlcbiAqIH0gPSBwcm94eUFjdGl2aXRpZXM8SmF2YUFjdGl2aXRpZXM+KHtcbiAqICAgdGFza1F1ZXVlOiAnamF2YS13b3JrZXItdGFza1F1ZXVlJyxcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyxcbiAqIH0pO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBleGVjdXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICogICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHBHZXQoXCJodHRwOi8vZXhhbXBsZS5jb21cIik7XG4gKiAgIC8vIC4uLlxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUFjdGl2aXRpZXM8QSA9IFVudHlwZWRBY3Rpdml0aWVzPihvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhY3Rpdml0eVByb3h5RnVuY3Rpb24oLi4uYXJnczogdW5rbm93bltdKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVkdWxlQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgTG9jYWwgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIExvY2FsQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9XG4gKiAgICAgICAgIGZvciB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSBmb3IgZXhhbXBsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5TG9jYWxBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxvY2FsQWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUxvY2FsQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLy8gVE9ETzogZGVwcmVjYXRlIHRoaXMgcGF0Y2ggYWZ0ZXIgXCJlbm91Z2hcIiB0aW1lIGhhcyBwYXNzZWRcbmNvbnN0IEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCA9ICdfX3RlbXBvcmFsX2ludGVybmFsX2Nvbm5lY3RfZXh0ZXJuYWxfaGFuZGxlX2NhbmNlbF90b19zY29wZSc7XG4vLyBUaGUgbmFtZSBvZiB0aGlzIHBhdGNoIGNvbWVzIGZyb20gYW4gYXR0ZW1wdCB0byBidWlsZCBhIGdlbmVyaWMgaW50ZXJuYWwgcGF0Y2hpbmcgbWVjaGFuaXNtLlxuLy8gVGhhdCBlZmZvcnQgaGFzIGJlZW4gYWJhbmRvbmVkIGluIGZhdm9yIG9mIGEgbmV3ZXIgV29ya2Zsb3dUYXNrQ29tcGxldGVkTWV0YWRhdGEgYmFzZWQgbWVjaGFuaXNtLlxuY29uc3QgQ09ORElUSU9OXzBfUEFUQ0ggPSAnX19zZGtfaW50ZXJuYWxfcGF0Y2hfbnVtYmVyOjEnO1xuXG4vKipcbiAqIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBzaWduYWwgYW5kIGNhbmNlbCBhbiBleGlzdGluZyBXb3JrZmxvdyBleGVjdXRpb24uXG4gKiBJdCB0YWtlcyBhIFdvcmtmbG93IElEIGFuZCBvcHRpb25hbCBydW4gSUQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKHdvcmtmbG93SWQ6IHN0cmluZywgcnVuSWQ/OiBzdHJpbmcpOiBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5nZXRIYW5kbGUoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZCxcbiAgICBydW5JZCxcbiAgICBjYW5jZWwoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBDb25uZWN0IHRoaXMgY2FuY2VsIG9wZXJhdGlvbiB0byB0aGUgY3VycmVudCBjYW5jZWxsYXRpb24gc2NvcGUuXG4gICAgICAgIC8vIFRoaXMgaXMgYmVoYXZpb3Igd2FzIGludHJvZHVjZWQgYWZ0ZXIgdjAuMjIuMCBhbmQgaXMgaW5jb21wYXRpYmxlXG4gICAgICAgIC8vIHdpdGggaGlzdG9yaWVzIGdlbmVyYXRlZCB3aXRoIHByZXZpb3VzIFNESyB2ZXJzaW9ucyBhbmQgdGh1cyByZXF1aXJlc1xuICAgICAgICAvLyBwYXRjaGluZy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgdHJ5IHRvIGRlbGF5IHBhdGNoaW5nIGFzIG11Y2ggYXMgcG9zc2libGUgdG8gYXZvaWQgcG9sbHV0aW5nXG4gICAgICAgIC8vIGhpc3RvcmllcyB1bmxlc3Mgc3RyaWN0bHkgcmVxdWlyZWQuXG4gICAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jYW5jZWxXb3JrZmxvdysrO1xuICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgIHJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2FuY2VsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnZXh0ZXJuYWwnLFxuICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7IHdvcmtmbG93SWQsIHJ1bklkIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dUeXBlOiBzdHJpbmcpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd0Z1bmM6IFQpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zdGFydENoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuc3RhcnQoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8gKHt9IGFzIGFueSkpO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSBleHRyYWN0V29ya2Zsb3dUeXBlKHdvcmtmbG93VHlwZU9yRnVuYyk7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbicsXG4gICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXJcbiAgKTtcbiAgY29uc3QgW3N0YXJ0ZWQsIGNvbXBsZXRlZF0gPSBhd2FpdCBleGVjdXRlKHtcbiAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5jaGlsZFdvcmtmbG93KyssXG4gICAgb3B0aW9uczogb3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB3b3JrZmxvd1R5cGUsXG4gIH0pO1xuICBjb25zdCBmaXJzdEV4ZWN1dGlvblJ1bklkID0gYXdhaXQgc3RhcnRlZDtcblxuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICBmaXJzdEV4ZWN1dGlvblJ1bklkLFxuICAgIGFzeW5jIHJlc3VsdCgpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICAgICAgcmV0dXJuIChhd2FpdCBjb21wbGV0ZWQpIGFzIGFueTtcbiAgICB9LFxuICAgIGFzeW5jIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnY2hpbGQnLFxuICAgICAgICAgIGNoaWxkV29ya2Zsb3dJZDogb3B0aW9uc1dpdGhEZWZhdWx0cy53b3JrZmxvd0lkLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgKCkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlPihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuZXhlY3V0ZUNoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZXhlY3V0ZSguLi4pIGluc3RlYWQuJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IGV4ZWNQcm9taXNlID0gZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgdW50cmFja1Byb21pc2UoZXhlY1Byb21pc2UpO1xuICBjb25zdCBjb21wbGV0ZWRQcm9taXNlID0gZXhlY1Byb21pc2UudGhlbigoW19zdGFydGVkLCBjb21wbGV0ZWRdKSA9PiBjb21wbGV0ZWQpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZWRQcm9taXNlKTtcbiAgcmV0dXJuIGNvbXBsZXRlZFByb21pc2UgYXMgUHJvbWlzZTxhbnk+O1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAqXG4gKiBXQVJOSU5HOiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBmcm96ZW4gY29weSBvZiBXb3JrZmxvd0luZm8sIGF0IHRoZSBwb2ludCB3aGVyZSB0aGlzIG1ldGhvZCBoYXMgYmVlbiBjYWxsZWQuXG4gKiBDaGFuZ2VzIGhhcHBlbmluZyBhdCBsYXRlciBwb2ludCBpbiB3b3JrZmxvdyBleGVjdXRpb24gd2lsbCBub3QgYmUgcmVmbGVjdGVkIGluIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gKlxuICogRm9yIHRoaXMgcmVhc29uLCB3ZSByZWNvbW1lbmQgY2FsbGluZyBgd29ya2Zsb3dJbmZvKClgIG9uIGV2ZXJ5IGFjY2VzcyB0byB7QGxpbmsgV29ya2Zsb3dJbmZvfSdzIGZpZWxkcyxcbiAqIHJhdGhlciB0aGFuIGNhY2hpbmcgdGhlIGBXb3JrZmxvd0luZm9gIG9iamVjdCAob3IgcGFydCBvZiBpdCkgaW4gYSBsb2NhbCB2YXJpYWJsZS4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIC8vIEdPT0RcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGRvU29tZXRoaW5nKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2Uod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICpcbiAqIHZzXG4gKlxuICogYGBgdHNcbiAqIC8vIEJBRFxuICogZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgY29uc3QgYXR0cmlidXRlcyA9IHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNcbiAqICAgZG9Tb21ldGhpbmcoYXR0cmlidXRlcylcbiAqICAgLi4uXG4gKiAgIGRvU29tZXRoaW5nRWxzZShhdHRyaWJ1dGVzKVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0luZm8oKTogV29ya2Zsb3dJbmZvIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LndvcmtmbG93SW5mbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5pbmZvO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgY29kZSBpcyBleGVjdXRpbmcgaW4gd29ya2Zsb3cgY29udGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5Xb3JrZmxvd0NvbnRleHQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBtYXliZUdldEFjdGl2YXRvcigpICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIGBmYCB0aGF0IHdpbGwgY2F1c2UgdGhlIGN1cnJlbnQgV29ya2Zsb3cgdG8gQ29udGludWVBc05ldyB3aGVuIGNhbGxlZC5cbiAqXG4gKiBgZmAgdGFrZXMgdGhlIHNhbWUgYXJndW1lbnRzIGFzIHRoZSBXb3JrZmxvdyBmdW5jdGlvbiBzdXBwbGllZCB0byB0eXBlcGFyYW0gYEZgLlxuICpcbiAqIE9uY2UgYGZgIGlzIGNhbGxlZCwgV29ya2Zsb3cgRXhlY3V0aW9uIGltbWVkaWF0ZWx5IGNvbXBsZXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDb250aW51ZUFzTmV3RnVuYzxGIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRpb25zPzogQ29udGludWVBc05ld09wdGlvbnNcbik6ICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KSA9PiBQcm9taXNlPG5ldmVyPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5jb250aW51ZUFzTmV3KC4uLikgYW5kIFdvcmtmbG93Lm1ha2VDb250aW51ZUFzTmV3RnVuYyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGNvbnN0IGluZm8gPSBhY3RpdmF0b3IuaW5mbztcbiAgY29uc3QgeyB3b3JrZmxvd1R5cGUsIHRhc2tRdWV1ZSwgLi4ucmVzdCB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgY29uc3QgcmVxdWlyZWRPcHRpb25zID0ge1xuICAgIHdvcmtmbG93VHlwZTogd29ya2Zsb3dUeXBlID8/IGluZm8ud29ya2Zsb3dUeXBlLFxuICAgIHRhc2tRdWV1ZTogdGFza1F1ZXVlID8/IGluZm8udGFza1F1ZXVlLFxuICAgIC4uLnJlc3QsXG4gIH07XG5cbiAgcmV0dXJuICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KTogUHJvbWlzZTxuZXZlcj4gPT4ge1xuICAgIGNvbnN0IGZuID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnY29udGludWVBc05ldycsIGFzeW5jIChpbnB1dCkgPT4ge1xuICAgICAgY29uc3QgeyBoZWFkZXJzLCBhcmdzLCBvcHRpb25zIH0gPSBpbnB1dDtcbiAgICAgIHRocm93IG5ldyBDb250aW51ZUFzTmV3KHtcbiAgICAgICAgd29ya2Zsb3dUeXBlOiBvcHRpb25zLndvcmtmbG93VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSxcbiAgICAgICAgbWVtbzogb3B0aW9ucy5tZW1vICYmIG1hcFRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMubWVtbyksXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93UnVuVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1Rhc2tUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXQpLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZuKHtcbiAgICAgIGFyZ3MsXG4gICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIG9wdGlvbnM6IHJlcXVpcmVkT3B0aW9ucyxcbiAgICB9KTtcbiAgfTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtY29udGludWUtYXMtbmV3LyB8IENvbnRpbnVlcy1Bcy1OZXd9IHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvblxuICogd2l0aCBkZWZhdWx0IG9wdGlvbnMuXG4gKlxuICogU2hvcnRoYW5kIGZvciBgbWFrZUNvbnRpbnVlQXNOZXdGdW5jPEY+KCkoLi4uYXJncylgLiAoU2VlOiB7QGxpbmsgbWFrZUNvbnRpbnVlQXNOZXdGdW5jfS4pXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKmBgYHRzXG4gKmltcG9ydCB7IGNvbnRpbnVlQXNOZXcgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICpleHBvcnQgYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyhuOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAvLyAuLi4gV29ya2Zsb3cgbG9naWNcbiAqICBhd2FpdCBjb250aW51ZUFzTmV3PHR5cGVvZiBteVdvcmtmbG93PihuICsgMSk7XG4gKn1cbiAqYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb250aW51ZUFzTmV3PEYgZXh0ZW5kcyBXb3JrZmxvdz4oLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+IHtcbiAgcmV0dXJuIG1ha2VDb250aW51ZUFzTmV3RnVuYygpKC4uLmFyZ3MpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGFuIFJGQyBjb21wbGlhbnQgVjQgdXVpZC5cbiAqIFVzZXMgdGhlIHdvcmtmbG93J3MgZGV0ZXJtaW5pc3RpYyBQUk5HIG1ha2luZyBpdCBzYWZlIGZvciB1c2Ugd2l0aGluIGEgd29ya2Zsb3cuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNyeXB0b2dyYXBoaWNhbGx5IGluc2VjdXJlLlxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQgfCBzdGFja292ZXJmbG93IGRpc2N1c3Npb259LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXVpZDQoKTogc3RyaW5nIHtcbiAgLy8gUmV0dXJuIHRoZSBoZXhhZGVjaW1hbCB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIG51bWJlciBgbmAsIHBhZGRlZCB3aXRoIHplcm9lcyB0byBiZSBvZiBsZW5ndGggYHBgXG4gIGNvbnN0IGhvID0gKG46IG51bWJlciwgcDogbnVtYmVyKSA9PiBuLnRvU3RyaW5nKDE2KS5wYWRTdGFydChwLCAnMCcpO1xuICAvLyBDcmVhdGUgYSB2aWV3IGJhY2tlZCBieSBhIDE2LWJ5dGUgYnVmZmVyXG4gIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDE2KSk7XG4gIC8vIEZpbGwgYnVmZmVyIHdpdGggcmFuZG9tIHZhbHVlc1xuICB2aWV3LnNldFVpbnQzMigwLCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDQsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoOCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMigxMiwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICAvLyBQYXRjaCB0aGUgNnRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZlcnNpb24gNCBVVUlEXG4gIHZpZXcuc2V0VWludDgoNiwgKHZpZXcuZ2V0VWludDgoNikgJiAweGYpIHwgMHg0MCk7XG4gIC8vIFBhdGNoIHRoZSA4dGggYnl0ZSB0byByZWZsZWN0IGEgdmFyaWFudCAxIFVVSUQgKHZlcnNpb24gNCBVVUlEcyBhcmUpXG4gIHZpZXcuc2V0VWludDgoOCwgKHZpZXcuZ2V0VWludDgoOCkgJiAweDNmKSB8IDB4ODApO1xuICAvLyBDb21waWxlIHRoZSBjYW5vbmljYWwgdGV4dHVhbCBmb3JtIGZyb20gdGhlIGFycmF5IGRhdGFcbiAgcmV0dXJuIGAke2hvKHZpZXcuZ2V0VWludDMyKDApLCA4KX0tJHtobyh2aWV3LmdldFVpbnQxNig0KSwgNCl9LSR7aG8odmlldy5nZXRVaW50MTYoNiksIDQpfS0ke2hvKFxuICAgIHZpZXcuZ2V0VWludDE2KDgpLFxuICAgIDRcbiAgKX0tJHtobyh2aWV3LmdldFVpbnQzMigxMCksIDgpfSR7aG8odmlldy5nZXRVaW50MTYoMTQpLCA0KX1gO1xufVxuXG4vKipcbiAqIFBhdGNoIG9yIHVwZ3JhZGUgd29ya2Zsb3cgY29kZSBieSBjaGVja2luZyBvciBzdGF0aW5nIHRoYXQgdGhpcyB3b3JrZmxvdyBoYXMgYSBjZXJ0YWluIHBhdGNoLlxuICpcbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvdmVyc2lvbmluZyB8IGRvY3MgcGFnZX0gZm9yIGluZm8uXG4gKlxuICogSWYgdGhlIHdvcmtmbG93IGlzIHJlcGxheWluZyBhbiBleGlzdGluZyBoaXN0b3J5LCB0aGVuIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIGlmIHRoYXRcbiAqIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyIHdoaWNoIGFsc28gaGFkIGEgYHBhdGNoZWRgIGNhbGwgd2l0aCB0aGUgc2FtZSBgcGF0Y2hJZGAuXG4gKiBJZiB0aGUgaGlzdG9yeSB3YXMgcHJvZHVjZWQgYnkgYSB3b3JrZXIgKndpdGhvdXQqIHN1Y2ggYSBjYWxsLCB0aGVuIGl0IHdpbGwgcmV0dXJuIGZhbHNlLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyBub3QgY3VycmVudGx5IHJlcGxheWluZywgdGhlbiB0aGlzIGNhbGwgKmFsd2F5cyogcmV0dXJucyB0cnVlLlxuICpcbiAqIFlvdXIgd29ya2Zsb3cgY29kZSBzaG91bGQgcnVuIHRoZSBcIm5ld1wiIGNvZGUgaWYgdGhpcyByZXR1cm5zIHRydWUsIGlmIGl0IHJldHVybnMgZmFsc2UsIHlvdVxuICogc2hvdWxkIHJ1biB0aGUgXCJvbGRcIiBjb2RlLiBCeSBkb2luZyB0aGlzLCB5b3UgY2FuIG1haW50YWluIGRldGVybWluaXNtLlxuICpcbiAqIEBwYXJhbSBwYXRjaElkIEFuIGlkZW50aWZpZXIgdGhhdCBzaG91bGQgYmUgdW5pcXVlIHRvIHRoaXMgcGF0Y2guIEl0IGlzIE9LIHRvIHVzZSBtdWx0aXBsZVxuICogY2FsbHMgd2l0aCB0aGUgc2FtZSBJRCwgd2hpY2ggbWVhbnMgYWxsIHN1Y2ggY2FsbHMgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hlZChwYXRjaElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIHJldHVybiBhY3RpdmF0b3IucGF0Y2hJbnRlcm5hbChwYXRjaElkLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSW5kaWNhdGUgdGhhdCBhIHBhdGNoIGlzIGJlaW5nIHBoYXNlZCBvdXQuXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC92ZXJzaW9uaW5nIHwgZG9jcyBwYWdlfSBmb3IgaW5mby5cbiAqXG4gKiBXb3JrZmxvd3Mgd2l0aCB0aGlzIGNhbGwgbWF5IGJlIGRlcGxveWVkIGFsb25nc2lkZSB3b3JrZmxvd3Mgd2l0aCBhIHtAbGluayBwYXRjaGVkfSBjYWxsLCBidXRcbiAqIHRoZXkgbXVzdCAqbm90KiBiZSBkZXBsb3llZCB3aGlsZSBhbnkgd29ya2VycyBzdGlsbCBleGlzdCBydW5uaW5nIG9sZCBjb2RlIHdpdGhvdXQgYVxuICoge0BsaW5rIHBhdGNoZWR9IGNhbGwsIG9yIGFueSBydW5zIHdpdGggaGlzdG9yaWVzIHByb2R1Y2VkIGJ5IHN1Y2ggd29ya2VycyBleGlzdC4gSWYgZWl0aGVyIGtpbmRcbiAqIG9mIHdvcmtlciBlbmNvdW50ZXJzIGEgaGlzdG9yeSBwcm9kdWNlZCBieSB0aGUgb3RoZXIsIHRoZWlyIGJlaGF2aW9yIGlzIHVuZGVmaW5lZC5cbiAqXG4gKiBPbmNlIGFsbCBsaXZlIHdvcmtmbG93IHJ1bnMgaGF2ZSBiZWVuIHByb2R1Y2VkIGJ5IHdvcmtlcnMgd2l0aCB0aGlzIGNhbGwsIHlvdSBjYW4gZGVwbG95IHdvcmtlcnNcbiAqIHdoaWNoIGFyZSBmcmVlIG9mIGVpdGhlciBraW5kIG9mIHBhdGNoIGNhbGwgZm9yIHRoaXMgSUQuIFdvcmtlcnMgd2l0aCBhbmQgd2l0aG91dCB0aGlzIGNhbGxcbiAqIG1heSBjb2V4aXN0LCBhcyBsb25nIGFzIHRoZXkgYXJlIGJvdGggcnVubmluZyB0aGUgXCJuZXdcIiBjb2RlLlxuICpcbiAqIEBwYXJhbSBwYXRjaElkIEFuIGlkZW50aWZpZXIgdGhhdCBzaG91bGQgYmUgdW5pcXVlIHRvIHRoaXMgcGF0Y2guIEl0IGlzIE9LIHRvIHVzZSBtdWx0aXBsZVxuICogY2FsbHMgd2l0aCB0aGUgc2FtZSBJRCwgd2hpY2ggbWVhbnMgYWxsIHN1Y2ggY2FsbHMgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVwcmVjYXRlUGF0Y2gocGF0Y2hJZDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5wYXRjaCguLi4pIGFuZCBXb3JrZmxvdy5kZXByZWNhdGVQYXRjaCBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBhY3RpdmF0b3IucGF0Y2hJbnRlcm5hbChwYXRjaElkLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgIG9yIGB0aW1lb3V0YCBleHBpcmVzLlxuICpcbiAqIEBwYXJhbSB0aW1lb3V0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAqXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb25kaXRpb24gd2FzIHRydWUgYmVmb3JlIHRoZSB0aW1lb3V0IGV4cGlyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogRHVyYXRpb24pOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0PzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5jb25kaXRpb24oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIC8vIFByaW9yIHRvIDEuNS4wLCBgY29uZGl0aW9uKGZuLCAwKWAgd2FzIHRyZWF0ZWQgYXMgZXF1aXZhbGVudCB0byBgY29uZGl0aW9uKGZuLCB1bmRlZmluZWQpYFxuICBpZiAodGltZW91dCA9PT0gMCAmJiAhcGF0Y2hlZChDT05ESVRJT05fMF9QQVRDSCkpIHtcbiAgICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xuICB9XG4gIGlmICh0eXBlb2YgdGltZW91dCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHRpbWVvdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIENhbmNlbGxhdGlvblNjb3BlLmNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLnJhY2UoW3NsZWVwKHRpbWVvdXQpLnRoZW4oKCkgPT4gZmFsc2UpLCBjb25kaXRpb25Jbm5lcihmbikudGhlbigoKSA9PiB0cnVlKV0pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbklubmVyKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNvbmRpdGlvbisrO1xuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFYWdlciBldmFsdWF0aW9uXG4gICAgaWYgKGZuKCkpIHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuc2V0KHNlcSwgeyBmbiwgcmVzb2x2ZSB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogRGVmaW5lIGFuIHVwZGF0ZSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gdXBkYXRlIFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVVwZGF0ZTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAndXBkYXRlJyxcbiAgICBuYW1lLFxuICB9IGFzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaWduYWwgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIERlZmluaXRpb25zIGFyZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHNpZ25hbCBXb3JrZmxvd3MgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogRGVmaW5pdGlvbnMgY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVTaWduYWw8QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnc2lnbmFsJyxcbiAgICBuYW1lLFxuICB9IGFzIFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT47XG59XG5cbi8qKlxuICogRGVmaW5lIGEgcXVlcnkgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIERlZmluaXRpb25zIGFyZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHF1ZXJ5IFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVF1ZXJ5PFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3F1ZXJ5JyxcbiAgICBuYW1lLFxuICB9IGFzIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIFNldCBhIGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgV29ya2Zsb3cgdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5LlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHVwZGF0ZSwgc2lnbmFsLCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBkZWYgYW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259LCB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0sIG9yIHtAbGluayBRdWVyeURlZmluaXRpb259IGFzIHJldHVybmVkIGJ5IHtAbGluayBkZWZpbmVVcGRhdGV9LCB7QGxpbmsgZGVmaW5lU2lnbmFsfSwgb3Ige0BsaW5rIGRlZmluZVF1ZXJ5fSByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0gaGFuZGxlciBhIGNvbXBhdGlibGUgaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIGRlZmluaXRpb24gb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBgZGVzY3JpcHRpb25gIG9mIHRoZSBoYW5kbGVyIGFuZCBhbiBvcHRpb25hbCB1cGRhdGUgYHZhbGlkYXRvcmAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFF1ZXJ5SGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFNpZ25hbERlZmluaXRpb248QXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFNpZ25hbEhhbmRsZXJPcHRpb25zXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+XG4pOiB2b2lkO1xuXG4vLyBGb3IgVXBkYXRlcyBhbmQgU2lnbmFscyB3ZSB3YW50IHRvIG1ha2UgYSBwdWJsaWMgZ3VhcmFudGVlIHNvbWV0aGluZyBsaWtlIHRoZVxuLy8gZm9sbG93aW5nOlxuLy9cbi8vICAgXCJJZiBhIFdGVCBjb250YWlucyBhIFNpZ25hbC9VcGRhdGUsIGFuZCBpZiBhIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGZvciB0aGF0XG4vLyAgIFNpZ25hbC9VcGRhdGUsIHRoZW4gdGhlIGhhbmRsZXIgd2lsbCBiZSBleGVjdXRlZC5cIlwiXG4vL1xuLy8gSG93ZXZlciwgdGhhdCBzdGF0ZW1lbnQgaXMgbm90IHdlbGwtZGVmaW5lZCwgbGVhdmluZyBzZXZlcmFsIHF1ZXN0aW9ucyBvcGVuOlxuLy9cbi8vIDEuIFdoYXQgZG9lcyBpdCBtZWFuIGZvciBhIGhhbmRsZXIgdG8gYmUgXCJhdmFpbGFibGVcIj8gV2hhdCBoYXBwZW5zIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBub3QgcHJlc2VudCBpbml0aWFsbHkgYnV0IGlzIHNldCBhdCBzb21lIHBvaW50IGR1cmluZyB0aGVcbi8vICAgIFdvcmtmbG93IGNvZGUgdGhhdCBpcyBleGVjdXRlZCBpbiB0aGF0IFdGVD8gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzXG4vLyAgICBzZXQgYW5kIHRoZW4gZGVsZXRlZCwgb3IgcmVwbGFjZWQgd2l0aCBhIGRpZmZlcmVudCBoYW5kbGVyP1xuLy9cbi8vIDIuIFdoZW4gaXMgdGhlIGhhbmRsZXIgZXhlY3V0ZWQ/IChXaGVuIGl0IGZpcnN0IGJlY29tZXMgYXZhaWxhYmxlPyBBdCB0aGUgZW5kXG4vLyAgICBvZiB0aGUgYWN0aXZhdGlvbj8pIFdoYXQgYXJlIHRoZSBleGVjdXRpb24gc2VtYW50aWNzIG9mIFdvcmtmbG93IGFuZFxuLy8gICAgU2lnbmFsL1VwZGF0ZSBoYW5kbGVyIGNvZGUgZ2l2ZW4gdGhhdCB0aGV5IGFyZSBjb25jdXJyZW50PyBDYW4gdGhlIHVzZXJcbi8vICAgIHJlbHkgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIHRoZSBXb3JrZmxvdyByZXR1cm5cbi8vICAgIHZhbHVlLCBvciBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldz8gSWYgdGhlIGhhbmRsZXIgaXMgYW5cbi8vICAgIGFzeW5jIGZ1bmN0aW9uIC8gY29yb3V0aW5lLCBob3cgbXVjaCBvZiBpdCBpcyBleGVjdXRlZCBhbmQgd2hlbiBpcyB0aGVcbi8vICAgIHJlc3QgZXhlY3V0ZWQ/XG4vL1xuLy8gMy4gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzIG5vdCBleGVjdXRlZD8gKGkuZS4gYmVjYXVzZSBpdCB3YXNuJ3Rcbi8vICAgIGF2YWlsYWJsZSBpbiB0aGUgc2Vuc2UgZGVmaW5lZCBieSAoMSkpXG4vL1xuLy8gNC4gSW4gdGhlIGNhc2Ugb2YgVXBkYXRlLCB3aGVuIGlzIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGV4ZWN1dGVkP1xuLy9cbi8vIFRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgVHlwZXNjcmlwdCBpcyBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIHNkay1jb3JlIHNvcnRzIFNpZ25hbCBhbmQgVXBkYXRlIGpvYnMgKGFuZCBQYXRjaGVzKSBhaGVhZCBvZiBhbGwgb3RoZXJcbi8vICAgIGpvYnMuIFRodXMgaWYgdGhlIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiB0aGVuXG4vLyAgICB0aGUgU2lnbmFsL1VwZGF0ZSB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBXb3JrZmxvdyBjb2RlIGlzIGV4ZWN1dGVkLiBJZiBpdFxuLy8gICAgaXMgbm90LCB0aGVuIHRoZSBTaWduYWwvVXBkYXRlIGNhbGxzIGlzIHB1c2hlZCB0byBhIGJ1ZmZlci5cbi8vXG4vLyAyLiBPbiBlYWNoIGNhbGwgdG8gc2V0SGFuZGxlciBmb3IgYSBnaXZlbiBTaWduYWwvVXBkYXRlLCB3ZSBtYWtlIGEgcGFzc1xuLy8gICAgdGhyb3VnaCB0aGUgYnVmZmVyIGxpc3QuIElmIGEgYnVmZmVyZWQgam9iIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUganVzdC1zZXRcbi8vICAgIGhhbmRsZXIsIHRoZW4gdGhlIGpvYiBpcyByZW1vdmVkIGZyb20gdGhlIGJ1ZmZlciBhbmQgdGhlIGluaXRpYWxcbi8vICAgIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIGhhbmRsZXIgaXMgaW52b2tlZCBvbiB0aGF0IGlucHV0IChpLmUuXG4vLyAgICBwcmVlbXB0aW5nIHdvcmtmbG93IGNvZGUpLlxuLy9cbi8vIFRodXMgaW4gdGhlIGNhc2Ugb2YgVHlwZXNjcmlwdCB0aGUgcXVlc3Rpb25zIGFib3ZlIGFyZSBhbnN3ZXJlZCBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIEEgaGFuZGxlciBpcyBcImF2YWlsYWJsZVwiIGlmIGl0IGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gb3Jcbi8vICAgIGJlY29tZXMgc2V0IGF0IGFueSBwb2ludCBkdXJpbmcgdGhlIEFjdGl2YXRpb24uIElmIHRoZSBoYW5kbGVyIGlzIG5vdCBzZXRcbi8vICAgIGluaXRpYWxseSB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgaXMgc2V0LiBTdWJzZXF1ZW50IGRlbGV0aW9uIG9yXG4vLyAgICByZXBsYWNlbWVudCBieSBhIGRpZmZlcmVudCBoYW5kbGVyIGhhcyBubyBpbXBhY3QgYmVjYXVzZSB0aGUgam9icyBpdCB3YXNcbi8vICAgIGhhbmRsaW5nIGhhdmUgYWxyZWFkeSBiZWVuIGhhbmRsZWQgYW5kIGFyZSBubyBsb25nZXIgaW4gdGhlIGJ1ZmZlci5cbi8vXG4vLyAyLiBUaGUgaGFuZGxlciBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGJlY29tZXMgYXZhaWxhYmxlLiBJLmUuIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgd2hlblxuLy8gICAgZmlyc3QgYXR0ZW1wdGluZyB0byBwcm9jZXNzIHRoZSBTaWduYWwvVXBkYXRlIGpvYjsgYWx0ZXJuYXRpdmVseSwgaWYgaXQgaXNcbi8vICAgIHNldCBieSBhIHNldEhhbmRsZXIgY2FsbCBtYWRlIGJ5IFdvcmtmbG93IGNvZGUsIHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXNcbi8vICAgIHBhcnQgb2YgdGhhdCBjYWxsIChwcmVlbXB0aW5nIFdvcmtmbG93IGNvZGUpLiBUaGVyZWZvcmUsIGEgdXNlciBjYW4gcmVseVxuLy8gICAgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIGUuZy4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIGFuZCBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldy4gQWN0aXZhdGlvbiBqb2JzIGFyZVxuLy8gICAgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBzdXBwbGllZCBieSBzZGstY29yZSwgaS5lLiBTaWduYWxzLCB0aGVuIFVwZGF0ZXMsXG4vLyAgICB0aGVuIG90aGVyIGpvYnMuIFdpdGhpbiBlYWNoIGdyb3VwLCB0aGUgb3JkZXIgc2VudCBieSB0aGUgc2VydmVyIGlzXG4vLyAgICBwcmVzZXJ2ZWQuIElmIHRoZSBoYW5kbGVyIGlzIGFzeW5jLCBpdCBpcyBleGVjdXRlZCB1cCB0byBpdHMgZmlyc3QgeWllbGRcbi8vICAgIHBvaW50LlxuLy9cbi8vIDMuIFNpZ25hbCBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYSBTaWduYWwgam9iIHRoZW5cbi8vICAgIHRoZSBqb2IgcmVtYWlucyBpbiB0aGUgYnVmZmVyLiBJZiBhIGhhbmRsZXIgZm9yIHRoZSBTaWduYWwgYmVjb21lc1xuLy8gICAgYXZhaWxhYmxlIGluIGEgc3Vic2VxdWVudCBBY3RpdmF0aW9uIChvZiB0aGUgc2FtZSBvciBhIHN1YnNlcXVlbnQgV0ZUKVxuLy8gICAgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLiBJZiBub3QsIHRoZW4gdGhlIFNpZ25hbCB3aWxsIG5ldmVyIGJlXG4vLyAgICByZXNwb25kZWQgdG8gYW5kIHRoaXMgY2F1c2VzIG5vIGVycm9yLlxuLy9cbi8vICAgIFVwZGF0ZSBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYW4gVXBkYXRlIGpvYiB0aGVuXG4vLyAgICB0aGUgVXBkYXRlIGlzIHJlamVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIEFjdGl2YXRpb24uIFRodXMsIGlmIGEgdXNlciBkb2VzXG4vLyAgICBub3Qgd2FudCBhbiBVcGRhdGUgdG8gYmUgcmVqZWN0ZWQgZm9yIHRoaXMgcmVhc29uLCB0aGVuIGl0IGlzIHRoZWlyXG4vLyAgICByZXNwb25zaWJpbGl0eSB0byBlbnN1cmUgdGhhdCB0aGVpciBhcHBsaWNhdGlvbiBhbmQgd29ya2Zsb3cgY29kZSBpbnRlcmFjdFxuLy8gICAgc3VjaCB0aGF0IGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoZSBVcGRhdGUgZHVyaW5nIGFueSBBY3RpdmF0aW9uXG4vLyAgICB3aGljaCBtaWdodCBjb250YWluIHRoZWlyIFVwZGF0ZSBqb2IuIChOb3RlIHRoYXQgdGhlIHVzZXIgb2Z0ZW4gaGFzXG4vLyAgICB1bmNlcnRhaW50eSBhYm91dCB3aGljaCBXRlQgdGhlaXIgU2lnbmFsL1VwZGF0ZSB3aWxsIGFwcGVhciBpbi4gRm9yXG4vLyAgICBleGFtcGxlLCBpZiB0aGV5IGNhbGwgc3RhcnRXb3JrZmxvdygpIGZvbGxvd2VkIGJ5IHN0YXJ0VXBkYXRlKCksIHRoZW4gdGhleVxuLy8gICAgd2lsbCB0eXBpY2FsbHkgbm90IGtub3cgd2hldGhlciB0aGVzZSB3aWxsIGJlIGRlbGl2ZXJlZCBpbiBvbmUgb3IgdHdvXG4vLyAgICBXRlRzLiBPbiB0aGUgb3RoZXIgaGFuZCB0aGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSB0aGV5IHdvdWxkIGhhdmUgcmVhc29uXG4vLyAgICB0byBiZWxpZXZlIHRoZXkgYXJlIGluIHRoZSBzYW1lIFdGVCwgZm9yIGV4YW1wbGUgaWYgdGhleSBkbyBub3Qgc3RhcnRcbi8vICAgIFdvcmtlciBwb2xsaW5nIHVudGlsIGFmdGVyIHRoZXkgaGF2ZSB2ZXJpZmllZCB0aGF0IGJvdGggcmVxdWVzdHMgaGF2ZVxuLy8gICAgc3VjY2VlZGVkLilcbi8vXG4vLyA1LiBJZiBhbiBVcGRhdGUgaGFzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIGltbWVkaWF0ZWx5XG4vLyAgICBwcmlvciB0byB0aGUgaGFuZGxlci4gKE5vdGUgdGhhdCB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBpcyByZXF1aXJlZCB0byBiZVxuLy8gICAgc3luY2hyb25vdXMpLlxuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zIHwgU2lnbmFsSGFuZGxlck9wdGlvbnMgfCBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zZXRIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICBjb25zdCBkZXNjcmlwdGlvbiA9IG9wdGlvbnM/LmRlc2NyaXB0aW9uO1xuICBpZiAoZGVmLnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCB1cGRhdGVPcHRpb25zID0gb3B0aW9ucyBhcyBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPiB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHZhbGlkYXRvciA9IHVwZGF0ZU9wdGlvbnM/LnZhbGlkYXRvciBhcyBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgfCB1bmRlZmluZWQ7XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXIsIHZhbGlkYXRvciwgZGVzY3JpcHRpb24gfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3NpZ25hbCcpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uIH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdxdWVyeScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24gfSk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGRlZmluaXRpb24gdHlwZTogJHsoZGVmIGFzIGFueSkudHlwZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBhIHNpZ25hbCBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICpcbiAqIFNpZ25hbHMgYXJlIGRpc3BhdGNoZWQgdG8gdGhlIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gc2lnbmFsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcywgb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0U2lnbmFsSGFuZGxlcihoYW5kbGVyOiBEZWZhdWx0U2lnbmFsSGFuZGxlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIFNlYXJjaCBBdHRyaWJ1dGVzIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBzZWFyY2hBdHRyaWJ1dGVzYCB3aXRoIHRoZSBleGlzdGluZyBTZWFyY2hcbiAqIEF0dHJpYnV0ZXMsIGB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyBXb3JrZmxvdyBjb2RlOlxuICpcbiAqIGBgYHRzXG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFsxXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV1cbiAqIH0pO1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgU2VhcmNoIEF0dHJpYnV0ZXM6XG4gKlxuICogYGBgdHNcbiAqIHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZWFyY2hBdHRyaWJ1dGVzIFRoZSBSZWNvcmQgdG8gbWVyZ2UuIFVzZSBhIHZhbHVlIG9mIGBbXWAgdG8gY2xlYXIgYSBTZWFyY2ggQXR0cmlidXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyhzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy51cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcblxuICBpZiAoc2VhcmNoQXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hBdHRyaWJ1dGVzIG11c3QgYmUgYSBub24tbnVsbCBTZWFyY2hBdHRyaWJ1dGVzJyk7XG4gIH1cblxuICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgIHVwc2VydFdvcmtmbG93U2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgc2VhcmNoQXR0cmlidXRlczogbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBzZWFyY2hBdHRyaWJ1dGVzKSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgc2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgICAuLi5pbmZvLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICAgIC4uLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICB9LFxuICAgIH07XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3Qgc3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8c3RyaW5nPignX19zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IGVuaGFuY2VkU3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8RW5oYW5jZWRTdGFja1RyYWNlPignX19lbmhhbmNlZF9zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IHdvcmtmbG93TWV0YWRhdGFRdWVyeSA9IGRlZmluZVF1ZXJ5PHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGE+KCdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyk7XG4iLCJpbXBvcnQge1xuICBwcm94eUFjdGl2aXRpZXMsXG4gIHByb3h5TG9jYWxBY3Rpdml0aWVzLFxuICBkZWZpbmVTaWduYWwsXG4gIHNldEhhbmRsZXIsXG4gIGNvbmRpdGlvbixcbiAgbG9nLFxuICBzdGFydENoaWxkLFxuICBzbGVlcCxcbiAgZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSxcbiAgZGVmaW5lUXVlcnksXG4gIGNvbnRpbnVlQXNOZXcsXG4gIFBhcmVudENsb3NlUG9saWN5LFxuICBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsXG4gIENhbmNlbGxhdGlvblNjb3BlLFxuICBpc0NhbmNlbGxhdGlvbixcbn0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuXG5pbXBvcnQgeyBidWlsZEdhbWVBY3Rpdml0aWVzLCBidWlsZFdvcmtlckFjdGl2aXRpZXMsIEV2ZW50IH0gZnJvbSAnLi9hY3Rpdml0aWVzJztcblxuY29uc3QgUk9VTkRfV0ZfSUQgPSAnU25ha2VHYW1lUm91bmQnO1xuY29uc3QgQVBQTEVfUE9JTlRTID0gMTA7XG5jb25zdCBTTkFLRV9NT1ZFU19CRUZPUkVfQ0FOID0gNTA7XG5jb25zdCBTTkFLRV9XT1JLRVJfRE9XTl9USU1FID0gJzEgc2Vjb25kcyc7XG5cbmNvbnN0IHsgZW1pdCB9ID0gcHJveHlMb2NhbEFjdGl2aXRpZXM8UmV0dXJuVHlwZTx0eXBlb2YgYnVpbGRHYW1lQWN0aXZpdGllcz4+KHtcbiAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzEgc2Vjb25kcycsXG59KTtcblxuY29uc3QgeyBzbmFrZVdvcmtlciB9ID0gcHJveHlBY3Rpdml0aWVzPFJldHVyblR5cGU8dHlwZW9mIGJ1aWxkV29ya2VyQWN0aXZpdGllcz4+KHtcbiAgdGFza1F1ZXVlOiAnc25ha2Utd29ya2VycycsXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICcxIGRheScsXG4gIGhlYXJ0YmVhdFRpbWVvdXQ6IDUwMCxcbiAgY2FuY2VsbGF0aW9uVHlwZTogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbn0pO1xuXG50eXBlIEdhbWVDb25maWcgPSB7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICB0ZWFtTmFtZXM6IHN0cmluZ1tdO1xuICBzbmFrZXNQZXJUZWFtOiBudW1iZXI7XG4gIG5vbXNQZXJNb3ZlOiBudW1iZXI7XG4gIG5vbUFjdGl2aXR5OiBib29sZWFuO1xuICBub21EdXJhdGlvbjogbnVtYmVyO1xuICBraWxsV29ya2VyczogYm9vbGVhbjtcbn07XG5cbnR5cGUgR2FtZSA9IHtcbiAgY29uZmlnOiBHYW1lQ29uZmlnO1xuICB0ZWFtczogVGVhbXM7XG59O1xuXG50eXBlIFRlYW0gPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgc2NvcmU6IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBUZWFtcyA9IFJlY29yZDxzdHJpbmcsIFRlYW0+O1xuXG5leHBvcnQgdHlwZSBSb3VuZCA9IHtcbiAgY29uZmlnOiBHYW1lQ29uZmlnO1xuICBhcHBsZXM6IEFwcGxlcztcbiAgdGVhbXM6IFRlYW1zO1xuICBzbmFrZXM6IFNuYWtlcztcbiAgZHVyYXRpb246IG51bWJlcjtcbiAgc3RhcnRlZEF0PzogbnVtYmVyO1xuICBmaW5pc2hlZD86IGJvb2xlYW47XG59O1xuXG50eXBlIEFwcGxlcyA9IFJlY29yZDxzdHJpbmcsIEFwcGxlPjtcblxudHlwZSBQb2ludCA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59O1xuXG50eXBlIEFwcGxlID0gUG9pbnQ7XG5cbnR5cGUgU2VnbWVudCA9IHtcbiAgaGVhZDogUG9pbnQ7XG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xuICBsZW5ndGg6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFNuYWtlID0ge1xuICBpZDogc3RyaW5nO1xuICBwbGF5ZXJJZDogc3RyaW5nO1xuICB0ZWFtTmFtZTogc3RyaW5nO1xuICBzZWdtZW50czogU2VnbWVudFtdO1xuICBhdGVBcHBsZUlkPzogc3RyaW5nO1xufTtcbnR5cGUgU25ha2VzID0gUmVjb3JkPHN0cmluZywgU25ha2U+O1xuXG50eXBlIERpcmVjdGlvbiA9ICd1cCcgfCAnZG93bicgfCAnbGVmdCcgfCAncmlnaHQnO1xuXG5mdW5jdGlvbiByYW5kb21EaXJlY3Rpb24oKTogRGlyZWN0aW9uIHtcbiAgY29uc3QgZGlyZWN0aW9uczogRGlyZWN0aW9uW10gPSBbJ3VwJywgJ2Rvd24nLCAnbGVmdCcsICdyaWdodCddO1xuICByZXR1cm4gZGlyZWN0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkaXJlY3Rpb25zLmxlbmd0aCldO1xufVxuXG5mdW5jdGlvbiBvcHBvc2l0ZURpcmVjdGlvbihkaXJlY3Rpb246IERpcmVjdGlvbik6IERpcmVjdGlvbiB7XG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICByZXR1cm4gJ2Rvd24nO1xuICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgcmV0dXJuICd1cCc7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICByZXR1cm4gJ3JpZ2h0JztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ2xlZnQnO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnYW1lU3RhdGVRdWVyeSA9IGRlZmluZVF1ZXJ5PEdhbWU+KCdnYW1lU3RhdGUnKTtcbmV4cG9ydCBjb25zdCByb3VuZFN0YXRlUXVlcnkgPSBkZWZpbmVRdWVyeTxSb3VuZD4oJ3JvdW5kU3RhdGUnKTtcblxuZXhwb3J0IGNvbnN0IGdhbWVGaW5pc2hTaWduYWwgPSBkZWZpbmVTaWduYWwoJ2dhbWVGaW5pc2gnKTtcblxudHlwZSBSb3VuZFN0YXJ0U2lnbmFsID0ge1xuICBzbmFrZXM6IFNuYWtlW107XG4gIGR1cmF0aW9uOiBudW1iZXI7XG59XG4vLyBVSSAtPiBHYW1lV29ya2Zsb3cgdG8gc3RhcnQgcm91bmRcbmV4cG9ydCBjb25zdCByb3VuZFN0YXJ0U2lnbmFsID0gZGVmaW5lU2lnbmFsPFtSb3VuZFN0YXJ0U2lnbmFsXT4oJ3JvdW5kU3RhcnQnKTtcblxuLy8gUGxheWVyIFVJIC0+IFNuYWtlV29ya2Zsb3cgdG8gY2hhbmdlIGRpcmVjdGlvblxuZXhwb3J0IGNvbnN0IHNuYWtlQ2hhbmdlRGlyZWN0aW9uU2lnbmFsID0gZGVmaW5lU2lnbmFsPFtEaXJlY3Rpb25dPignc25ha2VDaGFuZ2VEaXJlY3Rpb24nKTtcblxuLy8gKEludGVybmFsKSBTbmFrZVdvcmtmbG93IC0+IFJvdW5kIHRvIHRyaWdnZXIgYSBtb3ZlXG5leHBvcnQgY29uc3Qgc25ha2VNb3ZlU2lnbmFsID0gZGVmaW5lU2lnbmFsPFtzdHJpbmcsIERpcmVjdGlvbl0+KCdzbmFrZU1vdmUnKTtcblxuZXhwb3J0IGNvbnN0IHdvcmtlclN0b3BTaWduYWwgPSBkZWZpbmVTaWduYWwoJ3dvcmtlclN0b3AnKTtcblxudHlwZSBXb3JrZXJTdGFydGVkU2lnbmFsID0ge1xuICBpZGVudGl0eTogc3RyaW5nO1xufTtcbmV4cG9ydCBjb25zdCB3b3JrZXJTdGFydGVkU2lnbmFsID0gZGVmaW5lU2lnbmFsPFtXb3JrZXJTdGFydGVkU2lnbmFsXT4oJ3dvcmtlclN0YXJ0ZWQnKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdhbWVXb3JrZmxvdyhjb25maWc6IEdhbWVDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbG9nLmluZm8oJ1N0YXJ0aW5nIGdhbWUnKTtcblxuICBjb25zdCBnYW1lOiBHYW1lID0ge1xuICAgIGNvbmZpZyxcbiAgICB0ZWFtczogY29uZmlnLnRlYW1OYW1lcy5yZWR1Y2U8VGVhbXM+KChhY2MsIG5hbWUpID0+IHtcbiAgICAgIGFjY1tuYW1lXSA9IHsgbmFtZSwgc2NvcmU6IDAgfTtcbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pLFxuICB9O1xuICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcbiAgbGV0IHJvdW5kU2NvcGU6IENhbmNlbGxhdGlvblNjb3BlO1xuXG4gIHNldEhhbmRsZXIoZ2FtZVN0YXRlUXVlcnksICgpID0+IHtcbiAgICByZXR1cm4gZ2FtZTtcbiAgfSk7XG5cbiAgc2V0SGFuZGxlcihnYW1lRmluaXNoU2lnbmFsLCAoKSA9PiB7XG4gICAgZmluaXNoZWQgPSB0cnVlO1xuICAgIHJvdW5kU2NvcGU/LmNhbmNlbCgpO1xuICB9KTtcblxuICBsZXQgbmV3Um91bmQ6IFJvdW5kV29ya2Zsb3dJbnB1dCB8IHVuZGVmaW5lZDtcbiAgc2V0SGFuZGxlcihyb3VuZFN0YXJ0U2lnbmFsLCBhc3luYyAoeyBkdXJhdGlvbiwgc25ha2VzIH0pID0+IHtcbiAgICBuZXdSb3VuZCA9IHsgY29uZmlnLCB0ZWFtczogYnVpbGRSb3VuZFRlYW1zKGdhbWUpLCBkdXJhdGlvbiwgc25ha2VzIH07XG4gIH0pO1xuXG4gIHdoaWxlICghZmluaXNoZWQpIHtcbiAgICBhd2FpdCBjb25kaXRpb24oKCkgPT4gbmV3Um91bmQgIT09IHVuZGVmaW5lZCk7XG5cbiAgICByb3VuZFNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcm91bmRTY29wZS5ydW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByb3VuZFdmID0gYXdhaXQgc3RhcnRDaGlsZChSb3VuZFdvcmtmbG93LCB7XG4gICAgICAgICAgd29ya2Zsb3dJZDogUk9VTkRfV0ZfSUQsXG4gICAgICAgICAgYXJnczogW25ld1JvdW5kIV0sXG4gICAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwsXG4gICAgICAgIH0pO1xuICAgICAgICBuZXdSb3VuZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCByb3VuZCA9IGF3YWl0IHJvdW5kV2YucmVzdWx0KCk7XG4gICAgICAgIGZvciAoY29uc3QgdGVhbSBvZiBPYmplY3QudmFsdWVzKHJvdW5kLnRlYW1zKSkge1xuICAgICAgICAgIGdhbWUudGVhbXNbdGVhbS5uYW1lXS5zY29yZSArPSB0ZWFtLnNjb3JlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmICghaXNDYW5jZWxsYXRpb24oZXJyKSkgeyB0aHJvdyhlcnIpOyB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgUm91bmRXb3JrZmxvd0lucHV0ID0ge1xuICBjb25maWc6IEdhbWVDb25maWc7XG4gIHRlYW1zOiBUZWFtcztcbiAgc25ha2VzOiBTbmFrZVtdO1xuICBkdXJhdGlvbjogbnVtYmVyO1xufVxuXG50eXBlIFNuYWtlTW92ZSA9IHtcbiAgaWQ6IHN0cmluZztcbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUm91bmRXb3JrZmxvdyh7IGNvbmZpZywgdGVhbXMsIHNuYWtlcywgZHVyYXRpb24gfTogUm91bmRXb3JrZmxvd0lucHV0KTogUHJvbWlzZTxSb3VuZD4ge1xuICBsb2cuaW5mbygnU3RhcnRpbmcgcm91bmQnLCB7IGR1cmF0aW9uLCBzbmFrZXMgfSk7XG5cbiAgY29uc3Qgcm91bmQ6IFJvdW5kID0ge1xuICAgIGNvbmZpZzogY29uZmlnLFxuICAgIGR1cmF0aW9uOiBkdXJhdGlvbixcbiAgICBhcHBsZXM6IHt9LFxuICAgIHRlYW1zOiB0ZWFtcyxcbiAgICBzbmFrZXM6IHNuYWtlcy5yZWR1Y2U8U25ha2VzPigoYWNjLCBzbmFrZSkgPT4geyBhY2Nbc25ha2UuaWRdID0gc25ha2U7IHJldHVybiBhY2M7IH0sIHt9KSxcbiAgICBmaW5pc2hlZDogZmFsc2UsXG4gIH07XG5cbiAgY29uc3Qgc25ha2VNb3ZlczogU25ha2VNb3ZlW10gPSBbXTtcbiAgY29uc3Qgd29ya2Vyc1N0YXJ0ZWQ6IHN0cmluZ1tdID0gW107XG5cbiAgc2V0SGFuZGxlcihyb3VuZFN0YXRlUXVlcnksICgpID0+IHtcbiAgICByZXR1cm4gcm91bmQ7XG4gIH0pO1xuXG4gIHNldEhhbmRsZXIoc25ha2VNb3ZlU2lnbmFsLCBhc3luYyAoaWQsIGRpcmVjdGlvbikgPT4ge1xuICAgIGlmIChyb3VuZC5maW5pc2hlZCkgeyByZXR1cm47IH1cbiAgICBzbmFrZU1vdmVzLnB1c2goeyBpZCwgZGlyZWN0aW9uIH0pO1xuICB9KTtcblxuICBzZXRIYW5kbGVyKHdvcmtlclN0YXJ0ZWRTaWduYWwsIGFzeW5jICh7IGlkZW50aXR5IH0pID0+IHtcbiAgICBpZiAocm91bmQuZmluaXNoZWQpIHsgcmV0dXJuOyB9XG4gICAgd29ya2Vyc1N0YXJ0ZWQucHVzaChpZGVudGl0eSk7XG4gICAgcm91bmQuYXBwbGVzW2lkZW50aXR5XSA9IHJhbmRvbUVtcHR5UG9pbnQocm91bmQpO1xuICB9KTtcblxuICBjb25zdCBwcm9jZXNzU2lnbmFscyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBldmVudHM6IEV2ZW50W10gPSBbXTtcbiAgICBjb25zdCBhcHBsZXNFYXRlbjogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzaWduYWxzID0gW107XG5cbiAgICBmb3IgKGNvbnN0IG1vdmUgb2Ygc25ha2VNb3Zlcykge1xuICAgICAgY29uc3Qgc25ha2UgPSByb3VuZC5zbmFrZXNbbW92ZS5pZF07XG4gICAgICBtb3ZlU25ha2Uocm91bmQsIHNuYWtlLCBtb3ZlLmRpcmVjdGlvbik7XG4gICAgICBldmVudHMucHVzaCh7IHR5cGU6ICdzbmFrZU1vdmVkJywgcGF5bG9hZDogeyBzbmFrZUlkOiBtb3ZlLmlkLCBzZWdtZW50czogc25ha2Uuc2VnbWVudHMgfSB9KTtcbiAgICAgIGlmIChzbmFrZS5hdGVBcHBsZUlkKSB7XG4gICAgICAgIGFwcGxlc0VhdGVuLnB1c2goc25ha2UuYXRlQXBwbGVJZCk7XG4gICAgICAgIHJvdW5kLnRlYW1zW3NuYWtlLnRlYW1OYW1lXS5zY29yZSArPSBBUFBMRV9QT0lOVFM7XG4gICAgICAgIHNuYWtlLmF0ZUFwcGxlSWQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBhcHBsZUlkIG9mIGFwcGxlc0VhdGVuKSB7XG4gICAgICBpZiAoY29uZmlnLmtpbGxXb3JrZXJzKSB7XG4gICAgICAgIGNvbnN0IHdvcmtlciA9IGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUoYXBwbGVJZCk7XG4gICAgICAgIHNpZ25hbHMucHVzaCh3b3JrZXIuc2lnbmFsKHdvcmtlclN0b3BTaWduYWwpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdvcmtlcnNTdGFydGVkLnB1c2goYXBwbGVJZCk7XG4gICAgICB9XG4gICAgICBkZWxldGUgcm91bmQuYXBwbGVzW2FwcGxlSWRdO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgd29ya2VySWQgb2Ygd29ya2Vyc1N0YXJ0ZWQpIHtcbiAgICAgIHJvdW5kLmFwcGxlc1t3b3JrZXJJZF0gPSByYW5kb21FbXB0eVBvaW50KHJvdW5kKTtcbiAgICB9XG5cbiAgICBpZiAoYXBwbGVzRWF0ZW4ubGVuZ3RoIHx8IHdvcmtlcnNTdGFydGVkLmxlbmd0aCkge1xuICAgICAgZXZlbnRzLnB1c2goeyB0eXBlOiAncm91bmRVcGRhdGUnLCBwYXlsb2FkOiB7IHJvdW5kIH0gfSk7XG4gICAgfVxuXG4gICAgc25ha2VNb3Zlcy5sZW5ndGggPSAwO1xuICAgIHdvcmtlcnNTdGFydGVkLmxlbmd0aCA9IDA7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChbZW1pdChldmVudHMpLCAuLi5zaWduYWxzXSk7XG4gIH1cblxuICByYW5kb21pemVSb3VuZChyb3VuZCk7XG5cbiAgY29uc3Qgd29ya2VyQ291bnQgPSBzbmFrZXMubGVuZ3RoICogMjtcblxuICB0cnkge1xuICAgIGF3YWl0IHN0YXJ0V29ya2VyTWFuYWdlcnMod29ya2VyQ291bnQpO1xuICAgIGF3YWl0IHN0YXJ0U25ha2VzKHJvdW5kLmNvbmZpZywgcm91bmQuc25ha2VzKTtcbiAgICBhd2FpdCBlbWl0KFt7IHR5cGU6ICdyb3VuZExvYWRpbmcnLCBwYXlsb2FkOiB7IHJvdW5kIH0gfV0pO1xuXG4gICAgLy8gV2FpdCBmb3IgYWxsIHdvcmtlcnMgdG8gcmVnaXN0ZXJcbiAgICBhd2FpdCBjb25kaXRpb24oKCkgPT4gd29ya2Vyc1N0YXJ0ZWQubGVuZ3RoID09PSB3b3JrZXJDb3VudCk7XG4gICAgZm9yIChjb25zdCB3b3JrZXJJZCBvZiB3b3JrZXJzU3RhcnRlZCkge1xuICAgICAgcm91bmQuYXBwbGVzW3dvcmtlcklkXSA9IHJhbmRvbUVtcHR5UG9pbnQocm91bmQpO1xuICAgIH1cbiAgICB3b3JrZXJzU3RhcnRlZC5sZW5ndGggPSAwO1xuXG4gICAgLy8gU3RhcnQgdGhlIHJvdW5kXG4gICAgcm91bmQuc3RhcnRlZEF0ID0gRGF0ZS5ub3coKTtcblxuICAgIFByb21pc2UucmFjZShbXG4gICAgICBzbGVlcChkdXJhdGlvbiAqIDEwMDApLFxuICAgICAgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpLmNhbmNlbFJlcXVlc3RlZCxcbiAgICBdKVxuICAgIC50aGVuKCgpID0+IGxvZy5pbmZvKCdSb3VuZCB0aW1lciBleHBpcmVkJykpXG4gICAgLmNhdGNoKCgpID0+IGxvZy5pbmZvKCdSb3VuZCBjYW5jZWxsZWQnKSlcbiAgICAuZmluYWxseSgoKSA9PiByb3VuZC5maW5pc2hlZCA9IHRydWUpO1xuXG4gICAgbG9nLmluZm8oJ1JvdW5kIHN0YXJ0ZWQnLCB7IHJvdW5kIH0pO1xuICAgIGF3YWl0IGVtaXQoW3sgdHlwZTogJ3JvdW5kU3RhcnRlZCcsIHBheWxvYWQ6IHsgcm91bmQgfSB9XSk7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgYXdhaXQgY29uZGl0aW9uKCgpID0+IHJvdW5kLmZpbmlzaGVkIHx8IHNuYWtlTW92ZXMubGVuZ3RoID4gMCB8fCB3b3JrZXJzU3RhcnRlZC5sZW5ndGggPiAwKTtcbiAgICAgIGlmIChyb3VuZC5maW5pc2hlZCkgeyBicmVhazsgfVxuXG4gICAgICBhd2FpdCBwcm9jZXNzU2lnbmFscygpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFpc0NhbmNlbGxhdGlvbihlcnIpKSB7XG4gICAgICB0aHJvdyhlcnIpO1xuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICByb3VuZC5maW5pc2hlZCA9IHRydWU7XG4gIH1cblxuICBhd2FpdCBDYW5jZWxsYXRpb25TY29wZS5ub25DYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgZW1pdChbeyB0eXBlOiAncm91bmRGaW5pc2hlZCcsIHBheWxvYWQ6IHsgcm91bmQgfSB9XSk7XG4gIH0pO1xuXG4gIGxvZy5pbmZvKCdSb3VuZCBmaW5pc2hlZCcsIHsgcm91bmQgfSk7XG5cbiAgcmV0dXJuIHJvdW5kO1xufVxuXG50eXBlIFNuYWtlV29ya2VyV29ya2Zsb3dJbnB1dCA9IHtcbiAgcm91bmRJZDogc3RyaW5nO1xuICBpZGVudGl0eTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFNuYWtlV29ya2VyV29ya2Zsb3coeyByb3VuZElkLCBpZGVudGl0eSB9OiBTbmFrZVdvcmtlcldvcmtmbG93SW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3Qgcm91bmQgPSBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKHJvdW5kSWQpO1xuICBsZXQgc2NvcGU6IENhbmNlbGxhdGlvblNjb3BlIHwgdW5kZWZpbmVkO1xuXG4gIHNldEhhbmRsZXIod29ya2VyU3RvcFNpZ25hbCwgKCkgPT4ge1xuICAgIGlmIChzY29wZSkgeyBzY29wZS5jYW5jZWwoKSB9XG4gIH0pO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHJvdW5kLnNpZ25hbCh3b3JrZXJTdGFydGVkU2lnbmFsLCB7IGlkZW50aXR5IH0pLFxuICAgICAgICBzY29wZS5ydW4oKCkgPT4gc25ha2VXb3JrZXIoaWRlbnRpdHkpKSxcbiAgICAgIF0pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGUpKSB7XG4gICAgICAgIC8vIExldCB3b3JrZXJzIHN0YXJ0IGFnYWluIGZhc3RlciBmb3Igbm93LlxuICAgICAgICAvLyBhd2FpdCBzbGVlcChTTkFLRV9XT1JLRVJfRE9XTl9USU1FKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnR5cGUgU25ha2VXb3JrZmxvd0lucHV0ID0ge1xuICByb3VuZElkOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xuICBub21zUGVyTW92ZTogbnVtYmVyO1xuICBub21BY3Rpdml0eTogYm9vbGVhbjtcbiAgbm9tRHVyYXRpb246IG51bWJlcjtcbn07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBTbmFrZVdvcmtmbG93KHsgcm91bmRJZCwgaWQsIGRpcmVjdGlvbiwgbm9tc1Blck1vdmUsIG5vbUFjdGl2aXR5LCBub21EdXJhdGlvbiB9OiBTbmFrZVdvcmtmbG93SW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgc2V0SGFuZGxlcihzbmFrZUNoYW5nZURpcmVjdGlvblNpZ25hbCwgKG5ld0RpcmVjdGlvbikgPT4ge1xuICAgIGRpcmVjdGlvbiA9IG5ld0RpcmVjdGlvbjtcbiAgfSk7XG5cbiAgbGV0IHNuYWtlTm9tOiAoaWQ6IHN0cmluZywgZHVyYXRpb246IG51bWJlcikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICBpZiAobm9tQWN0aXZpdHkpIHtcbiAgICBzbmFrZU5vbSA9IHByb3h5QWN0aXZpdGllczxSZXR1cm5UeXBlIDx0eXBlb2YgYnVpbGRHYW1lQWN0aXZpdGllcz4+KHtcbiAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG5vbUR1cmF0aW9uICogMixcbiAgICB9KS5zbmFrZU5vbTtcbiAgfSBlbHNlIHtcbiAgICBzbmFrZU5vbSA9IHByb3h5TG9jYWxBY3Rpdml0aWVzPFJldHVyblR5cGUgPHR5cGVvZiBidWlsZEdhbWVBY3Rpdml0aWVzPj4oe1xuICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbm9tRHVyYXRpb24gKiAyLFxuICAgIH0pLnNuYWtlTm9tO1xuICB9XG5cbiAgY29uc3Qgcm91bmQgPSBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKHJvdW5kSWQpO1xuICBjb25zdCBub21zID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogbm9tc1Blck1vdmUgfSk7XG4gIGxldCBtb3ZlcyA9IDA7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChub21zLm1hcCgoKSA9PiBzbmFrZU5vbShpZCwgbm9tRHVyYXRpb24pKSk7XG4gICAgYXdhaXQgcm91bmQuc2lnbmFsKHNuYWtlTW92ZVNpZ25hbCwgaWQsIGRpcmVjdGlvbik7XG4gICAgaWYgKG1vdmVzKysgPiBTTkFLRV9NT1ZFU19CRUZPUkVfQ0FOKSB7XG4gICAgICBhd2FpdCBjb250aW51ZUFzTmV3PHR5cGVvZiBTbmFrZVdvcmtmbG93Pih7IHJvdW5kSWQsIGlkLCBkaXJlY3Rpb24sIG5vbXNQZXJNb3ZlLCBub21BY3Rpdml0eSwgbm9tRHVyYXRpb24gfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1vdmVTbmFrZShyb3VuZDogUm91bmQsIHNuYWtlOiBTbmFrZSwgZGlyZWN0aW9uOiBEaXJlY3Rpb24pIHtcbiAgY29uc3QgY29uZmlnID0gcm91bmQuY29uZmlnO1xuXG4gIGxldCBoZWFkU2VnbWVudCA9IHNuYWtlLnNlZ21lbnRzWzBdO1xuICBsZXQgdGFpbFNlZ21lbnQgPSBzbmFrZS5zZWdtZW50c1tzbmFrZS5zZWdtZW50cy5sZW5ndGggLSAxXTtcblxuICBjb25zdCBjdXJyZW50RGlyZWN0aW9uID0gaGVhZFNlZ21lbnQuZGlyZWN0aW9uO1xuICBsZXQgbmV3RGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuXG4gIC8vIFlvdSBjYW4ndCBnbyBiYWNrIG9uIHlvdXJzZWxmXG4gIGlmIChuZXdEaXJlY3Rpb24gPT09IG9wcG9zaXRlRGlyZWN0aW9uKGN1cnJlbnREaXJlY3Rpb24pKSB7XG4gICAgbmV3RGlyZWN0aW9uID0gY3VycmVudERpcmVjdGlvbjtcbiAgfVxuXG4gIGxldCBjdXJyZW50SGVhZCA9IGhlYWRTZWdtZW50LmhlYWQ7XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IHNlZ21lbnQgaWYgd2UncmUgY2hhbmdpbmcgZGlyZWN0aW9uIG9yIGhpdHRpbmcgYW4gZWRnZVxuICBpZiAobmV3RGlyZWN0aW9uICE9PSBjdXJyZW50RGlyZWN0aW9uIHx8IGFnYWluc3RBbkVkZ2Uocm91bmQsIGN1cnJlbnRIZWFkLCBkaXJlY3Rpb24pKSB7XG4gICAgaGVhZFNlZ21lbnQgPSB7IGhlYWQ6IHsgeDogY3VycmVudEhlYWQueCwgeTogY3VycmVudEhlYWQueSB9LCBkaXJlY3Rpb246IG5ld0RpcmVjdGlvbiwgbGVuZ3RoOiAwIH07XG4gICAgc25ha2Uuc2VnbWVudHMudW5zaGlmdChoZWFkU2VnbWVudCk7XG4gIH1cblxuICBsZXQgbmV3SGVhZDogUG9pbnQgPSB7IHg6IGN1cnJlbnRIZWFkLngsIHk6IGN1cnJlbnRIZWFkLnkgfTtcblxuICAvLyBNb3ZlIHRoZSBoZWFkIHNlZ21lbnQsIHdyYXBwaW5nIGFyb3VuZCBpZiB3ZSBhcmUgbW92aW5nIHBhc3QgdGhlIGVkZ2VcbiAgaWYgKG5ld0RpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgIG5ld0hlYWQueSA9IG5ld0hlYWQueSA8PSAxID8gY29uZmlnLmhlaWdodCA6IGN1cnJlbnRIZWFkLnkgLSAxO1xuICB9IGVsc2UgaWYgKG5ld0RpcmVjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgbmV3SGVhZC55ID0gbmV3SGVhZC55ID49IGNvbmZpZy5oZWlnaHQgPyAxIDogY3VycmVudEhlYWQueSArIDE7XG4gIH0gZWxzZSBpZiAobmV3RGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICBuZXdIZWFkLnggPSBuZXdIZWFkLnggPD0gMSA/IGNvbmZpZy53aWR0aCA6IGN1cnJlbnRIZWFkLnggLSAxO1xuICB9IGVsc2UgaWYgKG5ld0RpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgIG5ld0hlYWQueCA9IG5ld0hlYWQueCA+PSBjb25maWcud2lkdGggPyAxIDogY3VycmVudEhlYWQueCArIDE7XG4gIH1cblxuICAvLyBDaGVjayBpZiB3ZSd2ZSBoaXQgYW5vdGhlciBzbmFrZVxuICBpZiAoc25ha2VBdChyb3VuZCwgbmV3SGVhZCkpIHtcbiAgICAvLyBUcnVuY2F0ZSB0aGUgc25ha2UgdG8ganVzdCB0aGUgaGVhZCwgYW5kIGlnbm9yZSB0aGUgcmVxdWVzdGVkIG1vdmVcbiAgICBoZWFkU2VnbWVudC5sZW5ndGggPSAxO1xuICAgIHNuYWtlLnNlZ21lbnRzID0gW2hlYWRTZWdtZW50XTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBDaGVjayBpZiB3ZSd2ZSBoaXQgYW4gYXBwbGVcbiAgY29uc3QgYXBwbGVJZCA9IGFwcGxlQXQocm91bmQsIG5ld0hlYWQpO1xuICBpZiAoYXBwbGVJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gU25ha2UgYXRlIGFuIGFwcGxlLCBzZXQgYXBwbGVJZFxuICAgIHNuYWtlLmF0ZUFwcGxlSWQgPSBhcHBsZUlkO1xuICAgIHRhaWxTZWdtZW50Lmxlbmd0aCArPSAxOyAgLy8gR3JvdyB0aGUgc25ha2UgYnkgaW5jcmVhc2luZyB0aGUgdGFpbCBsZW5ndGhcbiAgfVxuXG4gIGhlYWRTZWdtZW50LmhlYWQgPSBuZXdIZWFkO1xuXG4gIC8vIE1hbmFnZSBzbmFrZSBzZWdtZW50IGdyb3d0aCBhbmQgc2hyaW5raW5nXG4gIGlmIChzbmFrZS5zZWdtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgaGVhZFNlZ21lbnQubGVuZ3RoICs9IDE7XG4gICAgdGFpbFNlZ21lbnQubGVuZ3RoIC09IDE7XG5cbiAgICAvLyBSZW1vdmUgdGhlIHRhaWwgc2VnbWVudCBpZiBpdHMgbGVuZ3RoIHJlYWNoZXMgMFxuICAgIGlmICh0YWlsU2VnbWVudC5sZW5ndGggPT09IDApIHtcbiAgICAgIHNuYWtlLnNlZ21lbnRzLnBvcCgpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhZ2FpbnN0QW5FZGdlKHJvdW5kOiBSb3VuZCwgcG9pbnQ6IFBvaW50LCBkaXJlY3Rpb246IERpcmVjdGlvbik6IGJvb2xlYW4ge1xuICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgcmV0dXJuIHBvaW50LnkgPT09IDE7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICByZXR1cm4gcG9pbnQueSA9PT0gcm91bmQuY29uZmlnLmhlaWdodDtcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIHJldHVybiBwb2ludC54ID09PSAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwb2ludC54ID09PSByb3VuZC5jb25maWcud2lkdGg7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbGVBdChyb3VuZDogUm91bmQsIHBvaW50OiBQb2ludCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGZvciAoY29uc3QgW2lkLCBhcHBsZV0gb2YgT2JqZWN0LmVudHJpZXMocm91bmQuYXBwbGVzKSkge1xuICAgIGlmIChhcHBsZS54ID09PSBwb2ludC54ICYmIGFwcGxlLnkgPT09IHBvaW50LnkpIHtcbiAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUG9zaXRpb24oc2VnbWVudDogU2VnbWVudCk6IHsgdDogbnVtYmVyLCBsOiBudW1iZXIsIGI6IG51bWJlciwgcjogbnVtYmVyIH0ge1xuICBjb25zdCB7IGRpcmVjdGlvbiwgaGVhZDogc3RhcnQsIGxlbmd0aCB9ID0gc2VnbWVudDtcbiAgbGV0IFt0LCBiXSA9IFtzdGFydC55LCBzdGFydC55XTtcbiAgbGV0IFtsLCByXSA9IFtzdGFydC54LCBzdGFydC54XTtcblxuICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgYiA9IHQgKyAobGVuZ3RoIC0gMSk7XG4gIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICB0ID0gYiAtIChsZW5ndGggLSAxKTtcbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgIHIgPSBsICsgKGxlbmd0aCAtIDEpO1xuICB9IGVsc2Uge1xuICAgIGwgPSByIC0gKGxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHsgdCwgbCwgYiwgciB9O1xufVxuXG5mdW5jdGlvbiBzbmFrZUF0KHJvdW5kOiBSb3VuZCwgcG9pbnQ6IFBvaW50KTogU25ha2UgfCB1bmRlZmluZWQge1xuICBmb3IgKGNvbnN0IHNuYWtlIG9mIE9iamVjdC52YWx1ZXMocm91bmQuc25ha2VzKSkge1xuICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzbmFrZS5zZWdtZW50cykge1xuICAgICAgY29uc3QgcG9zID0gY2FsY3VsYXRlUG9zaXRpb24oc2VnbWVudCk7XG5cbiAgICAgIGlmIChwb2ludC54ID49IHBvcy5sICYmIHBvaW50LnggPD0gcG9zLnIgJiYgcG9pbnQueSA+PSBwb3MudCAmJiBwb2ludC55IDw9IHBvcy5iKSB7XG4gICAgICAgIHJldHVybiBzbmFrZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiByYW5kb21FbXB0eVBvaW50KHJvdW5kOiBSb3VuZCk6IFBvaW50IHtcbiAgbGV0IHBvaW50ID0geyB4OiBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIHJvdW5kLmNvbmZpZy53aWR0aCksIHk6IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcm91bmQuY29uZmlnLmhlaWdodCkgfTtcbiAgLy8gQ2hlY2sgaWYgYW55IGFwcGxlIGlzIGF0IHRoZSBwb2ludFxuICB3aGlsZSAoYXBwbGVBdChyb3VuZCwgcG9pbnQpIHx8IHNuYWtlQXQocm91bmQsIHBvaW50KSkge1xuICAgIHBvaW50ID0geyB4OiBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIHJvdW5kLmNvbmZpZy53aWR0aCksIHk6IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogcm91bmQuY29uZmlnLmhlaWdodCkgfTtcbiAgfVxuICByZXR1cm4gcG9pbnQ7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUm91bmRUZWFtcyhnYW1lOiBHYW1lKTogVGVhbXMge1xuICBjb25zdCB0ZWFtczogVGVhbXMgPSB7fTtcblxuICBmb3IgKGNvbnN0IHRlYW0gb2YgT2JqZWN0LnZhbHVlcyhnYW1lLnRlYW1zKSkge1xuICAgIHRlYW1zW3RlYW0ubmFtZV0gPSB7IG5hbWU6IHRlYW0ubmFtZSwgc2NvcmU6IDAgfTtcbiAgfVxuXG4gIHJldHVybiB0ZWFtcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRXb3JrZXJNYW5hZ2Vycyhjb3VudDogbnVtYmVyKSB7XG4gIGNvbnN0IHNuYWtlV29ya2VyTWFuYWdlcnMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudCB9KS5tYXAoKF8sIGkpID0+IHtcbiAgICBjb25zdCBpZGVudGl0eSA9IGBzbmFrZS13b3JrZXItJHtpICsgMX1gO1xuICAgIHJldHVybiBzdGFydENoaWxkKFNuYWtlV29ya2VyV29ya2Zsb3csIHtcbiAgICAgIHdvcmtmbG93SWQ6IGlkZW50aXR5LFxuICAgICAgYXJnczogW3sgcm91bmRJZDogUk9VTkRfV0ZfSUQsIGlkZW50aXR5IH1dLFxuICAgIH0pO1xuICB9KVxuICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoc25ha2VXb3JrZXJNYW5hZ2Vycyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0U25ha2VzKGNvbmZpZzogR2FtZUNvbmZpZywgc25ha2VzOiBTbmFrZXMpIHtcbiAgY29uc3QgY29tbWFuZHMgPSBPYmplY3QudmFsdWVzKHNuYWtlcykubWFwKChzbmFrZSkgPT5cbiAgICBzdGFydENoaWxkKFNuYWtlV29ya2Zsb3csIHtcbiAgICAgIHdvcmtmbG93SWQ6IHNuYWtlLmlkLFxuICAgICAgdGFza1F1ZXVlOiAnc25ha2VzJyxcbiAgICAgIGFyZ3M6IFt7XG4gICAgICAgIHJvdW5kSWQ6IFJPVU5EX1dGX0lELFxuICAgICAgICBpZDogc25ha2UuaWQsXG4gICAgICAgIGRpcmVjdGlvbjogc25ha2Uuc2VnbWVudHNbMF0uZGlyZWN0aW9uLFxuICAgICAgICBub21BY3Rpdml0eTogY29uZmlnLm5vbUFjdGl2aXR5LFxuICAgICAgICBub21zUGVyTW92ZTogY29uZmlnLm5vbXNQZXJNb3ZlLFxuICAgICAgICBub21EdXJhdGlvbjogY29uZmlnLm5vbUR1cmF0aW9uLFxuICAgICAgfV1cbiAgICB9KVxuICApXG5cbiAgYXdhaXQgUHJvbWlzZS5hbGwoY29tbWFuZHMpO1xufVxuXG5mdW5jdGlvbiByYW5kb21pemVSb3VuZChyb3VuZDogUm91bmQpIHtcbiAgZm9yIChjb25zdCBzbmFrZSBvZiBPYmplY3QudmFsdWVzKHJvdW5kLnNuYWtlcykpIHtcbiAgICBzbmFrZS5zZWdtZW50cyA9IFtcbiAgICAgIHsgaGVhZDogcmFuZG9tRW1wdHlQb2ludChyb3VuZCksIGRpcmVjdGlvbjogcmFuZG9tRGlyZWN0aW9uKCksIGxlbmd0aDogMSB9XG4gICAgXVxuICB9XG59XG4iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEhlbHBlcnMuXG5jb25zdCBzID0gMTAwMDtcbmNvbnN0IG0gPSBzICogNjA7XG5jb25zdCBoID0gbSAqIDYwO1xuY29uc3QgZCA9IGggKiAyNDtcbmNvbnN0IHcgPSBkICogNztcbmNvbnN0IHkgPSBkICogMzY1LjI1O1xuZnVuY3Rpb24gbXModmFsdWUsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2UodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucz8ubG9uZyA/IGZtdExvbmcodmFsdWUpIDogZm10U2hvcnQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgaXMgbm90IGEgc3RyaW5nIG9yIG51bWJlci4nKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBpc0Vycm9yKGVycm9yKVxuICAgICAgICAgICAgPyBgJHtlcnJvci5tZXNzYWdlfS4gdmFsdWU9JHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YFxuICAgICAgICAgICAgOiAnQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJlZC4nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxufVxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgZXhjZWVkcyB0aGUgbWF4aW11bSBsZW5ndGggb2YgMTAwIGNoYXJhY3RlcnMuJyk7XG4gICAgfVxuICAgIGNvbnN0IG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgY29uc3QgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICBjYXNlICd5cnMnOlxuICAgICAgICBjYXNlICd5cic6XG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB5O1xuICAgICAgICBjYXNlICd3ZWVrcyc6XG4gICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgIHJldHVybiBuICogdztcbiAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBkO1xuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdocnMnOlxuICAgICAgICBjYXNlICdocic6XG4gICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBoO1xuICAgICAgICBjYXNlICdtaW51dGVzJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWlucyc6XG4gICAgICAgIGNhc2UgJ21pbic6XG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBtO1xuICAgICAgICBjYXNlICdzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlYyc6XG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBzO1xuICAgICAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgICAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgICAgIGNhc2UgJ21zZWNzJzpcbiAgICAgICAgY2FzZSAnbXNlYyc6XG4gICAgICAgIGNhc2UgJ21zJzpcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgb2NjdXIuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB1bml0ICR7dHlwZX0gd2FzIG1hdGNoZWQsIGJ1dCBubyBtYXRjaGluZyBjYXNlIGV4aXN0cy5gKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBtcztcbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gZCl9ZGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gaCl9aGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gbSl9bWA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gcyl9c2A7XG4gICAgfVxuICAgIHJldHVybiBgJHttc31tc2A7XG59XG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gICAgY29uc3QgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBtLCAnbWludXRlJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gICAgfVxuICAgIHJldHVybiBgJHttc30gbXNgO1xufVxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICAgIGNvbnN0IGlzUGx1cmFsID0gbXNBYnMgPj0gbiAqIDEuNTtcbiAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG4pfSAke25hbWV9JHtpc1BsdXJhbCA/ICdzJyA6ICcnfWA7XG59XG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3IgZXJyb3JzLlxuICovXG5mdW5jdGlvbiBpc0Vycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT09IG51bGwgJiYgJ21lc3NhZ2UnIGluIGVycm9yO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0O1xuIiwiLy8gR0VORVJBVEVEIEZJTEUuIERPIE5PVCBFRElULlxudmFyIExvbmcgPSAoZnVuY3Rpb24oZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0pO1xuICBleHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG4gIFxuICAvKipcbiAgICogQGxpY2Vuc2VcbiAgICogQ29weXJpZ2h0IDIwMDkgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzXG4gICAqIENvcHlyaWdodCAyMDIwIERhbmllbCBXaXJ0eiAvIFRoZSBsb25nLmpzIEF1dGhvcnMuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKlxuICAgKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICAgKi9cbiAgLy8gV2ViQXNzZW1ibHkgb3B0aW1pemF0aW9ucyB0byBkbyBuYXRpdmUgaTY0IG11bHRpcGxpY2F0aW9uIGFuZCBkaXZpZGVcbiAgdmFyIHdhc20gPSBudWxsO1xuICBcbiAgdHJ5IHtcbiAgICB3YXNtID0gbmV3IFdlYkFzc2VtYmx5Lkluc3RhbmNlKG5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobmV3IFVpbnQ4QXJyYXkoWzAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgMTMsIDIsIDk2LCAwLCAxLCAxMjcsIDk2LCA0LCAxMjcsIDEyNywgMTI3LCAxMjcsIDEsIDEyNywgMywgNywgNiwgMCwgMSwgMSwgMSwgMSwgMSwgNiwgNiwgMSwgMTI3LCAxLCA2NSwgMCwgMTEsIDcsIDUwLCA2LCAzLCAxMDksIDExNywgMTA4LCAwLCAxLCA1LCAxMDAsIDEwNSwgMTE4LCA5NSwgMTE1LCAwLCAyLCA1LCAxMDAsIDEwNSwgMTE4LCA5NSwgMTE3LCAwLCAzLCA1LCAxMTQsIDEwMSwgMTA5LCA5NSwgMTE1LCAwLCA0LCA1LCAxMTQsIDEwMSwgMTA5LCA5NSwgMTE3LCAwLCA1LCA4LCAxMDMsIDEwMSwgMTE2LCA5NSwgMTA0LCAxMDUsIDEwMywgMTA0LCAwLCAwLCAxMCwgMTkxLCAxLCA2LCA0LCAwLCAzNSwgMCwgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNiwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI3LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjgsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyOSwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTMwLCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExXSkpLCB7fSkuZXhwb3J0cztcbiAgfSBjYXRjaCAoZSkgey8vIG5vIHdhc20gc3VwcG9ydCA6KFxuICB9XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciwgZ2l2ZW4gaXRzIGxvdyBhbmQgaGlnaCAzMiBiaXQgdmFsdWVzIGFzICpzaWduZWQqIGludGVnZXJzLlxuICAgKiAgU2VlIHRoZSBmcm9tKiBmdW5jdGlvbnMgYmVsb3cgZm9yIG1vcmUgY29udmVuaWVudCB3YXlzIG9mIGNvbnN0cnVjdGluZyBMb25ncy5cbiAgICogQGV4cG9ydHMgTG9uZ1xuICAgKiBAY2xhc3MgQSBMb25nIGNsYXNzIGZvciByZXByZXNlbnRpbmcgYSA2NCBiaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyIHZhbHVlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93IFRoZSBsb3cgKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaCBUaGUgaGlnaCAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBcbiAgXG4gIGZ1bmN0aW9uIExvbmcobG93LCBoaWdoLCB1bnNpZ25lZCkge1xuICAgIC8qKlxuICAgICAqIFRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG93ID0gbG93IHwgMDtcbiAgICAvKipcbiAgICAgKiBUaGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gIFxuICAgIHRoaXMuaGlnaCA9IGhpZ2ggfCAwO1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICBcbiAgICB0aGlzLnVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgfSAvLyBUaGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSBsb25nIGlzIHRoZSB0d28gZ2l2ZW4gc2lnbmVkLCAzMi1iaXQgdmFsdWVzLlxuICAvLyBXZSB1c2UgMzItYml0IHBpZWNlcyBiZWNhdXNlIHRoZXNlIGFyZSB0aGUgc2l6ZSBvZiBpbnRlZ2VycyBvbiB3aGljaFxuICAvLyBKYXZhc2NyaXB0IHBlcmZvcm1zIGJpdC1vcGVyYXRpb25zLiAgRm9yIG9wZXJhdGlvbnMgbGlrZSBhZGRpdGlvbiBhbmRcbiAgLy8gbXVsdGlwbGljYXRpb24sIHdlIHNwbGl0IGVhY2ggbnVtYmVyIGludG8gMTYgYml0IHBpZWNlcywgd2hpY2ggY2FuIGVhc2lseSBiZVxuICAvLyBtdWx0aXBsaWVkIHdpdGhpbiBKYXZhc2NyaXB0J3MgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gd2l0aG91dCBvdmVyZmxvd1xuICAvLyBvciBjaGFuZ2UgaW4gc2lnbi5cbiAgLy9cbiAgLy8gSW4gdGhlIGFsZ29yaXRobXMgYmVsb3csIHdlIGZyZXF1ZW50bHkgcmVkdWNlIHRoZSBuZWdhdGl2ZSBjYXNlIHRvIHRoZVxuICAvLyBwb3NpdGl2ZSBjYXNlIGJ5IG5lZ2F0aW5nIHRoZSBpbnB1dChzKSBhbmQgdGhlbiBwb3N0LXByb2Nlc3NpbmcgdGhlIHJlc3VsdC5cbiAgLy8gTm90ZSB0aGF0IHdlIG11c3QgQUxXQVlTIGNoZWNrIHNwZWNpYWxseSB3aGV0aGVyIHRob3NlIHZhbHVlcyBhcmUgTUlOX1ZBTFVFXG4gIC8vICgtMl42MykgYmVjYXVzZSAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRSAoc2luY2UgMl42MyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgYXNcbiAgLy8gYSBwb3NpdGl2ZSBudW1iZXIsIGl0IG92ZXJmbG93cyBiYWNrIGludG8gYSBuZWdhdGl2ZSkuICBOb3QgaGFuZGxpbmcgdGhpc1xuICAvLyBjYXNlIHdvdWxkIG9mdGVuIHJlc3VsdCBpbiBpbmZpbml0ZSByZWN1cnNpb24uXG4gIC8vXG4gIC8vIENvbW1vbiBjb25zdGFudCB2YWx1ZXMgWkVSTywgT05FLCBORUdfT05FLCBldGMuIGFyZSBkZWZpbmVkIGJlbG93IHRoZSBmcm9tKlxuICAvLyBtZXRob2RzIG9uIHdoaWNoIHRoZXkgZGVwZW5kLlxuICBcbiAgLyoqXG4gICAqIEFuIGluZGljYXRvciB1c2VkIHRvIHJlbGlhYmx5IGRldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBMb25nIG9yIG5vdC5cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBjb25zdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLnByb3RvdHlwZS5fX2lzTG9uZ19fO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9uZy5wcm90b3R5cGUsIFwiX19pc0xvbmdfX1wiLCB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSk7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSBvYmogT2JqZWN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBpc0xvbmcob2JqKSB7XG4gICAgcmV0dXJuIChvYmogJiYgb2JqW1wiX19pc0xvbmdfX1wiXSkgPT09IHRydWU7XG4gIH1cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IHZhbHVlIG51bWJlclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBcbiAgZnVuY3Rpb24gY3R6MzIodmFsdWUpIHtcbiAgICB2YXIgYyA9IE1hdGguY2x6MzIodmFsdWUgJiAtdmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZSA/IDMxIC0gYyA6IGM7XG4gIH1cbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGlzIGEgTG9uZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gb2JqIE9iamVjdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZy5pc0xvbmcgPSBpc0xvbmc7XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBMb25nIHJlcHJlc2VudGF0aW9ucyBvZiBzbWFsbCBpbnRlZ2VyIHZhbHVlcy5cbiAgICogQHR5cGUgeyFPYmplY3R9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBJTlRfQ0FDSEUgPSB7fTtcbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLlxuICAgKiBAdHlwZSB7IU9iamVjdH1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVJTlRfQ0FDSEUgPSB7fTtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21JbnQodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgdmFyIG9iaiwgY2FjaGVkT2JqLCBjYWNoZTtcbiAgXG4gICAgaWYgKHVuc2lnbmVkKSB7XG4gICAgICB2YWx1ZSA+Pj49IDA7XG4gIFxuICAgICAgaWYgKGNhY2hlID0gMCA8PSB2YWx1ZSAmJiB2YWx1ZSA8IDI1Nikge1xuICAgICAgICBjYWNoZWRPYmogPSBVSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgaWYgKGNhY2hlZE9iaikgcmV0dXJuIGNhY2hlZE9iajtcbiAgICAgIH1cbiAgXG4gICAgICBvYmogPSBmcm9tQml0cyh2YWx1ZSwgMCwgdHJ1ZSk7XG4gICAgICBpZiAoY2FjaGUpIFVJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgfD0gMDtcbiAgXG4gICAgICBpZiAoY2FjaGUgPSAtMTI4IDw9IHZhbHVlICYmIHZhbHVlIDwgMTI4KSB7XG4gICAgICAgIGNhY2hlZE9iaiA9IElOVF9DQUNIRVt2YWx1ZV07XG4gICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICB9XG4gIFxuICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIHZhbHVlIDwgMCA/IC0xIDogMCwgZmFsc2UpO1xuICAgICAgaWYgKGNhY2hlKSBJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gMzIgYml0IGludGVnZXIgdmFsdWUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIDMyIGJpdCBpbnRlZ2VyIGluIHF1ZXN0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUludCA9IGZyb21JbnQ7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tTnVtYmVyKHZhbHVlLCB1bnNpZ25lZCkge1xuICAgIGlmIChpc05hTih2YWx1ZSkpIHJldHVybiB1bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgXG4gICAgaWYgKHVuc2lnbmVkKSB7XG4gICAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gVVpFUk87XG4gICAgICBpZiAodmFsdWUgPj0gVFdPX1BXUl82NF9EQkwpIHJldHVybiBNQVhfVU5TSUdORURfVkFMVUU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2YWx1ZSA8PSAtVFdPX1BXUl82M19EQkwpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgICBpZiAodmFsdWUgKyAxID49IFRXT19QV1JfNjNfREJMKSByZXR1cm4gTUFYX1ZBTFVFO1xuICAgIH1cbiAgXG4gICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIGZyb21OdW1iZXIoLXZhbHVlLCB1bnNpZ25lZCkubmVnKCk7XG4gICAgcmV0dXJuIGZyb21CaXRzKHZhbHVlICUgVFdPX1BXUl8zMl9EQkwgfCAwLCB2YWx1ZSAvIFRXT19QV1JfMzJfREJMIHwgMCwgdW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIHZhbHVlLCBwcm92aWRlZCB0aGF0IGl0IGlzIGEgZmluaXRlIG51bWJlci4gT3RoZXJ3aXNlLCB6ZXJvIGlzIHJldHVybmVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSBudW1iZXIgaW4gcXVlc3Rpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tTnVtYmVyID0gZnJvbU51bWJlcjtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3dCaXRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21CaXRzKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIDY0IGJpdCBpbnRlZ2VyIHRoYXQgY29tZXMgYnkgY29uY2F0ZW5hdGluZyB0aGUgZ2l2ZW4gbG93IGFuZCBoaWdoIGJpdHMuIEVhY2ggaXNcbiAgICogIGFzc3VtZWQgdG8gdXNlIDMyIGJpdHMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0cyBUaGUgbG93IDMyIGJpdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzIFRoZSBoaWdoIDMyIGJpdHNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQml0cyA9IGZyb21CaXRzO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiYXNlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBleHBvbmVudFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgcG93X2RibCA9IE1hdGgucG93OyAvLyBVc2VkIDQgdGltZXMgKDQqOCB0byAxNSs0KVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICogQHBhcmFtIHsoYm9vbGVhbnxudW1iZXIpPX0gdW5zaWduZWRcbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21TdHJpbmcoc3RyLCB1bnNpZ25lZCwgcmFkaXgpIHtcbiAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkgdGhyb3cgRXJyb3IoJ2VtcHR5IHN0cmluZycpO1xuICBcbiAgICBpZiAodHlwZW9mIHVuc2lnbmVkID09PSAnbnVtYmVyJykge1xuICAgICAgLy8gRm9yIGdvb2cubWF0aC5sb25nIGNvbXBhdGliaWxpdHlcbiAgICAgIHJhZGl4ID0gdW5zaWduZWQ7XG4gICAgICB1bnNpZ25lZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gICAgfVxuICBcbiAgICBpZiAoc3RyID09PSBcIk5hTlwiIHx8IHN0ciA9PT0gXCJJbmZpbml0eVwiIHx8IHN0ciA9PT0gXCIrSW5maW5pdHlcIiB8fCBzdHIgPT09IFwiLUluZmluaXR5XCIpIHJldHVybiB1bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcigncmFkaXgnKTtcbiAgICB2YXIgcDtcbiAgICBpZiAoKHAgPSBzdHIuaW5kZXhPZignLScpKSA+IDApIHRocm93IEVycm9yKCdpbnRlcmlvciBoeXBoZW4nKTtlbHNlIGlmIChwID09PSAwKSB7XG4gICAgICByZXR1cm4gZnJvbVN0cmluZyhzdHIuc3Vic3RyaW5nKDEpLCB1bnNpZ25lZCwgcmFkaXgpLm5lZygpO1xuICAgIH0gLy8gRG8gc2V2ZXJhbCAoOCkgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICBcbiAgICB2YXIgcmFkaXhUb1Bvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCA4KSk7XG4gICAgdmFyIHJlc3VsdCA9IFpFUk87XG4gIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSA4KSB7XG4gICAgICB2YXIgc2l6ZSA9IE1hdGgubWluKDgsIHN0ci5sZW5ndGggLSBpKSxcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoaSwgaSArIHNpemUpLCByYWRpeCk7XG4gIFxuICAgICAgaWYgKHNpemUgPCA4KSB7XG4gICAgICAgIHZhciBwb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgc2l6ZSkpO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsKHBvd2VyKS5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChyYWRpeFRvUG93ZXIpO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQuYWRkKGZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgIH1cbiAgICB9XG4gIFxuICAgIHJlc3VsdC51bnNpZ25lZCA9IHVuc2lnbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBzdHJpbmcsIHdyaXR0ZW4gdXNpbmcgdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIExvbmdcbiAgICogQHBhcmFtIHsoYm9vbGVhbnxudW1iZXIpPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4IFRoZSByYWRpeCBpbiB3aGljaCB0aGUgdGV4dCBpcyB3cml0dGVuICgyLTM2KSwgZGVmYXVsdHMgdG8gMTBcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbVN0cmluZyA9IGZyb21TdHJpbmc7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfCF7bG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciwgdW5zaWduZWQ6IGJvb2xlYW59fSB2YWxcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tVmFsdWUodmFsLCB1bnNpZ25lZCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgcmV0dXJuIGZyb21OdW1iZXIodmFsLCB1bnNpZ25lZCk7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSByZXR1cm4gZnJvbVN0cmluZyh2YWwsIHVuc2lnbmVkKTsgLy8gVGhyb3dzIGZvciBub24tb2JqZWN0cywgY29udmVydHMgbm9uLWluc3RhbmNlb2YgTG9uZzpcbiAgXG4gICAgcmV0dXJuIGZyb21CaXRzKHZhbC5sb3csIHZhbC5oaWdoLCB0eXBlb2YgdW5zaWduZWQgPT09ICdib29sZWFuJyA/IHVuc2lnbmVkIDogdmFsLnVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogQ29udmVydHMgdGhlIHNwZWNpZmllZCB2YWx1ZSB0byBhIExvbmcgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIGZyb20qIGZ1bmN0aW9uIGZvciBpdHMgdHlwZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsIFZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21WYWx1ZSA9IGZyb21WYWx1ZTsgLy8gTk9URTogdGhlIGNvbXBpbGVyIHNob3VsZCBpbmxpbmUgdGhlc2UgY29uc3RhbnQgdmFsdWVzIGJlbG93IGFuZCB0aGVuIHJlbW92ZSB0aGVzZSB2YXJpYWJsZXMsIHNvIHRoZXJlIHNob3VsZCBiZVxuICAvLyBubyBydW50aW1lIHBlbmFsdHkgZm9yIHRoZXNlLlxuICBcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8xNl9EQkwgPSAxIDw8IDE2O1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzI0X0RCTCA9IDEgPDwgMjQ7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMzJfREJMID0gVFdPX1BXUl8xNl9EQkwgKiBUV09fUFdSXzE2X0RCTDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl82NF9EQkwgPSBUV09fUFdSXzMyX0RCTCAqIFRXT19QV1JfMzJfREJMO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzYzX0RCTCA9IFRXT19QV1JfNjRfREJMIC8gMjtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzI0ID0gZnJvbUludChUV09fUFdSXzI0X0RCTCk7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBaRVJPID0gZnJvbUludCgwKTtcbiAgLyoqXG4gICAqIFNpZ25lZCB6ZXJvLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5aRVJPID0gWkVSTztcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVaRVJPID0gZnJvbUludCgwLCB0cnVlKTtcbiAgLyoqXG4gICAqIFVuc2lnbmVkIHplcm8uXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlVaRVJPID0gVVpFUk87XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBPTkUgPSBmcm9tSW50KDEpO1xuICAvKipcbiAgICogU2lnbmVkIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuT05FID0gT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVU9ORSA9IGZyb21JbnQoMSwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBVbnNpZ25lZCBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlVPTkUgPSBVT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTkVHX09ORSA9IGZyb21JbnQoLTEpO1xuICAvKipcbiAgICogU2lnbmVkIG5lZ2F0aXZlIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTkVHX09ORSA9IE5FR19PTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNQVhfVkFMVUUgPSBmcm9tQml0cygweEZGRkZGRkZGIHwgMCwgMHg3RkZGRkZGRiB8IDAsIGZhbHNlKTtcbiAgLyoqXG4gICAqIE1heGltdW0gc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NQVhfVkFMVUUgPSBNQVhfVkFMVUU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNQVhfVU5TSUdORURfVkFMVUUgPSBmcm9tQml0cygweEZGRkZGRkZGIHwgMCwgMHhGRkZGRkZGRiB8IDAsIHRydWUpO1xuICAvKipcbiAgICogTWF4aW11bSB1bnNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUFYX1VOU0lHTkVEX1ZBTFVFID0gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUlOX1ZBTFVFID0gZnJvbUJpdHMoMCwgMHg4MDAwMDAwMCB8IDAsIGZhbHNlKTtcbiAgLyoqXG4gICAqIE1pbmltdW0gc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NSU5fVkFMVUUgPSBNSU5fVkFMVUU7XG4gIC8qKlxuICAgKiBAYWxpYXMgTG9uZy5wcm90b3R5cGVcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIExvbmdQcm90b3R5cGUgPSBMb25nLnByb3RvdHlwZTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgMzIgYml0IGludGVnZXIsIGFzc3VtaW5nIGl0IGlzIGEgMzIgYml0IGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnRvSW50ID0gZnVuY3Rpb24gdG9JbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWQgPyB0aGlzLmxvdyA+Pj4gMCA6IHRoaXMubG93O1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSB0aGUgbmVhcmVzdCBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHZhbHVlIChkb3VibGUsIDUzIGJpdCBtYW50aXNzYSkuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b051bWJlciA9IGZ1bmN0aW9uIHRvTnVtYmVyKCkge1xuICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gKHRoaXMuaGlnaCA+Pj4gMCkgKiBUV09fUFdSXzMyX0RCTCArICh0aGlzLmxvdyA+Pj4gMCk7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgc3RyaW5nIHdyaXR0ZW4gaW4gdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4IFJhZGl4ICgyLTM2KSwgZGVmYXVsdHMgdG8gMTBcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICogQG92ZXJyaWRlXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGByYWRpeGAgaXMgb3V0IG9mIHJhbmdlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyhyYWRpeCkge1xuICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKCdyYWRpeCcpO1xuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gJzAnO1xuICBcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGNoYW5nZSB0aGUgTG9uZyB2YWx1ZSBiZWZvcmUgaXQgY2FuIGJlIG5lZ2F0ZWQsIHNvIHdlIHJlbW92ZVxuICAgICAgICAvLyB0aGUgYm90dG9tLW1vc3QgZGlnaXQgaW4gdGhpcyBiYXNlIGFuZCB0aGVuIHJlY3Vyc2UgdG8gZG8gdGhlIHJlc3QuXG4gICAgICAgIHZhciByYWRpeExvbmcgPSBmcm9tTnVtYmVyKHJhZGl4KSxcbiAgICAgICAgICAgIGRpdiA9IHRoaXMuZGl2KHJhZGl4TG9uZyksXG4gICAgICAgICAgICByZW0xID0gZGl2Lm11bChyYWRpeExvbmcpLnN1Yih0aGlzKTtcbiAgICAgICAgcmV0dXJuIGRpdi50b1N0cmluZyhyYWRpeCkgKyByZW0xLnRvSW50KCkudG9TdHJpbmcocmFkaXgpO1xuICAgICAgfSBlbHNlIHJldHVybiAnLScgKyB0aGlzLm5lZygpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICB9IC8vIERvIHNldmVyYWwgKDYpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgXG4gIFxuICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDYpLCB0aGlzLnVuc2lnbmVkKSxcbiAgICAgICAgcmVtID0gdGhpcztcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gIFxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgcmVtRGl2ID0gcmVtLmRpdihyYWRpeFRvUG93ZXIpLFxuICAgICAgICAgIGludHZhbCA9IHJlbS5zdWIocmVtRGl2Lm11bChyYWRpeFRvUG93ZXIpKS50b0ludCgpID4+PiAwLFxuICAgICAgICAgIGRpZ2l0cyA9IGludHZhbC50b1N0cmluZyhyYWRpeCk7XG4gICAgICByZW0gPSByZW1EaXY7XG4gICAgICBpZiAocmVtLmlzWmVybygpKSByZXR1cm4gZGlnaXRzICsgcmVzdWx0O2Vsc2Uge1xuICAgICAgICB3aGlsZSAoZGlnaXRzLmxlbmd0aCA8IDYpIGRpZ2l0cyA9ICcwJyArIGRpZ2l0cztcbiAgXG4gICAgICAgIHJlc3VsdCA9ICcnICsgZGlnaXRzICsgcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhIHNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNpZ25lZCBoaWdoIGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRIaWdoQml0cyA9IGZ1bmN0aW9uIGdldEhpZ2hCaXRzKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2g7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBoaWdoIGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRIaWdoQml0c1Vuc2lnbmVkID0gZnVuY3Rpb24gZ2V0SGlnaEJpdHNVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID4+PiAwO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTaWduZWQgbG93IGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzID0gZnVuY3Rpb24gZ2V0TG93Qml0cygpIHtcbiAgICByZXR1cm4gdGhpcy5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb3cgMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFVuc2lnbmVkIGxvdyBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TG93Qml0c1Vuc2lnbmVkID0gZnVuY3Rpb24gZ2V0TG93Qml0c1Vuc2lnbmVkKCkge1xuICAgIHJldHVybiB0aGlzLmxvdyA+Pj4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byByZXByZXNlbnQgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldE51bUJpdHNBYnMgPSBmdW5jdGlvbiBnZXROdW1CaXRzQWJzKCkge1xuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkgLy8gVW5zaWduZWQgTG9uZ3MgYXJlIG5ldmVyIG5lZ2F0aXZlXG4gICAgICByZXR1cm4gdGhpcy5lcShNSU5fVkFMVUUpID8gNjQgOiB0aGlzLm5lZygpLmdldE51bUJpdHNBYnMoKTtcbiAgICB2YXIgdmFsID0gdGhpcy5oaWdoICE9IDAgPyB0aGlzLmhpZ2ggOiB0aGlzLmxvdztcbiAgXG4gICAgZm9yICh2YXIgYml0ID0gMzE7IGJpdCA+IDA7IGJpdC0tKSBpZiAoKHZhbCAmIDEgPDwgYml0KSAhPSAwKSBicmVhaztcbiAgXG4gICAgcmV0dXJuIHRoaXMuaGlnaCAhPSAwID8gYml0ICsgMzMgOiBiaXQgKyAxO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHplcm8uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24gaXNaZXJvKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPT09IDAgJiYgdGhpcy5sb3cgPT09IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNpc1plcm99LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcXogPSBMb25nUHJvdG90eXBlLmlzWmVybztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG5lZ2F0aXZlLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuaXNOZWdhdGl2ZSA9IGZ1bmN0aW9uIGlzTmVnYXRpdmUoKSB7XG4gICAgcmV0dXJuICF0aGlzLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA8IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBwb3NpdGl2ZSBvciB6ZXJvLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzUG9zaXRpdmUgPSBmdW5jdGlvbiBpc1Bvc2l0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkIHx8IHRoaXMuaGlnaCA+PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgb2RkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzT2RkID0gZnVuY3Rpb24gaXNPZGQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmxvdyAmIDEpID09PSAxO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZXZlbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc0V2ZW4gPSBmdW5jdGlvbiBpc0V2ZW4oKSB7XG4gICAgcmV0dXJuICh0aGlzLmxvdyAmIDEpID09PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyhvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIGlmICh0aGlzLnVuc2lnbmVkICE9PSBvdGhlci51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPj4+IDMxID09PSAxICYmIG90aGVyLmhpZ2ggPj4+IDMxID09PSAxKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gb3RoZXIuaGlnaCAmJiB0aGlzLmxvdyA9PT0gb3RoZXIubG93O1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNlcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcSA9IExvbmdQcm90b3R5cGUuZXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubm90RXF1YWxzID0gZnVuY3Rpb24gbm90RXF1YWxzKG90aGVyKSB7XG4gICAgcmV0dXJuICF0aGlzLmVxKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubmVxID0gTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25vdEVxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubmUgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gbGVzc1RoYW4ob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA8IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFufS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubHQgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24gbGVzc1RoYW5PckVxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPD0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubHRlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGUgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gZ3JlYXRlclRoYW4ob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFufS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ3QgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24gZ3JlYXRlclRoYW5PckVxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPj0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ3RlID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ2UgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoaXMgTG9uZydzIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZShvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIGlmICh0aGlzLmVxKG90aGVyKSkgcmV0dXJuIDA7XG4gICAgdmFyIHRoaXNOZWcgPSB0aGlzLmlzTmVnYXRpdmUoKSxcbiAgICAgICAgb3RoZXJOZWcgPSBvdGhlci5pc05lZ2F0aXZlKCk7XG4gICAgaWYgKHRoaXNOZWcgJiYgIW90aGVyTmVnKSByZXR1cm4gLTE7XG4gICAgaWYgKCF0aGlzTmVnICYmIG90aGVyTmVnKSByZXR1cm4gMTsgLy8gQXQgdGhpcyBwb2ludCB0aGUgc2lnbiBiaXRzIGFyZSB0aGUgc2FtZVxuICBcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzLnN1YihvdGhlcikuaXNOZWdhdGl2ZSgpID8gLTEgOiAxOyAvLyBCb3RoIGFyZSBwb3NpdGl2ZSBpZiBhdCBsZWFzdCBvbmUgaXMgdW5zaWduZWRcbiAgXG4gICAgcmV0dXJuIG90aGVyLmhpZ2ggPj4+IDAgPiB0aGlzLmhpZ2ggPj4+IDAgfHwgb3RoZXIuaGlnaCA9PT0gdGhpcy5oaWdoICYmIG90aGVyLmxvdyA+Pj4gMCA+IHRoaXMubG93ID4+PiAwID8gLTEgOiAxO1xuICB9O1xuICAvKipcbiAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY29tcGFyZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICogIGlmIHRoZSBnaXZlbiBvbmUgaXMgZ3JlYXRlclxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNvbXAgPSBMb25nUHJvdG90eXBlLmNvbXBhcmU7XG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgTG9uZydzIHZhbHVlLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gTmVnYXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbiBuZWdhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkICYmIHRoaXMuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE1JTl9WQUxVRTtcbiAgICByZXR1cm4gdGhpcy5ub3QoKS5hZGQoT05FKTtcbiAgfTtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhpcyBMb25nJ3MgdmFsdWUuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbmVnYXRlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHshTG9uZ30gTmVnYXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubmVnID0gTG9uZ1Byb3RvdHlwZS5uZWdhdGU7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdW0gb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gYWRkZW5kIEFkZGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFN1bVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGFkZGVuZCkge1xuICAgIGlmICghaXNMb25nKGFkZGVuZCkpIGFkZGVuZCA9IGZyb21WYWx1ZShhZGRlbmQpOyAvLyBEaXZpZGUgZWFjaCBudW1iZXIgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBzdW0gdGhlIGNodW5rcy5cbiAgXG4gICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGEzMiA9IHRoaXMuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYjQ4ID0gYWRkZW5kLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBiMzIgPSBhZGRlbmQuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYjE2ID0gYWRkZW5kLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGIwMCA9IGFkZGVuZC5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGM0OCA9IDAsXG4gICAgICAgIGMzMiA9IDAsXG4gICAgICAgIGMxNiA9IDAsXG4gICAgICAgIGMwMCA9IDA7XG4gICAgYzAwICs9IGEwMCArIGIwMDtcbiAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICBjMDAgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMTYgKyBiMTY7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTMyICsgYjMyO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzQ4ICs9IGE0OCArIGI0ODtcbiAgICBjNDggJj0gMHhGRkZGO1xuICAgIHJldHVybiBmcm9tQml0cyhjMTYgPDwgMTYgfCBjMDAsIGM0OCA8PCAxNiB8IGMzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IHN1YnRyYWhlbmQgU3VidHJhaGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IERpZmZlcmVuY2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uIHN1YnRyYWN0KHN1YnRyYWhlbmQpIHtcbiAgICBpZiAoIWlzTG9uZyhzdWJ0cmFoZW5kKSkgc3VidHJhaGVuZCA9IGZyb21WYWx1ZShzdWJ0cmFoZW5kKTtcbiAgICByZXR1cm4gdGhpcy5hZGQoc3VidHJhaGVuZC5uZWcoKSk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzdWJ0cmFjdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IHN1YnRyYWhlbmQgU3VidHJhaGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IERpZmZlcmVuY2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zdWIgPSBMb25nUHJvdG90eXBlLnN1YnRyYWN0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICogQHJldHVybnMgeyFMb25nfSBQcm9kdWN0XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KG11bHRpcGxpZXIpIHtcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKCFpc0xvbmcobXVsdGlwbGllcikpIG11bHRpcGxpZXIgPSBmcm9tVmFsdWUobXVsdGlwbGllcik7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgdmFyIGxvdyA9IHdhc21bXCJtdWxcIl0odGhpcy5sb3csIHRoaXMuaGlnaCwgbXVsdGlwbGllci5sb3csIG11bHRpcGxpZXIuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBpZiAobXVsdGlwbGllci5pc1plcm8oKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIG11bHRpcGxpZXIuaXNPZGQoKSA/IE1JTl9WQUxVRSA6IFpFUk87XG4gICAgaWYgKG11bHRpcGxpZXIuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIHRoaXMuaXNPZGQoKSA/IE1JTl9WQUxVRSA6IFpFUk87XG4gIFxuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgaWYgKG11bHRpcGxpZXIuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5uZWcoKS5tdWwobXVsdGlwbGllci5uZWcoKSk7ZWxzZSByZXR1cm4gdGhpcy5uZWcoKS5tdWwobXVsdGlwbGllcikubmVnKCk7XG4gICAgfSBlbHNlIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubXVsKG11bHRpcGxpZXIubmVnKCkpLm5lZygpOyAvLyBJZiBib3RoIGxvbmdzIGFyZSBzbWFsbCwgdXNlIGZsb2F0IG11bHRpcGxpY2F0aW9uXG4gIFxuICBcbiAgICBpZiAodGhpcy5sdChUV09fUFdSXzI0KSAmJiBtdWx0aXBsaWVyLmx0KFRXT19QV1JfMjQpKSByZXR1cm4gZnJvbU51bWJlcih0aGlzLnRvTnVtYmVyKCkgKiBtdWx0aXBsaWVyLnRvTnVtYmVyKCksIHRoaXMudW5zaWduZWQpOyAvLyBEaXZpZGUgZWFjaCBsb25nIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gYWRkIHVwIDR4NCBwcm9kdWN0cy5cbiAgICAvLyBXZSBjYW4gc2tpcCBwcm9kdWN0cyB0aGF0IHdvdWxkIG92ZXJmbG93LlxuICBcbiAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBhMTYgPSB0aGlzLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhGRkZGO1xuICAgIHZhciBiNDggPSBtdWx0aXBsaWVyLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBiMzIgPSBtdWx0aXBsaWVyLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGIxNiA9IG11bHRpcGxpZXIubG93ID4+PiAxNjtcbiAgICB2YXIgYjAwID0gbXVsdGlwbGllci5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGM0OCA9IDAsXG4gICAgICAgIGMzMiA9IDAsXG4gICAgICAgIGMxNiA9IDAsXG4gICAgICAgIGMwMCA9IDA7XG4gICAgYzAwICs9IGEwMCAqIGIwMDtcbiAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICBjMDAgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMTYgKiBiMDA7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTAwICogYjE2O1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEzMiAqIGIwMDtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMTYgKiBiMTY7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTAwICogYjMyO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzQ4ICs9IGE0OCAqIGIwMCArIGEzMiAqIGIxNiArIGExNiAqIGIzMiArIGEwMCAqIGI0ODtcbiAgICBjNDggJj0gMHhGRkZGO1xuICAgIHJldHVybiBmcm9tQml0cyhjMTYgPDwgMTYgfCBjMDAsIGM0OCA8PCAxNiB8IGMzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtdWx0aXBseX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5tdWwgPSBMb25nUHJvdG90eXBlLm11bHRpcGx5O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgc3BlY2lmaWVkLiBUaGUgcmVzdWx0IGlzIHNpZ25lZCBpZiB0aGlzIExvbmcgaXMgc2lnbmVkIG9yXG4gICAqICB1bnNpZ25lZCBpZiB0aGlzIExvbmcgaXMgdW5zaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gZGl2aWRlKGRpdmlzb3IpIHtcbiAgICBpZiAoIWlzTG9uZyhkaXZpc29yKSkgZGl2aXNvciA9IGZyb21WYWx1ZShkaXZpc29yKTtcbiAgICBpZiAoZGl2aXNvci5pc1plcm8oKSkgdGhyb3cgRXJyb3IoJ2RpdmlzaW9uIGJ5IHplcm8nKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICAvLyBndWFyZCBhZ2FpbnN0IHNpZ25lZCBkaXZpc2lvbiBvdmVyZmxvdzogdGhlIGxhcmdlc3RcbiAgICAgIC8vIG5lZ2F0aXZlIG51bWJlciAvIC0xIHdvdWxkIGJlIDEgbGFyZ2VyIHRoYW4gdGhlIGxhcmdlc3RcbiAgICAgIC8vIHBvc2l0aXZlIG51bWJlciwgZHVlIHRvIHR3bydzIGNvbXBsZW1lbnQuXG4gICAgICBpZiAoIXRoaXMudW5zaWduZWQgJiYgdGhpcy5oaWdoID09PSAtMHg4MDAwMDAwMCAmJiBkaXZpc29yLmxvdyA9PT0gLTEgJiYgZGl2aXNvci5oaWdoID09PSAtMSkge1xuICAgICAgICAvLyBiZSBjb25zaXN0ZW50IHdpdGggbm9uLXdhc20gY29kZSBwYXRoXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICBcbiAgICAgIHZhciBsb3cgPSAodGhpcy51bnNpZ25lZCA/IHdhc21bXCJkaXZfdVwiXSA6IHdhc21bXCJkaXZfc1wiXSkodGhpcy5sb3csIHRoaXMuaGlnaCwgZGl2aXNvci5sb3csIGRpdmlzb3IuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgdmFyIGFwcHJveCwgcmVtLCByZXM7XG4gIFxuICAgIGlmICghdGhpcy51bnNpZ25lZCkge1xuICAgICAgLy8gVGhpcyBzZWN0aW9uIGlzIG9ubHkgcmVsZXZhbnQgZm9yIHNpZ25lZCBsb25ncyBhbmQgaXMgZGVyaXZlZCBmcm9tIHRoZVxuICAgICAgLy8gY2xvc3VyZSBsaWJyYXJ5IGFzIGEgd2hvbGUuXG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgIGlmIChkaXZpc29yLmVxKE9ORSkgfHwgZGl2aXNvci5lcShORUdfT05FKSkgcmV0dXJuIE1JTl9WQUxVRTsgLy8gcmVjYWxsIHRoYXQgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUVcbiAgICAgICAgZWxzZSBpZiAoZGl2aXNvci5lcShNSU5fVkFMVUUpKSByZXR1cm4gT05FO2Vsc2Uge1xuICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIGhhdmUgfG90aGVyfCA+PSAyLCBzbyB8dGhpcy9vdGhlcnwgPCB8TUlOX1ZBTFVFfC5cbiAgICAgICAgICB2YXIgaGFsZlRoaXMgPSB0aGlzLnNocigxKTtcbiAgICAgICAgICBhcHByb3ggPSBoYWxmVGhpcy5kaXYoZGl2aXNvcikuc2hsKDEpO1xuICBcbiAgICAgICAgICBpZiAoYXBwcm94LmVxKFpFUk8pKSB7XG4gICAgICAgICAgICByZXR1cm4gZGl2aXNvci5pc05lZ2F0aXZlKCkgPyBPTkUgOiBORUdfT05FO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW0gPSB0aGlzLnN1YihkaXZpc29yLm11bChhcHByb3gpKTtcbiAgICAgICAgICAgIHJlcyA9IGFwcHJveC5hZGQocmVtLmRpdihkaXZpc29yKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICBcbiAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgICBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yLm5lZygpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVnKCkuZGl2KGRpdmlzb3IpLm5lZygpO1xuICAgICAgfSBlbHNlIGlmIChkaXZpc29yLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMuZGl2KGRpdmlzb3IubmVnKCkpLm5lZygpO1xuICBcbiAgICAgIHJlcyA9IFpFUk87XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBhbGdvcml0aG0gYmVsb3cgaGFzIG5vdCBiZWVuIG1hZGUgZm9yIHVuc2lnbmVkIGxvbmdzLiBJdCdzIHRoZXJlZm9yZVxuICAgICAgLy8gcmVxdWlyZWQgdG8gdGFrZSBzcGVjaWFsIGNhcmUgb2YgdGhlIE1TQiBwcmlvciB0byBydW5uaW5nIGl0LlxuICAgICAgaWYgKCFkaXZpc29yLnVuc2lnbmVkKSBkaXZpc29yID0gZGl2aXNvci50b1Vuc2lnbmVkKCk7XG4gICAgICBpZiAoZGl2aXNvci5ndCh0aGlzKSkgcmV0dXJuIFVaRVJPO1xuICAgICAgaWYgKGRpdmlzb3IuZ3QodGhpcy5zaHJ1KDEpKSkgLy8gMTUgPj4+IDEgPSA3IDsgd2l0aCBkaXZpc29yID0gOCA7IHRydWVcbiAgICAgICAgcmV0dXJuIFVPTkU7XG4gICAgICByZXMgPSBVWkVSTztcbiAgICB9IC8vIFJlcGVhdCB0aGUgZm9sbG93aW5nIHVudGlsIHRoZSByZW1haW5kZXIgaXMgbGVzcyB0aGFuIG90aGVyOiAgZmluZCBhXG4gICAgLy8gZmxvYXRpbmctcG9pbnQgdGhhdCBhcHByb3hpbWF0ZXMgcmVtYWluZGVyIC8gb3RoZXIgKmZyb20gYmVsb3cqLCBhZGQgdGhpc1xuICAgIC8vIGludG8gdGhlIHJlc3VsdCwgYW5kIHN1YnRyYWN0IGl0IGZyb20gdGhlIHJlbWFpbmRlci4gIEl0IGlzIGNyaXRpY2FsIHRoYXRcbiAgICAvLyB0aGUgYXBwcm94aW1hdGUgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSByZWFsIHZhbHVlIHNvIHRoYXQgdGhlXG4gICAgLy8gcmVtYWluZGVyIG5ldmVyIGJlY29tZXMgbmVnYXRpdmUuXG4gIFxuICBcbiAgICByZW0gPSB0aGlzO1xuICBcbiAgICB3aGlsZSAocmVtLmd0ZShkaXZpc29yKSkge1xuICAgICAgLy8gQXBwcm94aW1hdGUgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbi4gVGhpcyBtYXkgYmUgYSBsaXR0bGUgZ3JlYXRlciBvclxuICAgICAgLy8gc21hbGxlciB0aGFuIHRoZSBhY3R1YWwgdmFsdWUuXG4gICAgICBhcHByb3ggPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHJlbS50b051bWJlcigpIC8gZGl2aXNvci50b051bWJlcigpKSk7IC8vIFdlIHdpbGwgdHdlYWsgdGhlIGFwcHJveGltYXRlIHJlc3VsdCBieSBjaGFuZ2luZyBpdCBpbiB0aGUgNDgtdGggZGlnaXQgb3JcbiAgICAgIC8vIHRoZSBzbWFsbGVzdCBub24tZnJhY3Rpb25hbCBkaWdpdCwgd2hpY2hldmVyIGlzIGxhcmdlci5cbiAgXG4gICAgICB2YXIgbG9nMiA9IE1hdGguY2VpbChNYXRoLmxvZyhhcHByb3gpIC8gTWF0aC5MTjIpLFxuICAgICAgICAgIGRlbHRhID0gbG9nMiA8PSA0OCA/IDEgOiBwb3dfZGJsKDIsIGxvZzIgLSA0OCksXG4gICAgICAgICAgLy8gRGVjcmVhc2UgdGhlIGFwcHJveGltYXRpb24gdW50aWwgaXQgaXMgc21hbGxlciB0aGFuIHRoZSByZW1haW5kZXIuICBOb3RlXG4gICAgICAvLyB0aGF0IGlmIGl0IGlzIHRvbyBsYXJnZSwgdGhlIHByb2R1Y3Qgb3ZlcmZsb3dzIGFuZCBpcyBuZWdhdGl2ZS5cbiAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94KSxcbiAgICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsKGRpdmlzb3IpO1xuICBcbiAgICAgIHdoaWxlIChhcHByb3hSZW0uaXNOZWdhdGl2ZSgpIHx8IGFwcHJveFJlbS5ndChyZW0pKSB7XG4gICAgICAgIGFwcHJveCAtPSBkZWx0YTtcbiAgICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gsIHRoaXMudW5zaWduZWQpO1xuICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsKGRpdmlzb3IpO1xuICAgICAgfSAvLyBXZSBrbm93IHRoZSBhbnN3ZXIgY2FuJ3QgYmUgemVyby4uLiBhbmQgYWN0dWFsbHksIHplcm8gd291bGQgY2F1c2VcbiAgICAgIC8vIGluZmluaXRlIHJlY3Vyc2lvbiBzaW5jZSB3ZSB3b3VsZCBtYWtlIG5vIHByb2dyZXNzLlxuICBcbiAgXG4gICAgICBpZiAoYXBwcm94UmVzLmlzWmVybygpKSBhcHByb3hSZXMgPSBPTkU7XG4gICAgICByZXMgPSByZXMuYWRkKGFwcHJveFJlcyk7XG4gICAgICByZW0gPSByZW0uc3ViKGFwcHJveFJlbSk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gcmVzO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2RpdmlkZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZGl2ID0gTG9uZ1Byb3RvdHlwZS5kaXZpZGU7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubW9kdWxvID0gZnVuY3Rpb24gbW9kdWxvKGRpdmlzb3IpIHtcbiAgICBpZiAoIWlzTG9uZyhkaXZpc29yKSkgZGl2aXNvciA9IGZyb21WYWx1ZShkaXZpc29yKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wicmVtX3VcIl0gOiB3YXNtW1wicmVtX3NcIl0pKHRoaXMubG93LCB0aGlzLmhpZ2gsIGRpdmlzb3IubG93LCBkaXZpc29yLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHRoaXMuc3ViKHRoaXMuZGl2KGRpdmlzb3IpLm11bChkaXZpc29yKSk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5tb2QgPSBMb25nUHJvdG90eXBlLm1vZHVsbztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucmVtID0gTG9uZ1Byb3RvdHlwZS5tb2R1bG87XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIE5PVCBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubm90ID0gZnVuY3Rpb24gbm90KCkge1xuICAgIHJldHVybiBmcm9tQml0cyh+dGhpcy5sb3csIH50aGlzLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCBsZWFkaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uIGNvdW50TGVhZGluZ1plcm9zKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPyBNYXRoLmNsejMyKHRoaXMuaGlnaCkgOiBNYXRoLmNsejMyKHRoaXMubG93KSArIDMyO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCBsZWFkaW5nIHplcm9zLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvdW50TGVhZGluZ1plcm9zfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNseiA9IExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3M7XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IHRyYWlsaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmNvdW50VHJhaWxpbmdaZXJvcyA9IGZ1bmN0aW9uIGNvdW50VHJhaWxpbmdaZXJvcygpIHtcbiAgICByZXR1cm4gdGhpcy5sb3cgPyBjdHozMih0aGlzLmxvdykgOiBjdHozMih0aGlzLmhpZ2gpICsgMzI7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IHRyYWlsaW5nIHplcm9zLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvdW50VHJhaWxpbmdaZXJvc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jdHogPSBMb25nUHJvdG90eXBlLmNvdW50VHJhaWxpbmdaZXJvcztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgQU5EIG9mIHRoaXMgTG9uZyBhbmQgdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuYW5kID0gZnVuY3Rpb24gYW5kKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ICYgb3RoZXIubG93LCB0aGlzLmhpZ2ggJiBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUub3IgPSBmdW5jdGlvbiBvcihvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyB8IG90aGVyLmxvdywgdGhpcy5oaWdoIHwgb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIFhPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBnaXZlbiBvbmUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS54b3IgPSBmdW5jdGlvbiB4b3Iob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgXiBvdGhlci5sb3csIHRoaXMuaGlnaCBeIG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0TGVmdCA9IGZ1bmN0aW9uIHNoaWZ0TGVmdChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztlbHNlIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBudW1CaXRzLCB0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiAzMiAtIG51bUJpdHMsIHRoaXMudW5zaWduZWQpO2Vsc2UgcmV0dXJuIGZyb21CaXRzKDAsIHRoaXMubG93IDw8IG51bUJpdHMgLSAzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0TGVmdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNobCA9IExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0KG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO2Vsc2UgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ID4+PiBudW1CaXRzIHwgdGhpcy5oaWdoIDw8IDMyIC0gbnVtQml0cywgdGhpcy5oaWdoID4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO2Vsc2UgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA+PiBudW1CaXRzIC0gMzIsIHRoaXMuaGlnaCA+PSAwID8gMCA6IC0xLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHIgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZCA9IGZ1bmN0aW9uIHNoaWZ0UmlnaHRVbnNpZ25lZChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPj4+IG51bUJpdHMgfCB0aGlzLmhpZ2ggPDwgMzIgLSBudW1CaXRzLCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgMCwgdGhpcy51bnNpZ25lZCk7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA+Pj4gbnVtQml0cyAtIDMyLCAwLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0VW5zaWduZWR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHJ1ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHJfdSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucm90YXRlTGVmdCA9IGZ1bmN0aW9uIHJvdGF0ZUxlZnQobnVtQml0cykge1xuICAgIHZhciBiO1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gIFxuICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgbnVtQml0cyB8IHRoaXMuaGlnaCA+Pj4gYiwgdGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gYiwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBudW1CaXRzIC09IDMyO1xuICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IGIsIHRoaXMubG93IDw8IG51bUJpdHMgfCB0aGlzLmhpZ2ggPj4+IGIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVMZWZ0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUucm90bCA9IExvbmdQcm90b3R5cGUucm90YXRlTGVmdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodCA9IGZ1bmN0aW9uIHJvdGF0ZVJpZ2h0KG51bUJpdHMpIHtcbiAgICB2YXIgYjtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgdGhpcy5sb3csIHRoaXMudW5zaWduZWQpO1xuICBcbiAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA8PCBiIHwgdGhpcy5sb3cgPj4+IG51bUJpdHMsIHRoaXMubG93IDw8IGIgfCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgbnVtQml0cyAtPSAzMjtcbiAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBiIHwgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLmhpZ2ggPDwgYiB8IHRoaXMubG93ID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3JvdGF0ZVJpZ2h0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUucm90ciA9IExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQ7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2lnbmVkIGxvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnRvU2lnbmVkID0gZnVuY3Rpb24gdG9TaWduZWQoKSB7XG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3csIHRoaXMuaGlnaCwgZmFsc2UpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIHVuc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gVW5zaWduZWQgbG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvVW5zaWduZWQgPSBmdW5jdGlvbiB0b1Vuc2lnbmVkKCkge1xuICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3csIHRoaXMuaGlnaCwgdHJ1ZSk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBCeXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlcyA9IGZ1bmN0aW9uIHRvQnl0ZXMobGUpIHtcbiAgICByZXR1cm4gbGUgPyB0aGlzLnRvQnl0ZXNMRSgpIDogdGhpcy50b0J5dGVzQkUoKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgbGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IExpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXNMRSA9IGZ1bmN0aW9uIHRvQnl0ZXNMRSgpIHtcbiAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgcmV0dXJuIFtsbyAmIDB4ZmYsIGxvID4+PiA4ICYgMHhmZiwgbG8gPj4+IDE2ICYgMHhmZiwgbG8gPj4+IDI0LCBoaSAmIDB4ZmYsIGhpID4+PiA4ICYgMHhmZiwgaGkgPj4+IDE2ICYgMHhmZiwgaGkgPj4+IDI0XTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IEJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXNCRSA9IGZ1bmN0aW9uIHRvQnl0ZXNCRSgpIHtcbiAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgcmV0dXJuIFtoaSA+Pj4gMjQsIGhpID4+PiAxNiAmIDB4ZmYsIGhpID4+PiA4ICYgMHhmZiwgaGkgJiAweGZmLCBsbyA+Pj4gMjQsIGxvID4+PiAxNiAmIDB4ZmYsIGxvID4+PiA4ICYgMHhmZiwgbG8gJiAweGZmXTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCeXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gbGUgV2hldGhlciBsaXR0bGUgb3IgYmlnIGVuZGlhbiwgZGVmYXVsdHMgdG8gYmlnIGVuZGlhblxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlcyA9IGZ1bmN0aW9uIGZyb21CeXRlcyhieXRlcywgdW5zaWduZWQsIGxlKSB7XG4gICAgcmV0dXJuIGxlID8gTG9uZy5mcm9tQnl0ZXNMRShieXRlcywgdW5zaWduZWQpIDogTG9uZy5mcm9tQnl0ZXNCRShieXRlcywgdW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgbGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXNMRSA9IGZ1bmN0aW9uIGZyb21CeXRlc0xFKGJ5dGVzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhieXRlc1swXSB8IGJ5dGVzWzFdIDw8IDggfCBieXRlc1syXSA8PCAxNiB8IGJ5dGVzWzNdIDw8IDI0LCBieXRlc1s0XSB8IGJ5dGVzWzVdIDw8IDggfCBieXRlc1s2XSA8PCAxNiB8IGJ5dGVzWzddIDw8IDI0LCB1bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBiaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlc0JFID0gZnVuY3Rpb24gZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGJ5dGVzWzRdIDw8IDI0IHwgYnl0ZXNbNV0gPDwgMTYgfCBieXRlc1s2XSA8PCA4IHwgYnl0ZXNbN10sIGJ5dGVzWzBdIDw8IDI0IHwgYnl0ZXNbMV0gPDwgMTYgfCBieXRlc1syXSA8PCA4IHwgYnl0ZXNbM10sIHVuc2lnbmVkKTtcbiAgfTtcbiAgXG4gIHZhciBfZGVmYXVsdCA9IExvbmc7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xuICByZXR1cm4gXCJkZWZhdWx0XCIgaW4gZXhwb3J0cyA/IGV4cG9ydHMuZGVmYXVsdCA6IGV4cG9ydHM7XG59KSh7fSk7XG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gTG9uZzsgfSk7XG5lbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIG1vZHVsZS5leHBvcnRzID0gTG9uZztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJcbmNvbnN0IGFwaSA9IHJlcXVpcmUoJ0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYi93b3JrZXItaW50ZXJmYWNlLmpzJyk7XG5leHBvcnRzLmFwaSA9IGFwaTtcblxuY29uc3QgeyBvdmVycmlkZUdsb2JhbHMgfSA9IHJlcXVpcmUoJ0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYi9nbG9iYWwtb3ZlcnJpZGVzLmpzJyk7XG5vdmVycmlkZUdsb2JhbHMoKTtcblxuZXhwb3J0cy5pbXBvcnRXb3JrZmxvd3MgPSBmdW5jdGlvbiBpbXBvcnRXb3JrZmxvd3MoKSB7XG4gIHJldHVybiByZXF1aXJlKC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3JlcGxheS0yMDI0LWRlbW8vZ2FtZS9zcmMvd29ya2Zsb3dzLnRzXCIpO1xufVxuXG5leHBvcnRzLmltcG9ydEludGVyY2VwdG9ycyA9IGZ1bmN0aW9uIGltcG9ydEludGVyY2VwdG9ycygpIHtcbiAgcmV0dXJuIFtcbiAgICBcbiAgXTtcbn1cbiJdLCJuYW1lcyI6WyJwcm94eUFjdGl2aXRpZXMiLCJwcm94eUxvY2FsQWN0aXZpdGllcyIsImRlZmluZVNpZ25hbCIsInNldEhhbmRsZXIiLCJjb25kaXRpb24iLCJsb2ciLCJzdGFydENoaWxkIiwic2xlZXAiLCJnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlIiwiZGVmaW5lUXVlcnkiLCJjb250aW51ZUFzTmV3IiwiUGFyZW50Q2xvc2VQb2xpY3kiLCJBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUiLCJDYW5jZWxsYXRpb25TY29wZSIsImlzQ2FuY2VsbGF0aW9uIiwiUk9VTkRfV0ZfSUQiLCJBUFBMRV9QT0lOVFMiLCJTTkFLRV9NT1ZFU19CRUZPUkVfQ0FOIiwiU05BS0VfV09SS0VSX0RPV05fVElNRSIsImVtaXQiLCJzdGFydFRvQ2xvc2VUaW1lb3V0Iiwic25ha2VXb3JrZXIiLCJ0YXNrUXVldWUiLCJoZWFydGJlYXRUaW1lb3V0IiwiY2FuY2VsbGF0aW9uVHlwZSIsIldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCIsInJhbmRvbURpcmVjdGlvbiIsImRpcmVjdGlvbnMiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJvcHBvc2l0ZURpcmVjdGlvbiIsImRpcmVjdGlvbiIsImdhbWVTdGF0ZVF1ZXJ5Iiwicm91bmRTdGF0ZVF1ZXJ5IiwiZ2FtZUZpbmlzaFNpZ25hbCIsInJvdW5kU3RhcnRTaWduYWwiLCJzbmFrZUNoYW5nZURpcmVjdGlvblNpZ25hbCIsInNuYWtlTW92ZVNpZ25hbCIsIndvcmtlclN0b3BTaWduYWwiLCJ3b3JrZXJTdGFydGVkU2lnbmFsIiwiR2FtZVdvcmtmbG93IiwiY29uZmlnIiwiaW5mbyIsImdhbWUiLCJ0ZWFtcyIsInRlYW1OYW1lcyIsInJlZHVjZSIsImFjYyIsIm5hbWUiLCJzY29yZSIsImZpbmlzaGVkIiwicm91bmRTY29wZSIsImNhbmNlbCIsIm5ld1JvdW5kIiwiZHVyYXRpb24iLCJzbmFrZXMiLCJidWlsZFJvdW5kVGVhbXMiLCJ1bmRlZmluZWQiLCJydW4iLCJyb3VuZFdmIiwiUm91bmRXb3JrZmxvdyIsIndvcmtmbG93SWQiLCJhcmdzIiwicGFyZW50Q2xvc2VQb2xpY3kiLCJQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMIiwicm91bmQiLCJyZXN1bHQiLCJ0ZWFtIiwiT2JqZWN0IiwidmFsdWVzIiwiZXJyIiwiYXBwbGVzIiwic25ha2UiLCJpZCIsInNuYWtlTW92ZXMiLCJ3b3JrZXJzU3RhcnRlZCIsInB1c2giLCJpZGVudGl0eSIsInJhbmRvbUVtcHR5UG9pbnQiLCJwcm9jZXNzU2lnbmFscyIsImV2ZW50cyIsImFwcGxlc0VhdGVuIiwic2lnbmFscyIsIm1vdmUiLCJtb3ZlU25ha2UiLCJ0eXBlIiwicGF5bG9hZCIsInNuYWtlSWQiLCJzZWdtZW50cyIsImF0ZUFwcGxlSWQiLCJ0ZWFtTmFtZSIsImFwcGxlSWQiLCJraWxsV29ya2VycyIsIndvcmtlciIsInNpZ25hbCIsIndvcmtlcklkIiwiUHJvbWlzZSIsImFsbCIsInJhbmRvbWl6ZVJvdW5kIiwid29ya2VyQ291bnQiLCJzdGFydFdvcmtlck1hbmFnZXJzIiwic3RhcnRTbmFrZXMiLCJzdGFydGVkQXQiLCJEYXRlIiwibm93IiwicmFjZSIsImN1cnJlbnQiLCJjYW5jZWxSZXF1ZXN0ZWQiLCJ0aGVuIiwiY2F0Y2giLCJmaW5hbGx5Iiwibm9uQ2FuY2VsbGFibGUiLCJTbmFrZVdvcmtlcldvcmtmbG93Iiwicm91bmRJZCIsInNjb3BlIiwiZSIsIlNuYWtlV29ya2Zsb3ciLCJub21zUGVyTW92ZSIsIm5vbUFjdGl2aXR5Iiwibm9tRHVyYXRpb24iLCJuZXdEaXJlY3Rpb24iLCJzbmFrZU5vbSIsIm5vbXMiLCJBcnJheSIsImZyb20iLCJtb3ZlcyIsIm1hcCIsImhlYWRTZWdtZW50IiwidGFpbFNlZ21lbnQiLCJjdXJyZW50RGlyZWN0aW9uIiwiY3VycmVudEhlYWQiLCJoZWFkIiwiYWdhaW5zdEFuRWRnZSIsIngiLCJ5IiwidW5zaGlmdCIsIm5ld0hlYWQiLCJoZWlnaHQiLCJ3aWR0aCIsInNuYWtlQXQiLCJhcHBsZUF0IiwicG9wIiwicG9pbnQiLCJhcHBsZSIsImVudHJpZXMiLCJjYWxjdWxhdGVQb3NpdGlvbiIsInNlZ21lbnQiLCJzdGFydCIsInQiLCJiIiwibCIsInIiLCJwb3MiLCJjZWlsIiwiY291bnQiLCJzbmFrZVdvcmtlck1hbmFnZXJzIiwiXyIsImkiLCJjb21tYW5kcyJdLCJzb3VyY2VSb290IjoiIn0=